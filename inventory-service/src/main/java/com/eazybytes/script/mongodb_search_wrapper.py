#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MongoDB Search Wrapper Script
Wrapper script để gọi MongoDB search từ Java application
"""

import sys
import json
import argparse
import os
import re
from typing import Dict, List, Any
import traceback

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import required modules
try:
    import pymongo
    from pymongo import MongoClient
    from llama_index.llms.openai import OpenAI
    from dotenv import load_dotenv
except ImportError as e:
    print(json.dumps({
        "success": False,
        "product_ids": [],
        "search_info": {
            "error": f"Import error: {str(e)}",
            "search_method": "Import Error"
        }
    }), file=sys.stderr)
    sys.exit(1)

# Load environment variables
load_dotenv()

# Initialize LLM
try:
    llm = OpenAI(
        model="gpt-4o-mini",
        api_key=os.getenv("OPENAI_API_KEY"),
    )
except Exception as e:
    llm = None

# MongoDB connection helper
class MongoDBConnection:
    def __init__(self):
        self.client = None
        self.db = None
        
    def connect(self):
        try:
            # MongoDB connection configuration
            self.client = MongoClient(
                host="mongodb",
                port=27017,
                username="admin",
                password="password",
                authSource='admin',
                authMechanism='SCRAM-SHA-1'
            )
            self.db = self.client["products"]
            return self.db
        except Exception as e:
            print(f"MongoDB connection error: {e}", file=sys.stderr)
            return None
    
    def get_collection(self, collection_name):
        if self.db is None:
            return None
        return self.db[collection_name]
    
    def disconnect(self):
        if self.client:
            self.client.close()

# Global MongoDB connection
mongodb = MongoDBConnection()

def mongodb_search_specific_requirements_get_product_ids(query: str, device_type: str, top_k: int = 100) -> Dict[str, Any]:
    """
    Sử dụng LLM để phân tích specific requirements và tạo câu truy vấn MongoDB thông minh.
    Bao gồm xử lý trường release cho sản phẩm mới nhất.
    
    Args:
        query: Chuỗi tìm kiếm (specific requirements)
        device_type: Loại thiết bị
        top_k: Số lượng kết quả tối đa
        
    Returns:
        Dict[str, Any]: {
            "product_ids": List[str], 
            "search_info": Dict với thông tin về conditions đã áp dụng,
            "success": bool
        }
    """
    try:
        # Device type mappings
        device_type_to_class = {
            "laptop": "com.eazybytes.model.Laptop",
            "phone": "com.eazybytes.model.Phone", 
            "wireless_earphone": "com.eazybytes.model.WirelessEarphone",
            "wired_earphone": "com.eazybytes.model.WiredEarphone",
            "headphone": "com.eazybytes.model.Headphone",
            "backup_charger": "com.eazybytes.model.BackupCharger"
        }
        
        all_fields_by_class = {
            "laptop": [
                # CPU và hiệu năng
                "processorModel", "coreCount", "threadCount", "cpuSpeed", "maxCpuSpeed",
                # RAM
                "ram", "ramType", "ramBusSpeed", "maxRam",
                # Storage
                "storage", 
                # Màn hình
                "screenSize", "resolution", "refreshRate", "colorGamut", "displayTechnology",
                # Card đồ họa
                "graphicCard",
                # Audio và kết nối
                "audioTechnology", "ports", "wirelessConnectivity", "webcam",
                # Tính năng khác
                "otherFeatures", "keyboardBacklight",
                # Thiết kế và pin
                "size", "material", "battery", "os",
                # Thông tin cơ bản và ra mắt
                "brand", "productName", "description", "release"
            ],
            "phone": [
                # Cấu hình cơ bản
                "ram", "storage", "availableStorage", "processor", "cpuSpeed", "gpu", "os",
                # Camera
                "rearCameraResolution", "frontCameraResolution", "rearCameraFeatures", "frontCameraFeatures", 
                "rearVideoRecording", "rearFlash",
                # Màn hình
                "screenSize", "displayTechnology", "displayResolution", "maxBrightness", "screenProtection",
                # Pin và sạc
                "batteryType", "maxChargingPower", "batteryFeatures",
                # Kết nối
                "mobileNetwork", "simType", "wifi", "bluetooth", "gps", "headphoneJack", "otherConnectivity",
                # Bảo mật và tính năng
                "securityFeatures", "specialFeatures", "waterResistance",
                # Media
                "recording", "video", "audio",
                # Thiết kế
                "designType", "materials", "sizeWeight",
                # Thông tin cơ bản và ra mắt
                "brand", "productName", "description", "release"
            ],
            "wireless_earphone": [
                # Pin và sạc
                "batteryLife", "chargingCaseBatteryLife", "chargingPort",
                # Âm thanh và kết nối
                "audioTechnology", "connectionTechnology", "simultaneousConnections",
                # Tương thích và ứng dụng
                "compatibility", "connectionApp",
                # Tính năng và điều khiển
                "features", "controlType", "controlButtons",
                # Thông số vật lý
                "size",
                # Xuất xứ
                "brandOrigin", "manufactured",
                # Thông tin cơ bản và ra mắt
                "brand", "productName", "description", "release"
            ],
            "wired_earphone": [
                # Kết nối và âm thanh
                "audioJack", "cableLength", "simultaneousConnections",
                # Tương thích
                "compatibility",
                # Tính năng và điều khiển
                "features", "controlType", "controlButtons",
                # Thông số vật lý
                "weight",
                # Xuất xứ
                "brandOrigin", "manufactured",
                # Thông tin cơ bản và ra mắt
                "brand", "productName", "description", "release"
            ],
            "headphone": [
                # Pin và sạc
                "batteryLife", "chargingPort",
                # Kết nối và âm thanh
                "audioJack", "connectionTechnology", "simultaneousConnections",
                # Tương thích
                "compatibility",
                # Tính năng và điều khiển
                "features", "controlType", "controlButtons",
                # Thông số vật lý
                "size", "weight",
                # Xuất xứ
                "brandOrigin", "manufactured",
                # Thông tin cơ bản và ra mắt
                "brand", "productName", "description", "release"
            ],
            "backup_charger": [
                # Pin và công suất
                "batteryCapacity", "batteryCellType",
                # Sạc và kết nối
                "input", "output", "chargingTime",
                # Tính năng công nghệ
                "technologyFeatures",
                # Thông số vật lý
                "size", "weight",
                # Xuất xứ
                "brandOrigin", "manufactured",
                # Thông tin cơ bản và ra mắt
                "brand", "productName", "description", "release"
            ]
        }
        
        # **BƯỚC 1: Sử dụng LLM để phân tích specific requirements**
        device_fields = all_fields_by_class.get(device_type.lower(), [])
        
        llm_prompt = f"""
Phân tích specific requirements và tạo MongoDB query cho {device_type}.

SPECIFIC REQUIREMENTS: "{query}"

Các fields có sẵn cho {device_type}: {device_fields}

FIELD TYPES FOR {device_type.upper()}:

COMMON FIELDS FOR ALL DEVICES:
- release: String field chứa thời gian ra mắt sản phẩm, có các format:
  * "2024", "2023", "2025" (chỉ năm)
  * "09/2024", "01/2025", "03/2025" (tháng/năm)
  * Để sort theo thời gian mới nhất, dùng sort với order: "desc"

LAPTOP FIELDS:
- Numeric: ram, maxRam, ramBusSpeed, coreCount, threadCount, refreshRate, battery
- String: processorModel, cpuSpeed, maxCpuSpeed, ramType, screenSize, resolution, graphicCard, webcam, keyboardBacklight, size, material, os, brand, productName, description, release
- Arrays: storage, colorGamut, displayTechnology, audioTechnology, ports, wirelessConnectivity, otherFeatures

PHONE FIELDS:
- Numeric: ram, storage, availableStorage, maxBrightness, maxChargingPower
- String: processor, cpuSpeed, gpu, os, displayTechnology, displayResolution, screenSize, batteryType, mobileNetwork, simType, headphoneJack, waterResistance, designType, materials, sizeWeight, brand, productName, description, release
- Arrays: rearCameraFeatures, frontCameraFeatures, rearVideoRecording, batteryFeatures, securityFeatures, specialFeatures, recording, video, audio, wifi, bluetooth, gps, otherConnectivity

WIRELESS_EARPHONE FIELDS:
- Numeric: (extracted from batteryLife, chargingCaseBatteryLife)
- String: batteryLife, chargingCaseBatteryLife, simultaneousConnections, size, brandOrigin, manufactured, brand, productName, description, release
- Arrays: chargingPort, audioTechnology, compatibility, connectionApp, features, connectionTechnology, controlType, controlButtons

BACKUP_CHARGER FIELDS:
- Numeric: batteryCapacity, weight (extracted from capacity and weight values)
- String: batteryCellType, size, brandOrigin, manufactured, brand, productName, description, release
- Arrays: input, output, chargingTime, technologyFeatures

HEADPHONE FIELDS:
- Numeric: weight (extracted from batteryLife)
- String: batteryLife, chargingPort, audioJack, simultaneousConnections, size, brandOrigin, manufactured, brand, productName, description, release
- Arrays: connectionTechnology, compatibility, features, controlType, controlButtons

WIRED_EARPHONE FIELDS:
- Numeric: weight
- String: audioJack, cableLength, simultaneousConnections, brandOrigin, manufactured, brand, productName, description, release
- Arrays: compatibility, features, controlType, controlButtons

Trả về JSON:
{{
    "conditions": [
        {{
            "field": "field_name",
            "operator": "eq|gte|lte|gt|lt|regex|in|elemMatch|max|min",
            "value": "search_value",
            "type": "string|number|array",
            "is_array": true/false
        }}
    ],
    "sort_fields": [
        {{
            "field": "field_name",
            "order": "desc|asc",
            "priority": 1
        }}
    ],
    "text_search_fields": ["field1", "field2"],
    "text_search_keywords": ["keyword1", "keyword2"]
}}

Rules:
1. Với numeric fields (RAM, storage, core count, thread count, speed): dùng numeric operators (gte, lte, gt, lt)
2. Với string fields (processor, brand, model, graphic card): dùng regex
3. Với array fields (storage options, display tech, ports, connectivity): dùng elemMatch hoặc in
4. Trích xuất số từ text: "32GB" → value: 32, type: "number"
5. Laptop specs: "RTX 4070" → field: "graphicCard", operator: "regex", value: "RTX 4070"
6. Phone camera specs: "48MP" → field: "rearCameraResolution", operator: "regex", value: "48 MP"
7. Features trong array: "OIS" → field: "rearCameraFeatures", operator: "elemMatch", value: "OIS", is_array: true
8. Laptop ports: "USB-C" → field: "ports", operator: "elemMatch", value: "USB Type-C", is_array: true

9. **XỬ LÝ RELEASE/THỜI GIAN RA MẮT:**
   - "mới nhất", "ra mắt gần đây", "sản phẩm mới", "model mới" → sort_fields với field: "release", order: "desc"
   - "2024", "năm 2024" → field: "release", operator: "regex", value: "2024"
   - "2025", "năm 2025" → field: "release", operator: "regex", value: "2025"
   - "tháng 9 2024", "09/2024" → field: "release", operator: "regex", value: "09/2024"
   - Nếu chỉ muốn sort theo mới nhất mà không filter năm cụ thể, chỉ dùng sort_fields

10. **XỬ LÝ MIN/MAX:**
   - "pin cao nhất", "camera tốt nhất", "hiệu năng cao nhất" → sort_fields với order: "desc"
   - "giá rẻ nhất", "nhẹ nhất", "nhỏ nhất" → sort_fields với order: "asc"
   - Không cần conditions cho min/max, chỉ cần sort_fields

11. text_search_keywords: các từ khóa quan trọng để tìm kiếm full-text

Ví dụ với release:
Input: "laptop gaming mới nhất 2024"
Output: {{
    "conditions": [
        {{"field": "graphicCard", "operator": "regex", "value": "RTX|GTX", "type": "string", "is_array": false}},
        {{"field": "release", "operator": "regex", "value": "2024", "type": "string", "is_array": false}}
    ],
    "sort_fields": [
        {{"field": "release", "order": "desc", "priority": 1}},
        {{"field": "ram", "order": "desc", "priority": 2}}
    ],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["gaming", "mới nhất", "2024"]
}}

Input: "điện thoại mới nhất"
Output: {{
    "conditions": [],
    "sort_fields": [
        {{"field": "release", "order": "desc", "priority": 1}}
    ],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["mới nhất"]
}}

Input: "iPhone ra mắt tháng 9 2024"
Output: {{
    "conditions": [
        {{"field": "brand", "operator": "regex", "value": "iPhone", "type": "string", "is_array": false}},
        {{"field": "release", "operator": "regex", "value": "09/2024", "type": "string", "is_array": false}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["iPhone", "09/2024"]
}}

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH.
"""

        if llm is None:
            return mongodb_search_fallback_keywords(query, device_type, top_k)

        try:
            llm_response = llm.complete(llm_prompt)
        except Exception as e:
            print(f"LLM error: {e}", file=sys.stderr)
            return mongodb_search_fallback_keywords(query, device_type, top_k)
        
        # Parse LLM response
        response_text = llm_response.text.strip()
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            return mongodb_search_fallback_keywords(query, device_type, top_k)
        
        try:
            llm_analysis = json.loads(json_match.group())
        except json.JSONDecodeError as e:
            return mongodb_search_fallback_keywords(query, device_type, top_k)
        
        # **BƯỚC 2: Kết nối MongoDB**
        db = mongodb.connect()
        if db is None:
            return {
                "product_ids": [],
                "search_info": {
                    "search_method": "MongoDB Connection Error",
                    "error": "Cannot connect to MongoDB"
                },
                "success": False
            }
        
        collection = mongodb.get_collection("baseProduct")
        if collection is None:
            return {
                "product_ids": [],
                "search_info": {
                    "search_method": "MongoDB Collection Error",
                    "error": "Cannot find baseProduct collection"
                },
                "success": False
            }
        
        # **BƯỚC 3: Xây dựng MongoDB query từ LLM analysis**
        base_filter = {}
        if device_type in device_type_to_class:
            base_filter["_class"] = device_type_to_class[device_type]
        
        # Xử lý conditions từ LLM
        match_conditions = [base_filter] if base_filter else []
        applied_conditions = []  # Track applied conditions for user display
        
        for condition in llm_analysis.get("conditions", []):
            field = condition.get("field")
            operator = condition.get("operator")
            value = condition.get("value")
            value_type = condition.get("type", "string")
            is_array = condition.get("is_array", False)
            
            if not all([field, operator, value]):
                continue
            
            # Convert value type
            original_value = value  # Keep original for display
            if value_type == "number":
                try:
                    if isinstance(value, str):
                        numbers = re.findall(r'(\d+(?:\.\d+)?)', str(value))
                        if numbers:
                            value = float(numbers[0])
                        else:
                            continue
                    else:
                        value = float(value)
                except (ValueError, TypeError):
                    continue
            
            # Track applied condition for display
            condition_desc = {
                "field": field,
                "operator": operator,
                "value": original_value,
                "type": value_type,
                "is_array": is_array
            }
            applied_conditions.append(condition_desc)
            
            # **XỬ LÝ ĐẶC BIỆT CHO TRƯỜNG RELEASE**
            if field == "release":
                if operator == "regex":
                    # Xử lý các pattern release khác nhau
                    release_pattern = str(value)
                    
                    # Check if it's year only (2024, 2025)
                    if re.match(r'^\d{4}$', release_pattern):
                        # Tìm tất cả format chứa năm này: "2024", "09/2024", "01/2024", etc.
                        match_conditions.append({
                            field: {
                                "$regex": f"(^{release_pattern}$|/{release_pattern}$)",
                                "$options": "i"
                            }
                        })
                    # Check if it's month/year format (09/2024)
                    elif re.match(r'^\d{2}/\d{4}$', release_pattern):
                        match_conditions.append({
                            field: {
                                "$regex": f"^{re.escape(release_pattern)}$",
                                "$options": "i"
                            }
                        })
                    else:
                        # General regex
                        match_conditions.append({
                            field: {"$regex": release_pattern, "$options": "i"}
                        })
                else:
                    # Fallback for other operators
                    match_conditions.append({field: {"$regex": str(value), "$options": "i"}})
                continue
            
            # Xây dựng MongoDB condition cho các field khác
            if operator == "elemMatch":
                # Xử lý array fields với $elemMatch
                if is_array:
                    match_conditions.append({
                        field: {
                            "$elemMatch": {
                                "$regex": str(value),
                                "$options": "i"
                            }
                        }
                    })
                else:
                    # Fallback cho non-array
                    match_conditions.append({field: {"$regex": str(value), "$options": "i"}})
                    
            elif operator == "eq":
                if is_array:
                    # Cho array fields, tìm element chứa giá trị
                    match_conditions.append({field: {"$elemMatch": {"$regex": str(value), "$options": "i"}}})
                elif value_type == "number":
                    match_conditions.append({
                        "$expr": {
                            "$eq": [
                                {
                                    "$convert": {
                                        "input": {
                                            "$arrayElemAt": [
                                                {
                                                    "$map": {
                                                        "input": {"$regexFindAll": {"input": f"${field}", "regex": r"(\d+(?:\.\d+)?)"}},
                                                        "as": "match",
                                                        "in": "$$match.match"
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        "to": "double",
                                        "onError": 0
                                    }
                                },
                                value
                            ]
                        }
                    })
                else:
                    match_conditions.append({field: {"$regex": f"^{re.escape(str(value))}$", "$options": "i"}})
                    
            elif operator in ["gte", "gt", "lte", "lt"]:
                if is_array:
                    # Array fields không support numeric comparison trực tiếp
                    match_conditions.append({field: {"$elemMatch": {"$regex": str(value), "$options": "i"}}})
                elif value_type == "number":
                    comparison_op = f"${operator}"
                    match_conditions.append({
                        "$expr": {
                            comparison_op: [
                                {
                                    "$convert": {
                                        "input": {
                                            "$arrayElemAt": [
                                                {
                                                    "$map": {
                                                        "input": {"$regexFindAll": {"input": f"${field}", "regex": r"(\d+(?:\.\d+)?)"}},
                                                        "as": "match",
                                                        "in": "$$match.match"
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        "to": "double",
                                        "onError": 0
                                    }
                                },
                                value
                            ]
                        }
                    })
                else:
                    match_conditions.append({field: {f"${operator}": value}})
                    
            elif operator == "regex":
                if is_array:
                    match_conditions.append({field: {"$elemMatch": {"$regex": str(value), "$options": "i"}}})
                else:
                    match_conditions.append({field: {"$regex": str(value), "$options": "i"}})
                
            elif operator == "in":
                values_list = value if isinstance(value, list) else [value]
                if is_array:
                    # Cho array fields, tìm element nào đó trong array chứa một trong các values
                    array_conditions = []
                    for val in values_list:
                        array_conditions.append({field: {"$elemMatch": {"$regex": str(val), "$options": "i"}}})
                    if len(array_conditions) == 1:
                        match_conditions.append(array_conditions[0])
                    else:
                        match_conditions.append({"$or": array_conditions})
                else:
                    match_conditions.append({field: {"$in": values_list}})
        
        # **BƯỚC 4: Xây dựng MongoDB aggregation pipeline với custom release sorting**
        pipeline_stages = []
        
        # Match stage với conditions
        field_conditions_count = len(match_conditions) - (1 if base_filter else 0)
        
        if field_conditions_count > 0:
            if len(match_conditions) == 1:
                match_stage = match_conditions[0]
            else:
                match_stage = {"$and": match_conditions}
            pipeline_stages.append({"$match": match_stage})
        
        # **CUSTOM SORT STAGE WITH RELEASE HANDLING**
        sort_fields = llm_analysis.get("sort_fields", [])
        if sort_fields:
            # Check if we need to sort by release
            has_release_sort = any(sf.get("field") == "release" for sf in sort_fields)
            
            if has_release_sort:
                # Add custom release sorting logic
                pipeline_stages.append({
                    "$addFields": {
                        "release_sort_key": {
                            "$cond": {
                                "if": {"$regexMatch": {"input": "$release", "regex": r"^\d{2}/\d{4}$"}},
                                # For MM/YYYY format, convert to YYYYMM for sorting
                                "then": {
                                    "$toInt": {
                                        "$concat": [
                                            {"$substr": ["$release", 3, 4]},  # Year
                                            {"$substr": ["$release", 0, 2]}   # Month
                                        ]
                                    }
                                },
                                # For YYYY format, convert to YYYY00 for sorting
                                "else": {
                                    "$cond": {
                                        "if": {"$regexMatch": {"input": "$release", "regex": r"^\d{4}$"}},
                                        "then": {"$multiply": [{"$toInt": "$release"}, 100]},
                                        "else": 0
                                    }
                                }
                            }
                        }
                    }
                })
                
                # Build sort specification
                sort_spec = {}
                sorted_fields = sorted(sort_fields, key=lambda x: x.get("priority", 999))
                
                for sort_field in sorted_fields:
                    field_name = sort_field.get("field")
                    order = sort_field.get("order", "desc")
                    
                    if field_name == "release":
                        # Use our custom sort key for release
                        sort_spec["release_sort_key"] = -1 if order == "desc" else 1
                    elif field_name:
                        sort_spec[field_name] = -1 if order == "desc" else 1
                
                if sort_spec:
                    pipeline_stages.append({"$sort": sort_spec})
            else:
                # Regular sort without release
                sort_spec = {}
                sorted_fields = sorted(sort_fields, key=lambda x: x.get("priority", 999))
                for sort_field in sorted_fields:
                    field_name = sort_field.get("field")
                    order = sort_field.get("order", "desc")
                    if field_name:
                        sort_spec[field_name] = -1 if order == "desc" else 1
                
                if sort_spec:
                    pipeline_stages.append({"$sort": sort_spec})
        
        # Limit stage
        pipeline_stages.append({"$limit": top_k})
        
        # Thực hiện aggregation pipeline
        if pipeline_stages:
            results = list(collection.aggregate(pipeline_stages))
        else:
            # Fallback to simple find
            results = list(collection.find(base_filter, {"_id": 1}).limit(top_k))
        
        product_ids = [str(doc['_id']) for doc in results]
        
        # Nếu có kết quả từ pipeline, return luôn
        if product_ids:
            search_method = "MongoDB Field Conditions"
            if sort_fields:
                search_method += " + Smart Release Sort" if any(sf.get("field") == "release" for sf in sort_fields) else " + Sort"
                
            search_info = {
                "search_method": search_method,
                "applied_conditions": applied_conditions,
                "sort_fields": sort_fields,
                "results_count": len(product_ids),
                "query_used": query,
                "device_type": device_type,
                "mongodb_pipeline": pipeline_stages
            }
            
            return {
                "product_ids": product_ids,
                "search_info": search_info,
                "success": True
            }
        
        # **BƯỚC 5: Nếu field conditions không tìm được, thêm text search**
        text_search_keywords = llm_analysis.get("text_search_keywords", [])
        text_search_fields = llm_analysis.get("text_search_fields", ["productName", "description"])
        
        if text_search_keywords:
            # Tạo text search conditions
            text_conditions = []
            for keyword in text_search_keywords:
                keyword_conditions = []
                for field in text_search_fields:
                    keyword_conditions.append({field: {"$regex": keyword, "$options": "i"}})
                if keyword_conditions:
                    text_conditions.append({"$or": keyword_conditions})
            
            # Thêm text conditions vào match_conditions
            if text_conditions:
                # Chỉ thêm 1-2 text conditions quan trọng nhất
                for i, text_condition in enumerate(text_conditions[:2]):
                    match_conditions.append(text_condition)
        
        # **BƯỚC 6: Xây dựng final filter với text search**
        if len(match_conditions) == 1:
            final_filter = match_conditions[0]
        else:
            final_filter = {"$and": match_conditions}
        
        # **BƯỚC 7: Thực hiện search với text search**
        results = list(collection.find(final_filter, {"_id": 1}).limit(top_k))
        
        # Extract product_ids
        product_ids = [str(doc['_id']) for doc in results]
        
        search_info = {
            "search_method": "MongoDB Field + Text Search",
            "applied_conditions": applied_conditions,
            "text_search_keywords": llm_analysis.get("text_search_keywords", []),
            "results_count": len(product_ids),
            "query_used": query,
            "device_type": device_type,
            "mongodb_filter": final_filter
        }
        
        return {
            "product_ids": product_ids,
            "search_info": search_info,
            "success": len(product_ids) > 0
        }
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error in MongoDB search: {error_trace}", file=sys.stderr)
        fallback_result = mongodb_search_fallback_keywords(query, device_type, top_k)
        return {
            "product_ids": fallback_result,
            "search_info": {
                "search_method": "MongoDB Fallback Keywords",
                "error": str(e),
                "results_count": len(fallback_result),
                "query_used": query,
                "device_type": device_type
            },
            "success": len(fallback_result) > 0
        }
    finally:
        mongodb.disconnect()

def mongodb_search_fallback_keywords(query: str, device_type: str, top_k: int = 100) -> List[str]:
    """
    Fallback function sử dụng keyword search đơn giản khi LLM fails.
    """
    try:
        device_type_to_class = {
            "laptop": "com.eazybytes.model.Laptop",
            "phone": "com.eazybytes.model.Phone", 
            "wireless_earphone": "com.eazybytes.model.WirelessEarphone",
            "wired_earphone": "com.eazybytes.model.WiredEarphone",
            "headphone": "com.eazybytes.model.Headphone",
            "backup_charger": "com.eazybytes.model.BackupCharger"
        }
        
        db = mongodb.connect()
        if db is None:
            return []
        
        collection = mongodb.get_collection("baseProduct")
        if collection is None:
            return []
        
        # Base filter
        base_filter = {}
        if device_type in device_type_to_class:
            base_filter["_class"] = device_type_to_class[device_type]
        
        # Simple keyword search
        keywords = query.lower().split()
        search_fields = ["productName", "brand", "description"]
        
        regex_conditions = []
        for keyword in keywords:
            keyword_conditions = []
            for field in search_fields:
                keyword_conditions.append({field: {"$regex": keyword, "$options": "i"}})
            if keyword_conditions:
                regex_conditions.append({"$or": keyword_conditions})
        
        if regex_conditions:
            final_filter = {"$and": [base_filter] + regex_conditions}
        else:
            final_filter = base_filter
        
        results = list(collection.find(final_filter, {"_id": 1}).limit(top_k))
        product_ids = [str(doc['_id']) for doc in results]
        
        return product_ids
        
    except Exception as e:
        print(f"Error in fallback search: {e}", file=sys.stderr)
        return []
    finally:
        mongodb.disconnect()

def main():
    """
    Main function để xử lý command line arguments và gọi MongoDB search
    """
    parser = argparse.ArgumentParser(description='MongoDB Search Wrapper for Java Integration')
    parser.add_argument('--query', required=True, help='Search query string')
    parser.add_argument('--device_type', required=True, help='Device type (phone, laptop, wireless_earphone, etc.)')
    parser.add_argument('--top_k', type=int, default=100, help='Maximum number of results to return')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    try:
        if args.debug:
            print(f"DEBUG: Processing query='{args.query}', device_type='{args.device_type}', top_k={args.top_k}", file=sys.stderr)
        
        # Validate device_type
        valid_device_types = ["laptop", "phone", "wireless_earphone", "wired_earphone", "headphone", "backup_charger"]
        if args.device_type not in valid_device_types:
            raise ValueError(f"Invalid device_type: {args.device_type}. Valid types: {valid_device_types}")
        
        # Validate top_k
        if args.top_k <= 0 or args.top_k > 1000:
            raise ValueError(f"Invalid top_k: {args.top_k}. Must be between 1 and 1000")
        
        # Call MongoDB search function
        result = mongodb_search_specific_requirements_get_product_ids(
            query=args.query,
            device_type=args.device_type,
            top_k=args.top_k
        )
        
        # Output result as JSON
        output = json.dumps(result, ensure_ascii=False, indent=2 if args.debug else None)
        print(output)
        
        if args.debug:
            print(f"DEBUG: Search completed successfully. Found {len(result.get('product_ids', []))} products", file=sys.stderr)
        
    except Exception as e:
        # Output error result
        error_trace = traceback.format_exc()
        print(f"ERROR: {error_trace}", file=sys.stderr)
        
        error_result = {
            "success": False,
            "product_ids": [],
            "search_info": {
                "error": str(e),
                "search_method": "Python Script Error",
                "query_used": args.query if 'args' in locals() else "unknown",
                "device_type": args.device_type if 'args' in locals() else "unknown"
            }
        }
        
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

# Test functions for development
def test_search():
    """
    Test function để kiểm tra MongoDB search
    """
    test_cases = [
        ("laptop gaming mới nhất", "laptop"),
        ("điện thoại camera tốt", "phone"),
        ("iPhone 15 128GB", "phone"),
        ("tai nghe không dây chống nước", "wireless_earphone"),
        ("sạc dự phòng 20000mAh", "backup_charger"),
        ("laptop RAM 16GB RTX 4070", "laptop"),
        ("điện thoại pin cao nhất", "phone")
    ]
    
    print("=" * 60)
    print("TESTING MONGODB SEARCH")
    print("=" * 60)
    
    for query, device_type in test_cases:
        print(f"\nTest: '{query}' | Device: {device_type}")
        print("-" * 40)
        
        try:
            result = mongodb_search_specific_requirements_get_product_ids(
                query=query,
                device_type=device_type,
                top_k=5
            )
            
            print(f"Success: {result['success']}")
            print(f"Results: {len(result['product_ids'])} products")
            
            if result.get('search_info'):
                search_info = result['search_info']
                print(f"Method: {search_info.get('search_method', 'Unknown')}")
                
                if search_info.get('applied_conditions'):
                    print("Conditions:")
                    for cond in search_info['applied_conditions']:
                        print(f"  - {cond['field']} {cond['operator']} {cond['value']}")
                
                if search_info.get('sort_fields'):
                    print("Sort:")
                    for sort_field in search_info['sort_fields']:
                        print(f"  - {sort_field['field']} ({sort_field['order']})")
            
            # Sample product IDs
            if result['product_ids']:
                print(f"Sample IDs: {result['product_ids'][:3]}")
            
        except Exception as e:
            print(f"ERROR: {e}")
        
        print()

def check_environment():
    """
    Check environment và dependencies
    """
    print("Environment Check:")
    print("-" * 20)
    
    # Check Python version
    print(f"Python version: {sys.version}")
    
    # Check required modules
    modules = ['pymongo', 'llama_index', 'dotenv']
    for module in modules:
        try:
            __import__(module)
            print(f"✓ {module} - OK")
        except ImportError:
            print(f"✗ {module} - Missing")
    
    # Check environment variables
    env_vars = ['OPENAI_API_KEY']
    for var in env_vars:
        value = os.getenv(var)
        if value:
            print(f"✓ {var} - Set (length: {len(value)})")
        else:
            print(f"✗ {var} - Not set")
    
    # Test MongoDB connection
    try:
        db = mongodb.connect()
        if db:
            collection = mongodb.get_collection("baseProduct")
            if collection:
                count = collection.count_documents({})
                print(f"✓ MongoDB - Connected ({count} documents)")
            else:
                print("✗ MongoDB - Collection not found")
        else:
            print("✗ MongoDB - Connection failed")
    except Exception as e:
        print(f"✗ MongoDB - Error: {e}")
    finally:
        mongodb.disconnect()

if __name__ == "__main__":
    # Check if running in test mode
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_search()
    elif len(sys.argv) > 1 and sys.argv[1] == "--check":
        check_environment()
    else:
        main()