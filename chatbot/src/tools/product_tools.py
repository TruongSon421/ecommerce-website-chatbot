import pandas as pd
from sqlalchemy import create_engine, text
from typing import Optional, List, Dict, Any
import requests
import os
import numpy as np
import json 
import re
from rag.retrieve import search_elasticsearch,search_name
from dotenv import load_dotenv
<<<<<<< HEAD
from models.requirements import PhoneRequirements,LaptopRequirements,EarHeadphoneRequirements,BackupChargerRequirements
from llama_index.llms.google_genai import GoogleGenAI
=======
from models.requirements import *
from llama_index.llms.openai import OpenAI
>>>>>>> server
from prompts import *
import sys
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..')))
from db.mysql import mysql
from db.mongodb import mongodb
from google.adk.tools import ToolContext
from share_data import current_group_ids,filter_params
<<<<<<< HEAD
load_dotenv()
llm = GoogleGenAI(
    model="gemini-2.0-flash",
    api_key=os.getenv('GOOGLE_API_KEY')
=======
from tools.cart_tools import find_group_id_by_product_id
import traceback

load_dotenv("../.env")
llm = OpenAI(
    model="gpt-4o-mini",  
    api_key=os.getenv("OPENAI_API_KEY"),
>>>>>>> server
)
def product_consultation_tool(device: str, query: str, top_k: int = 5) -> str:
    """
    Công cụ tư vấn sản phẩm điện tử thông minh dựa trên nhu cầu của người dùng.
    
    Args:
<<<<<<< HEAD
        device (str): Loại thiết bị cần tư vấn (ví dụ: "điện thoại", "laptop", "tablet", "tai nghe", "smartwatch")
=======
        device (str): Loại thiết bị cần tư vấn (ví dụ: "phone", "laptop", "tablet", "wired_earphone", "wireless_earphone")
>>>>>>> server
        query (str): Câu hỏi hoặc yêu cầu tư vấn gốc của người dùng (ví dụ: "tìm điện thoại chụp ảnh đẹp dưới 15 triệu", "laptop gaming trong tầm giá 20-30 triệu")
        top_k (int, optional): Top số lượng sản phẩm phù hợp nhất mà người dùng muốn hiển thị trong kết quả tư vấn. 
                               
    Returns:
        str: Kết quả tư vấn chi tiết bao gồm danh sách sản phẩm phù hợp    
    Examples:
        >>> # Tư vấn 3 điện thoại tốt nhất
<<<<<<< HEAD
        >>> product_consultation_tool("điện thoại", "chụp ảnh đẹp dưới 15 triệu", top_k=3)
=======
        >>> product_consultation_tool("phone", "chụp ảnh đẹp dưới 15 triệu", top_k=3)
>>>>>>> server
        
        >>> # Xem 10 laptop gaming để có nhiều lựa chọn
        >>> product_consultation_tool("laptop", "gaming trong tầm 20-30 triệu", top_k=10)
        
    """
    current_group_ids.clear()
    filter_params.clear()
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        
        # Process device type
        if device == "phone":
            reqs = llm.structured_predict(PhoneRequirements, PHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "phone"
        elif device == "laptop":
            reqs = llm.structured_predict(LaptopRequirements, LAPTOP_CONSULTATION_TEMPLATE, query=query)
            device_type = "laptop"
        elif device == "wired_earphone":
<<<<<<< HEAD
            reqs = llm.structured_predict(EarHeadphoneRequirements, EARHEADPHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "wired_earphone"
        elif device == "wireless_earphone":
            reqs = llm.structured_predict(EarHeadphoneRequirements, EARHEADPHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "wireless_earphone"
        elif device == "headphone":
            reqs = llm.structured_predict(EarHeadphoneRequirements, EARHEADPHONE_CONSULTATION_TEMPLATE, query=query)
=======
            reqs = llm.structured_predict(WiredEarphoneRequirements, WIRED_EARPHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "wired_earphone"
        elif device == "wireless_earphone":
            reqs = llm.structured_predict(WirelessEarphoneRequirements, WIRELESS_EARPHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "wireless_earphone"
        elif device == "headphone":
            reqs = llm.structured_predict(HeadphoneRequirements, HEADPHONE_CONSULTATION_TEMPLATE, query=query)
>>>>>>> server
            device_type = "headphone"
        elif device == "backup_charger":
            reqs = llm.structured_predict(BackupChargerRequirements, BACKUPCHARGER_CONSULTATION_TEMPLATE, query=query)
            device_type = "backup_charger"
        else:
            cursor.close()
            conn.close()
            return "Loại sản phẩm này hiện tại chưa có tại cửa hàng chúng tôi."

        # Lưu các tham số filter vào filter_params
        filter_params.update({
            "type": device_type,
        })

        # Xử lý ngân sách
        if reqs.min_budget:
            filter_params["minPrice"] = reqs.min_budget
        if reqs.max_budget:
            filter_params["maxPrice"] = reqs.max_budget

        # Xử lý brand preference (string với dấu phẩy)
        if reqs.brand_preference and reqs.brand_preference.strip():
            filter_params["brand"] = reqs.brand_preference

        # *** FIX: GIỮ NGUYÊN TÊN TAG THEO MODEL REQUIREMENTS ***
        # Thu thập tất cả các tags được đánh dấu True trong model requirements
        active_tags = []
        for field_name, value in reqs.dict().items():
            # Bỏ qua các field không phải tag (min_budget, max_budget, brand_preference, specific_requirements)
            if field_name not in ['min_budget', 'max_budget', 'brand_preference', 'specific_requirements'] and value:
                # Giữ nguyên tên field từ model requirements
                active_tags.append(field_name)
        
        if active_tags:
            filter_params["tags"] = ",".join(active_tags)

        # Xử lý specific requirements (tìm kiếm full-text)
        if reqs.specific_requirements:
            filter_params["search"] = reqs.specific_requirements

        # Parse brand_preference string thành list
        brand_list = []
        brand_display = ""
        if reqs.brand_preference and reqs.brand_preference.strip():
            # Split by comma và clean up
            brand_list = [brand.strip() for brand in reqs.brand_preference.split(',') if brand.strip() and brand.strip() != "không xác định"]
            if brand_list:
                brand_display = ", ".join(brand_list)
        
        min_budget = reqs.min_budget
        max_budget = reqs.max_budget
        print(reqs)
        
        # **XỬ LÝ BRAND FILTER CHO COMMA-SEPARATED STRING**
        brand_filtered_df = None
        if brand_list:
            # Create placeholders for IN clause
            brand_placeholders = ','.join(['%s'] * len(brand_list))
            brand_sql = f"""
                SELECT group_id, group_name, brand
                FROM group_product
                WHERE brand IN ({brand_placeholders}) AND type = %s
            """
            brand_params = brand_list + [device_type]
            cursor.execute(brand_sql, brand_params)
            brand_result = cursor.fetchall()
            
            if brand_result:
                brand_filtered_df = pd.DataFrame(brand_result, columns=["group_id", "group_name", "brand"])
                print(f"Found {len(brand_filtered_df)} products for brands {brand_list}")
            else:
                cursor.close()
                conn.close()
                if len(brand_list) == 1:
                    return f"Không tìm thấy {device} của thương hiệu {brand_list[0]} trong cửa hàng."
                else:
                    brands_str = " hoặc ".join(brand_list)
                    return f"Không tìm thấy {device} của thương hiệu {brands_str} trong cửa hàng."
        
        # Kiểm tra nếu chỉ có thông tin giá mà không có yêu cầu khác
        only_price = (min_budget or max_budget) and not any(
            field for field in reqs.__dict__.keys() 
            if field not in ['min_budget', 'max_budget', 'brand_preference', 'specific_requirements'] and getattr(reqs, field)
        )
        
        if only_price:
            # Trường hợp chỉ có thông tin giá
            if brand_filtered_df is not None:
                # Nếu có brand filter, chỉ lấy giá của các sản phẩm trong brand đó
                brand_group_ids = brand_filtered_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(brand_group_ids))
                price_sql = f"""
                    SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                    FROM group_product gp
                    JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                    WHERE gp.group_id IN ({placeholders})
                    GROUP BY gp.group_id, gp.group_name
                """
                cursor.execute(price_sql, brand_group_ids)
            else:
                # Không có brand filter, lấy tất cả
                price_sql = """
                    SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                    FROM group_product gp
                    JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                    WHERE gp.type = %s
                    GROUP BY gp.group_id, gp.group_name
                """
                cursor.execute(price_sql, (device_type,))
                
            result = cursor.fetchall()
            combined_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])
            
            # Lọc theo giá
            if min_budget:
                combined_df = combined_df[combined_df["price"] >= min_budget]
            if max_budget and max_budget != 0:
                combined_df = combined_df[combined_df["price"] <= max_budget]
                
            # Sắp xếp theo giá từ CAO NHẤT đến THẤP NHẤT
            combined_df = combined_df.sort_values(by="price", ascending=False).head(top_k)
            
            if combined_df.empty:
                cursor.close()
                conn.close()
                brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
                return f"Không tìm thấy {device}{brand_msg} phù hợp với khoảng giá bạn yêu cầu."
            
            # **FIX: THÊM GROUP_IDS VÀO CURRENT_GROUP_IDS**
            current_group_ids.extend(combined_df['group_id'].tolist())
            
            # Build response
            brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
            response = f"Dưới đây là top {top_k} {device}{brand_msg} phù hợp với khoảng giá bạn yêu cầu (từ cao đến thấp):\n"
            for _, product in combined_df.iterrows():
                product_info = f"- {product['group_name']} (ID: {product['group_id']}, giá: {int(product['price']):,} đồng)"
                response += product_info + "\n"
            
            cursor.close()
            conn.close()
            return response

        # Nếu có yêu cầu khác ngoài giá, xử lý như bình thường
        # Active requirements - chỉ lấy các field là tag (bỏ qua budget, brand, specific)
        req_fields = [field for field in reqs.__dict__.keys() 
                     if field not in ['min_budget', 'max_budget', 'brand_preference', 'specific_requirements'] 
                     and getattr(reqs, field)]

        # Query tags với brand filter
        tables_to_merge = []
        
        for req_key in req_fields:
            tag_name = req_key  # Giữ nguyên tên từ model requirements
            if brand_filtered_df is not None:
                # Nếu có brand filter, chỉ lấy tags của các sản phẩm trong brand đó
                brand_group_ids = brand_filtered_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(brand_group_ids))
                sql = f"""
                    SELECT gp.group_id, gp.group_name
                    FROM group_product gp
                    JOIN group_tags gt ON gp.group_id = gt.group_id
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE t.tag_name = %s AND gp.group_id IN ({placeholders})
                """
                params = [tag_name] + brand_group_ids
                cursor.execute(sql, params)
            else:
                # Không có brand filter
                sql = """
                    SELECT gp.group_id, gp.group_name
                    FROM group_product gp
                    JOIN group_tags gt ON gp.group_id = gt.group_id
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE t.tag_name = %s AND gp.type = %s
                """
                cursor.execute(sql, (tag_name, device_type))
                
            result = cursor.fetchall()
            if result:
                df = pd.DataFrame(result, columns=["group_id", "group_name"])
                df[f"{tag_name}_rank"] = df.index + 1
                tables_to_merge.append(df[["group_id", "group_name", f"{tag_name}_rank"]])

        # Xử lý trường hợp chỉ có brand preference không có tag
        if not tables_to_merge:
            if brand_filtered_df is not None:
                # Nếu chỉ có brand preference mà không có tag nào, sử dụng brand_filtered_df
                combined_df = brand_filtered_df.copy()
                # **FIX: THÊM CURRENT_GROUP_IDS CHO TRƯỜNG HỢP CHỈ CÓ BRAND**
                current_group_ids.extend(combined_df['group_id'].tolist())
            else:
                cursor.close()
                conn.close()
                return f"Tôi đề xuất {device} từ {brand_display} dựa trên sở thích thương hiệu của bạn." if brand_display else f"Tôi cần thêm thông tin để đề xuất {device} phù hợp."
        else:
            # Merge DataFrames
            combined_df = tables_to_merge[0]
            for df in tables_to_merge[1:]:
<<<<<<< HEAD
                combined_df = pd.merge(combined_df, df, on=["group_id", "group_name"], how="outer")
=======
                combined_df = pd.merge(combined_df, df, on=["group_id", "group_name"], how="inner")
>>>>>>> server

            # Fill NaN ranks
            max_rank = max([len(df) for df in tables_to_merge]) + 1
            for col in combined_df.columns:
                if col.endswith("_rank"):
                    combined_df[col] = combined_df[col].fillna(max_rank)

        # Xử lý specific_requirements
        if hasattr(reqs, 'specific_requirements') and reqs.specific_requirements and reqs.specific_requirements != '':
            print("reqs.specific_requirements", reqs.specific_requirements)
            
            # Lấy danh sách group_id từ combined_df
            group_ids = combined_df['group_id'].astype(str).tolist()
            
            # Tìm kiếm chính xác cụm từ
            search_results = search_elasticsearch(
                query=reqs.specific_requirements,
                ids=group_ids,
                size=len(group_ids)
            )
            print('search_results', search_results)
            
            # Tạo mapping điểm số từ kết quả search
            relevance_scores = {}
            if search_results:
                for hit in search_results:
                    group_id = int(hit['group_id'])
                    score = hit.get('_score', 0)  # Lấy điểm từ Elasticsearch
                    relevance_scores[group_id] = score
            
            # Thêm cột điểm relevance cho tất cả sản phẩm
            # Nếu group_id không có trong kết quả search thì được gán điểm 0
            combined_df['relevance_score'] = combined_df['group_id'].map(
                lambda x: relevance_scores.get(x, 0)
            )
            
            # Sắp xếp theo điểm relevance (cao nhất trước)
            combined_df = combined_df.sort_values('relevance_score', ascending=False)
            
            print(f"Reranked {len(combined_df)} products by specific requirements relevance")
            
        # Xử lý giá cả
        if min_budget or max_budget:
            if not combined_df.empty:
                group_ids_for_price = combined_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(group_ids_for_price))
                price_sql = f"""
                    SELECT gpj.group_id, gp.group_name, gpj.default_current_price AS price
                    FROM group_product_junction gpj
                    JOIN group_product gp ON gpj.group_id = gp.group_id
                    WHERE gpj.group_id IN ({placeholders})
                    AND (gpj.group_id, gpj.default_current_price) IN (
                        SELECT group_id, MIN(default_current_price)
                        FROM group_product_junction
                        WHERE group_id IN ({placeholders})
                        GROUP BY group_id
                    )
                """
                params = group_ids_for_price + group_ids_for_price
                cursor.execute(price_sql, params)
                result = cursor.fetchall()
                prices_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])

                if not prices_df.empty:
                    combined_df = pd.merge(combined_df, prices_df, on=["group_id", "group_name"], how="inner")
                    if min_budget:
                        combined_df = combined_df[combined_df["price"] >= min_budget]
                    if max_budget and max_budget != 0:
                        combined_df = combined_df[combined_df["price"] <= max_budget]

        # Calculate ranks
        rank_columns = [col for col in combined_df.columns if col.endswith("_rank")]
        if "es_rank" in combined_df.columns:
            rank_columns.append("es_rank")
            
        if rank_columns:
            combined_df["combined_rank"] = combined_df[rank_columns].sum(axis=1)
            top_k_products = combined_df.sort_values(by="combined_rank").head(top_k)
        else:
            # Nếu không có rank columns, lấy theo thứ tự
            top_k_products = combined_df.head(top_k)
        
        # **FIX: ĐẢM BẢO CURRENT_GROUP_IDS LUÔN ĐƯỢC CẬP NHẬT**
        if not top_k_products.empty:
            current_group_ids.extend(top_k_products['group_id'].tolist())
        
        if top_k_products.empty:
            cursor.close()
            conn.close()
            brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
            return f"Không tìm thấy {device}{brand_msg} phù hợp với yêu cầu của bạn."

        # Build response
        brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
        response = f"Dưới đây là top {top_k} {device}{brand_msg} phù hợp với yêu cầu của bạn:\n"
        for _, product in top_k_products.iterrows():
            product_info = f"- {product['group_name']} (ID: {product['group_id']}"
            if "combined_rank" in product and not pd.isna(product["combined_rank"]):
                product_info += f", rank: {int(product['combined_rank'])}"
            if "price" in product and not pd.isna(product["price"]):
                product_info += f", giá: {int(product['price']):,} đồng"
            product_info += ")"
            response += product_info + "\n"
        cursor.close()
        conn.close()
        return response

    except Exception as e:
        try:
            cursor.close()
            conn.close()
        except:
            pass
        return f"Lỗi: {e}"
    

def product_information_tool(query: str) -> str:
    current_group_ids.clear()
        
    # Split and clean product names
    product_names = [name.strip() for name in query.split(',') if name.strip()]
    if not product_names:
        return "Vui lòng cung cấp tên sản phẩm cách nhau bằng dấu phẩy."

    output = []
    score_threshold_percent = 0.10  # 10% threshold

    for product_name in product_names:
        # Search for each product
        results = search_name(product_name)
        if not results:
            output.append(f"Không tìm thấy thông tin cho sản phẩm: {product_name}")
            continue

        # Sort results by score (descending)
        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        top_score = results[0].get('score', 0)
        min_score = top_score * (1 - score_threshold_percent)

        # Filter results within 10% of top score
        qualified_results = [r for r in results if r.get('score', 0) >= min_score]
        if not qualified_results:
            output.append(f"Không có kết quả đủ tốt cho sản phẩm: {product_name}")
            continue

        # Add product information to output
        output.append(f"\n=== Kết quả tham khảo cho '{product_name}' ===")
        for i, r in enumerate(qualified_results, 1):
            output.append(f"\nSản phẩm {i}:")
            output.append(r.get('document', 'Thông tin không khả dụng'))
            output.append(f"Độ phù hợp: {r.get('score', 0):.2f} (Top score: {top_score:.2f})")
            
            if group_id := r.get('group_id'):
                current_group_ids.append(group_id)
    print(current_group_ids)
    if len(output) == 0:
        return "Không tìm thấy thông tin phù hợp cho bất kỳ sản phẩm nào."
    return "\n".join(output)




def product_information_tool_for_cart(query: str) -> str:
    current_group_ids.clear()
        
    # Split and clean product names
    product_names = [name.strip() for name in query.split(',') if name.strip()]
    if not product_names:
        return "Vui lòng cung cấp tên sản phẩm cách nhau bằng dấu phẩy."

    output = []
<<<<<<< HEAD
    score_threshold_percent = 0.10  # 10% threshold

    for product_name in product_names:
        # Search for each product
        results = search_name(product_name)
=======
    score_threshold_percent = 0.4  # 40% threshold

    for product_name in product_names:
        # Search for each product
        results = search_name(product_name, size=3)
>>>>>>> server
        if not results:
            output.append(f"Không tìm thấy thông tin cho sản phẩm: {product_name}")
            continue

        # Sort results by score (descending)
        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        top_score = results[0].get('score', 0)
        min_score = top_score * (1 - score_threshold_percent)

        # Filter results within 10% of top score
        qualified_results = [r for r in results if r.get('score', 0) >= min_score]
        if not qualified_results:
            output.append(f"Không có kết quả đủ tốt cho sản phẩm: {product_name}")
            continue

        # Add product information to output
        output.append(f"\n=== Kết quả tham khảo cho '{product_name}' ===")
        for i, r in enumerate(qualified_results, 1):
            output.append(f"\nSản phẩm {i}:")
            output.append(r.get('document', 'Thông tin không khả dụng'))
            output.append(f"Độ phù hợp: {r.get('score', 0):.2f} (Top score: {top_score:.2f})")
            output.append(f"group_id: {r.get('group_id')}")
            if group_id := r.get('group_id'):
                current_group_ids.append(group_id)
    print(current_group_ids)
    if len(output) == 0:
        return "Không tìm thấy thông tin phù hợp cho bất kỳ sản phẩm nào."
    return "\n".join(output)

<<<<<<< HEAD
def product_specs_search_tool(device_type: str, field_name: str, sort_by: str = "desc", top_k: int = 5) -> str:
    """
    Công cụ tìm kiếm sản phẩm theo trường cụ thể trong MongoDB.
    
    Args:
        device_type (str): Loại thiết bị cần tìm (ví dụ: "laptop", "phone", "wireless_earphone", "wired_earphone", "headphone", "backup_charger")
        field_name (str): Tên trường cần tìm kiếm (ví dụ: "batteryCapacity", "ram", "storage", "processor")
        sort_by (str): Sắp xếp theo thứ tự "asc" (tăng dần) hoặc "desc" (giảm dần). Mặc định là "desc"
        top_k (int): Số lượng sản phẩm muốn hiển thị
    
    Returns:
        str: Kết quả tìm kiếm chi tiết về sản phẩm
        
    Examples:
        >>> # Tìm laptop có pin cao nhất
        >>> product_specs_search_tool("laptop", "batteryCapacity", "desc", 5)
        
        >>> # Tìm điện thoại có RAM lớn nhất  
        >>> product_specs_search_tool("phone", "ram", "desc", 3)
        
        >>> # Tìm laptop theo processor
        >>> product_specs_search_tool("laptop", "processor", "desc", 5)
    """
    try:
        current_group_ids.clear()
        
        # Kết nối đến MongoDB
        db = mongodb.connect()
        if db is None:
            return "Không thể kết nối đến cơ sở dữ liệu MongoDB."
        
        # Xác định collection dựa trên device_type
        collection_name = f"baseProduct"  # Collection chính chứa dữ liệu sản phẩm
        collection = mongodb.get_collection(collection_name)
        
        if collection is None:
            return f"Không tìm thấy collection {collection_name}."
        
        # Xây dựng query filter dựa trên device_type
        base_filter = {}
        if device_type == "laptop":
            base_filter["_class"] = "com.eazybytes.model.Laptop"
        elif device_type == "phone":
            base_filter["_class"] = "com.eazybytes.model.Phone"
        elif device_type == "wireless_earphone":
            base_filter["_class"] = "com.eazybytes.model.WirelessEarphone"
        elif device_type == "wired_earphone":
            base_filter["_class"] = "com.eazybytes.model.WiredEarphone"
        elif device_type == "headphone":
            base_filter["_class"] = "com.eazybytes.model.Headphone"
        elif device_type == "backup_charger":
            base_filter["_class"] = "com.eazybytes.model.BackupCharger"
        elif device_type == "cable_charger_hub":
            base_filter["_class"] = "com.eazybytes.model.CableChargerHub"
        else:
            # Tìm tất cả các loại sản phẩm
            pass
        
        # Xây dựng pipeline trực tiếp theo field_name
        sort_order = -1 if sort_by == "desc" else 1
        
        # Các trường numeric cần regex extraction (cập nhật theo data thực tế)
        numeric_fields = ["batteryCapacity", "batteryLife", "ram", "storage", "screenSize", "rearCameraResolution", "frontCameraResolution", "chargingCaseBatteryLife"]
        
        if field_name in numeric_fields:
            # Trường numeric - dùng regex extraction
            search_pipeline = [
                {"$match": base_filter},
                {"$addFields": {
                    "numericValue": {
                        "$toDouble": {
                            "$arrayElemAt": [
                                {
                                    "$regexFindAll": {
                                        "input": f"${field_name}",
                                        "regex": r"\d+(\.\d+)?"
                                    }
                                },
                                0
                            ]
                        }
                    }
                }},
                {"$match": {"numericValue": {"$gt": 0}}},
                {"$sort": {"numericValue": sort_order}},
                {"$limit": top_k}
            ]
        else:
            # Trường text - chỉ sort theo string
            search_pipeline = [
                {"$match": base_filter},
                {"$sort": {field_name: sort_order}},
                {"$limit": top_k}
            ]
        
        # Thực hiện tìm kiếm
        results = list(collection.aggregate(search_pipeline))
        
        if not results:
            return f"Không tìm thấy {device_type} nào có thông tin {field_name}."
        
        # Xử lý kết quả
        output = []
        device_text = device_type if device_type != "all" else "sản phẩm"
        sort_text = "cao nhất" if sort_by == "desc" else "thấp nhất"
        output.append(f"=== Top {len(results)} {device_text} theo {field_name} ({sort_text}) ===\n")
        
        for i, product in enumerate(results, 1):
            group_id = str(product.get('_id', ''))
            if group_id:
                current_group_ids.append(group_id)
            
            name = product.get('productName', 'Tên không xác định')
            brand = product.get('brand', 'Không xác định')
            
            product_info = f"{i}. {name} - {brand}"
            
            # Hiển thị trường được yêu cầu
            field_value = product.get(field_name, 'Không xác định')
            
            # Hiển thị giá trị numeric nếu có
            if field_name in numeric_fields and 'numericValue' in product:
                numeric_value = product.get('numericValue', 0)
                
                if field_name == "batteryCapacity":
                    product_info += f"\n   Pin: {field_value} (Giá trị: {numeric_value:.1f})"
                elif field_name == "batteryLife":
                    product_info += f"\n   Thời lượng pin: {field_value} (Giá trị: {numeric_value:.1f})"
                elif field_name == "chargingCaseBatteryLife":
                    product_info += f"\n   Pin hộp sạc: {field_value} (Giá trị: {numeric_value:.1f})"
                elif field_name == "ram":
                    product_info += f"\n   RAM: {field_value} (Giá trị: {numeric_value:.0f})"
                elif field_name == "storage":
                    product_info += f"\n   Storage: {field_value} (Giá trị: {numeric_value:.0f})"
                elif field_name == "screenSize":
                    product_info += f"\n   Màn hình: {field_value} (Giá trị: {numeric_value:.1f})"
                elif field_name == "rearCameraResolution":
                    product_info += f"\n   Camera sau: {field_value} (Giá trị: {numeric_value:.0f})"
                elif field_name == "frontCameraResolution":
                    product_info += f"\n   Camera trước: {field_value} (Giá trị: {numeric_value:.0f})"
                else:
                    product_info += f"\n   {field_name}: {field_value} (Giá trị: {numeric_value:.1f})"
            else:
                # Hiển thị text field
                if field_name == "processor":
                    product_info += f"\n   Processor: {field_value}"
                elif field_name == "brand":
                    product_info += f"\n   Thương hiệu: {field_value}"
                elif field_name == "productName":
                    product_info += f"\n   Tên sản phẩm: {field_value}"
                else:
                    product_info += f"\n   {field_name}: {field_value}"
            
            product_info += f"\n   Group ID: {group_id}"
            output.append(product_info)
            output.append("")  # Dòng trống
        
        return "\n".join(output)
        
    except Exception as e:
        return f"Lỗi khi tìm kiếm sản phẩm: {str(e)}"
=======


def product_consultation_tool_mongo(device: str, query: str, top_k: int = 5) -> str:
    """
    Công cụ tìm sản phẩm điện tử theo yêu cầu của người dùng từ câu truy vấn.
    
    Args:
        device (str): Loại thiết bị cần tư vấn (ví dụ: "phone", "laptop", "tablet", "wired_earphone", "wireless_earphone","headphone)
        query (str): Câu hỏi hoặc yêu cầu tư vấn gốc của người dùng
        top_k (int, optional): Top số lượng sản phẩm phù hợp nhất
                               
    Returns:
        str: Kết quả tư vấn chi tiết bao gồm danh sách sản phẩm phù hợp    
    """
    current_group_ids.clear()
    filter_params.clear()
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        
        # Process device type và extract requirements giống hàm cũ
        if device == "phone":
            reqs = llm.structured_predict(PhoneRequirements, PHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "phone"
        elif device == "laptop":
            reqs = llm.structured_predict(LaptopRequirements, LAPTOP_CONSULTATION_TEMPLATE, query=query)
            device_type = "laptop"
        elif device == "wired_earphone":
            reqs = llm.structured_predict(WiredEarphoneRequirements, WIRED_EARPHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "wired_earphone"
        elif device == "wireless_earphone":
            reqs = llm.structured_predict(WirelessEarphoneRequirements, WIRELESS_EARPHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "wireless_earphone"
        elif device == "headphone":
            reqs = llm.structured_predict(HeadphoneRequirements, HEADPHONE_CONSULTATION_TEMPLATE, query=query)
            device_type = "headphone"
        elif device == "backup_charger":
            reqs = llm.structured_predict(BackupChargerRequirements, BACKUPCHARGER_CONSULTATION_TEMPLATE, query=query)
            device_type = "backup_charger"
        else:
            cursor.close()
            conn.close()
            return "Loại sản phẩm này hiện tại chưa có tại cửa hàng chúng tôi."

        # Lưu các tham số filter vào filter_params
        filter_params.update({"type": device_type})
        if reqs.min_budget:
            filter_params["minPrice"] = reqs.min_budget
        if reqs.max_budget:
            filter_params["maxPrice"] = reqs.max_budget
        if reqs.brand_preference and reqs.brand_preference.strip():
            filter_params["brand"] = reqs.brand_preference

        # Thu thập active tags
        active_tags = []
        for field_name, value in reqs.dict().items():
            if field_name not in ['min_budget', 'max_budget', 'brand_preference', 'specific_requirements'] and value:
                active_tags.append(field_name)
        
        if active_tags:
            filter_params["tags"] = ",".join(active_tags)

        # Parse brand_preference
        brand_list = []
        brand_display = ""
        if reqs.brand_preference and reqs.brand_preference.strip():
            brand_list = [brand.strip() for brand in reqs.brand_preference.split(',') if brand.strip() and brand.strip() != "không xác định"]
            if brand_list:
                brand_display = ", ".join(brand_list)
        
        min_budget = reqs.min_budget
        max_budget = reqs.max_budget
        print(f"Requirements: {reqs}")
        
        # **BRAND FILTER** - tương tự hàm cũ
        brand_filtered_df = None
        if brand_list:
            brand_placeholders = ','.join(['%s'] * len(brand_list))
            brand_sql = f"""
                SELECT group_id, group_name, brand
                FROM group_product
                WHERE brand IN ({brand_placeholders}) AND type = %s
            """
            brand_params = brand_list + [device_type]
            cursor.execute(brand_sql, brand_params)
            brand_result = cursor.fetchall()
            
            if brand_result:
                brand_filtered_df = pd.DataFrame(brand_result, columns=["group_id", "group_name", "brand"])
                print(f"Found {len(brand_filtered_df)} products for brands {brand_list}")
            else:
                cursor.close()
                conn.close()
                if len(brand_list) == 1:
                    return f"Không tìm thấy {device} của thương hiệu {brand_list[0]} trong cửa hàng."
                else:
                    brands_str = " hoặc ".join(brand_list)
                    return f"Không tìm thấy {device} của thương hiệu {brands_str} trong cửa hàng."
        
        # **XỬ LÝ TRƯỜNG HỢP CHỈ CÓ GIÁ** - tương tự hàm cũ
        only_price = (min_budget or max_budget) and not any(
            field for field in reqs.__dict__.keys() 
            if field not in ['min_budget', 'max_budget', 'brand_preference', 'specific_requirements'] and getattr(reqs, field)
        )
        
        if only_price:
            if brand_filtered_df is not None:
                brand_group_ids = brand_filtered_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(brand_group_ids))
                price_sql = f"""
                    SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                    FROM group_product gp
                    JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                    WHERE gp.group_id IN ({placeholders})
                    GROUP BY gp.group_id, gp.group_name
                """
                cursor.execute(price_sql, brand_group_ids)
            else:
                price_sql = """
                    SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                    FROM group_product gp
                    JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                    WHERE gp.type = %s
                    GROUP BY gp.group_id, gp.group_name
                """
                cursor.execute(price_sql, (device_type,))
                
            result = cursor.fetchall()
            combined_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])
            
            if min_budget:
                combined_df = combined_df[combined_df["price"] >= min_budget]
            if max_budget and max_budget != 0:
                combined_df = combined_df[combined_df["price"] <= max_budget]
                
            combined_df = combined_df.sort_values(by="price", ascending=False).head(top_k)
            
            if combined_df.empty:
                cursor.close()
                conn.close()
                brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
                return f"Không tìm thấy {device}{brand_msg} phù hợp với khoảng giá bạn yêu cầu."
            
            current_group_ids.extend(combined_df['group_id'].tolist())
            
            brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
            response = f"Dưới đây là top {top_k} {device}{brand_msg} phù hợp với khoảng giá bạn yêu cầu (từ cao đến thấp):\n"
            for _, product in combined_df.iterrows():
                product_info = f"- {product['group_name']} (ID: {product['group_id']}, giá: {int(product['price']):,} đồng)"
                response += product_info + "\n"
            
            cursor.close()
            conn.close()
            return response

        # **XỬ LÝ TAGS** - tương tự hàm cũ
        req_fields = [field for field in reqs.__dict__.keys() 
                     if field not in ['min_budget', 'max_budget', 'brand_preference', 'specific_requirements'] 
                     and getattr(reqs, field)]

        tables_to_merge = []
        
        for req_key in req_fields:
            tag_name = req_key
            if brand_filtered_df is not None:
                brand_group_ids = brand_filtered_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(brand_group_ids))
                sql = f"""
                    SELECT gp.group_id, gp.group_name
                    FROM group_product gp
                    JOIN group_tags gt ON gp.group_id = gt.group_id
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE t.tag_name = %s AND gp.group_id IN ({placeholders})
                """
                params = [tag_name] + brand_group_ids
                cursor.execute(sql, params)
            else:
                sql = """
                    SELECT gp.group_id, gp.group_name
                    FROM group_product gp
                    JOIN group_tags gt ON gp.group_id = gt.group_id
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE t.tag_name = %s AND gp.type = %s
                """
                cursor.execute(sql, (tag_name, device_type))
                
            result = cursor.fetchall()
            if result:
                df = pd.DataFrame(result, columns=["group_id", "group_name"])
                df[f"{tag_name}_rank"] = df.index + 1
                tables_to_merge.append(df[["group_id", "group_name", f"{tag_name}_rank"]])

        # **XỬ LÝ KHI KHÔNG CÓ TAGS**
        if not tables_to_merge:
            if brand_filtered_df is not None:
                combined_df = brand_filtered_df.copy()
                current_group_ids.extend(combined_df['group_id'].tolist())
            else:
                cursor.close()
                conn.close()
                return f"Tôi đề xuất {device} từ {brand_display} dựa trên sở thích thương hiệu của bạn." if brand_display else f"Tôi cần thêm thông tin để đề xuất {device} phù hợp."
        else:
            # Merge DataFrames
            combined_df = tables_to_merge[0]
            for df in tables_to_merge[1:]:
                combined_df = pd.merge(combined_df, df, on=["group_id", "group_name"], how="inner")

            max_rank = max([len(df) for df in tables_to_merge]) + 1
            for col in combined_df.columns:
                if col.endswith("_rank"):
                    combined_df[col] = combined_df[col].fillna(max_rank)

        # **KHỞI TẠO BIẾN CHO MONGODB SEARCH**
        mongo_search_info = {}  # Khởi tạo sớm để tránh lỗi
        
        # **SPECIFIC REQUIREMENTS SEARCH với MongoDB + Elasticsearch**
        if hasattr(reqs, 'specific_requirements') and reqs.specific_requirements and reqs.specific_requirements != '':
            print(f"Processing specific_requirements: {reqs.specific_requirements}")
            filter_params["search"] = reqs.specific_requirements
            has_price_requirement = bool(min_budget or max_budget)
            
            # **BƯỚC 1: Thử MongoDB search trước**
            mongo_search_result = mongodb_search_specific_requirements_get_product_ids(
                query=reqs.specific_requirements,
                device_type=device_type,
                top_k=50
            )
            
            mongo_group_ids = []
            
            if mongo_search_result.get("success") and mongo_search_result.get("product_ids"):
                mongo_product_ids = mongo_search_result["product_ids"]
                mongo_search_info = mongo_search_result["search_info"]
                
                # Map product_ids sang group_ids
                for product_id in mongo_product_ids:
                    mysql_result = find_group_id_by_product_id(str(product_id))
                    if mysql_result.get("status") == "success":
                        group_id = mysql_result.get("group_id")
                        if group_id and group_id not in mongo_group_ids:
                            mongo_group_ids.append(group_id)
                
                print(f"MongoDB found {len(mongo_group_ids)} group_ids for specific_requirements")
                print(f"MongoDB search method: {mongo_search_info.get('search_method', 'Unknown')}")
                print(f"Applied conditions: {len(mongo_search_info.get('applied_conditions', []))}")
            
            # **BƯỚC 2: Nếu MongoDB không có kết quả đủ, dùng Elasticsearch**
            search_group_ids = []
            if len(mongo_group_ids) ==0:  # Threshold để quyết định có dùng ES hay không
                print("MongoDB results insufficient, trying Elasticsearch...")
                
                try:
                    # Lấy group_ids hiện tại để filter (nếu có)
                    current_group_ids_for_es = None
                    if not combined_df.empty:
                        current_group_ids_for_es = [str(gid) for gid in combined_df['group_id'].tolist()]
                    
                    # Tìm kiếm bằng Elasticsearch
                    es_results = search_elasticsearch(
                        query=reqs.specific_requirements,
                        ids=current_group_ids_for_es,  # Filter theo group_ids hiện tại
                        size=top_k * 2
                    )
                    
                    if es_results:
                        es_group_ids = [int(hit.get('group_id')) for hit in es_results if hit.get('group_id')]
                        print(f"Elasticsearch found {len(es_group_ids)} group_ids")
                        
                        # Combine với MongoDB results
                        combined_search_ids = list(set(mongo_group_ids + es_group_ids))
                        search_group_ids = combined_search_ids[:top_k * 2]  # Giới hạn số lượng
                    else:
                        search_group_ids = mongo_group_ids
                except Exception as es_error:
                    print(f"Elasticsearch failed: {str(es_error)}, using MongoDB results only")
                    search_group_ids = mongo_group_ids
            else:
                search_group_ids = mongo_group_ids
                
            print(f"Total search_group_ids: {len(search_group_ids)}")
            
            # **BƯỚC 3: Xử lý kết quả search với combined_df**
            if search_group_ids:
                if not combined_df.empty:
                    # Có tags/filters 
                    existing_group_ids = set(combined_df['group_id'].tolist())
                    search_group_ids_set = set(search_group_ids)
                    intersection_group_ids = list(existing_group_ids.intersection(search_group_ids_set))
                    
                    print(f"Intersection: {len(intersection_group_ids)} group_ids (tags: {len(existing_group_ids)}, search: {len(search_group_ids_set)})")
                    
                    if intersection_group_ids:
                        # Filter combined_df chỉ giữ phần giao
                        combined_df = combined_df[combined_df['group_id'].isin(intersection_group_ids)]
                        
                        # Thêm relevance score dựa trên thứ tự trong search results
                        relevance_scores = {}
                        for i, group_id in enumerate(search_group_ids):
                            if group_id in intersection_group_ids:
                                relevance_scores[group_id] = len(search_group_ids) - i
                        
                        combined_df['relevance_score'] = combined_df['group_id'].map(
                            lambda x: relevance_scores.get(x, 0)
                        )
                        
                        # Sắp xếp theo relevance score
                        combined_df = combined_df.sort_values('relevance_score', ascending=False)
                        print(f"Filtered to intersection and ranked by search relevance")
                    else:
                        print("No intersection between search results and tag filters")
                        
                        if has_price_requirement:
                            # Có yêu cầu về giá - giữ nguyên combined_df từ tags
                            print("Has price requirement - keeping tag results")
                            combined_df['relevance_score'] = 1.0
                        else:
                            # Không có yêu cầu về giá - ưu tiên search results
                            print("No price requirement - prioritizing search results")
                            if search_group_ids:
                                placeholders = ','.join(['%s'] * len(search_group_ids))
                                group_name_sql = f"""
                                    SELECT group_id, group_name 
                                    FROM group_product 
                                    WHERE group_id IN ({placeholders})
                                """
                                cursor.execute(group_name_sql, search_group_ids)
                                group_name_results = cursor.fetchall()
                                
                                combined_df = pd.DataFrame(group_name_results, columns=["group_id", "group_name"])
                                
                                # Thêm relevance score
                                relevance_scores = {}
                                for i, group_id in enumerate(search_group_ids):
                                    relevance_scores[group_id] = len(search_group_ids) - i
                                
                                combined_df['relevance_score'] = combined_df['group_id'].map(
                                    lambda x: relevance_scores.get(x, 0)
                                )
                                
                                # Sắp xếp theo relevance score
                                combined_df = combined_df.sort_values('relevance_score', ascending=False)
                                print(f"Replaced with search results: {len(combined_df)} products")
                            else:
                                combined_df['relevance_score'] = 1.0
                else:
                    # Không có tags/filters - sử dụng toàn bộ kết quả search
                    print("No tag filters - using search results only")
                    
                    # Lấy thông tin group_name từ MySQL
                    if search_group_ids:
                        placeholders = ','.join(['%s'] * len(search_group_ids))
                        group_name_sql = f"""
                            SELECT group_id, group_name 
                            FROM group_product 
                            WHERE group_id IN ({placeholders})
                        """
                        cursor.execute(group_name_sql, search_group_ids)
                        group_name_results = cursor.fetchall()
                        
                        combined_df = pd.DataFrame(group_name_results, columns=["group_id", "group_name"])
                        
                        # Thêm relevance score
                        relevance_scores = {}
                        for i, group_id in enumerate(search_group_ids):
                            relevance_scores[group_id] = len(search_group_ids) - i
                        
                        combined_df['relevance_score'] = combined_df['group_id'].map(
                            lambda x: relevance_scores.get(x, 0)
                        )
                        
                        # Sắp xếp theo relevance score
                        combined_df = combined_df.sort_values('relevance_score', ascending=False)
            else:
                print("No search results found for specific requirements")
                # Không có kết quả search, giữ nguyên combined_df
                if not combined_df.empty:
                    combined_df['relevance_score'] = 1.0  # Điểm mặc định
        
        # **XỬ LÝ GIÁ CẢ** - tương tự hàm cũ
        if min_budget or max_budget:
            if not combined_df.empty:
                group_ids_for_price = combined_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(group_ids_for_price))
                price_sql = f"""
                    SELECT gpj.group_id, gp.group_name, gpj.default_current_price AS price
                    FROM group_product_junction gpj
                    JOIN group_product gp ON gpj.group_id = gp.group_id
                    WHERE gpj.group_id IN ({placeholders})
                    AND (gpj.group_id, gpj.default_current_price) IN (
                        SELECT group_id, MIN(default_current_price)
                        FROM group_product_junction
                        WHERE group_id IN ({placeholders})
                        GROUP BY group_id
                    )
                """
                params = group_ids_for_price + group_ids_for_price
                cursor.execute(price_sql, params)
                result = cursor.fetchall()
                prices_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])

                if not prices_df.empty:
                    combined_df = pd.merge(combined_df, prices_df, on=["group_id", "group_name"], how="inner")
                    if min_budget:
                        combined_df = combined_df[combined_df["price"] >= min_budget]
                    if max_budget and max_budget != 0:
                        combined_df = combined_df[combined_df["price"] <= max_budget]

        # Calculate ranks
        rank_columns = [col for col in combined_df.columns if col.endswith("_rank")]
        if "es_rank" in combined_df.columns:
            rank_columns.append("es_rank")
            
        if rank_columns:
            combined_df["combined_rank"] = combined_df[rank_columns].sum(axis=1)
            top_k_products = combined_df.sort_values(by="combined_rank").head(top_k)
        else:
            # Nếu không có rank columns, lấy theo thứ tự
            top_k_products = combined_df.head(top_k)
        
        # **FIX: ĐẢM BẢO CURRENT_GROUP_IDS LUÔN ĐƯỢC CẬP NHẬT**
        if not top_k_products.empty:
            current_group_ids.extend(top_k_products['group_id'].tolist())
        
        if top_k_products.empty:
            cursor.close()
            conn.close()
            brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
            return f"Không tìm thấy {device}{brand_msg} phù hợp với yêu cầu của bạn."

        # Build response
        brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
        
        # Xác định search method hiển thị
        search_method = "Tags"
        if hasattr(reqs, 'specific_requirements') and reqs.specific_requirements:
            if mongo_search_info:
                search_method = f"Tags + {mongo_search_info.get('search_method', 'MongoDB')}"
            else:
                search_method = "Tags + Elasticsearch"
        
        response = f"Dưới đây là top {top_k} {device}{brand_msg} phù hợp với yêu cầu của bạn ({search_method}):\n"
        
        # **HIỂN THỊ SEARCH CONDITIONS (nếu có)**
        if mongo_search_info and mongo_search_info.get("applied_conditions"):
            response += "\n🔍 **Điều kiện tìm kiếm đã áp dụng:**\n"
            for condition in mongo_search_info["applied_conditions"]:
                field = condition["field"]
                operator = condition["operator"]
                value = condition["value"]
                
                # Translate field names to Vietnamese
                field_translations = {
                    "ram": "RAM",
                    "storage": "Bộ nhớ",
                    "processorModel": "Processor",
                    "processor": "Processor", 
                    "graphicCard": "Card đồ họa",
                    "rearCameraResolution": "Camera sau",
                    "frontCameraResolution": "Camera trước",
                    "batteryCapacity": "Dung lượng pin",
                    "batteryLife": "Thời lượng pin",
                    "screenSize": "Kích thước màn hình",
                    "refreshRate": "Tần số quét",
                    "brand": "Thương hiệu",
                    "productName": "Tên sản phẩm"
                }
                
                field_vn = field_translations.get(field, field)
                
                if operator in ["gte", "gt"]:
                    response += f"  ✓ {field_vn} ≥ {value}\n"
                elif operator in ["lte", "lt"]:
                    response += f"  ✓ {field_vn} ≤ {value}\n"
                elif operator == "eq":
                    response += f"  ✓ {field_vn} = {value}\n"
                elif operator == "regex":
                    response += f"  ✓ {field_vn} chứa '{value}'\n"
                elif operator == "elemMatch":
                    response += f"  ✓ {field_vn} có '{value}'\n"
                else:
                    response += f"  ✓ {field_vn}: {value}\n"
            response += "\n"
        
        for _, product in top_k_products.iterrows():
            product_info = f"- {product['group_name']} (ID: {product['group_id']}"
            
            # Hiển thị relevance score nếu có
            if "relevance_score" in product and not pd.isna(product["relevance_score"]) and product["relevance_score"] > 0:
                product_info += f", relevance: {product['relevance_score']:.1f}"
            elif "combined_rank" in product and not pd.isna(product["combined_rank"]):
                product_info += f", rank: {int(product['combined_rank'])}"
                
            if "price" in product and not pd.isna(product["price"]):
                product_info += f", giá: {int(product['price']):,} đồng"
            product_info += ")"
            response += product_info + "\n"
            
        cursor.close()
        conn.close()
        return response

    except Exception as e:
        print(f"Error in product_consultation_tool_mongo: {str(e)}")
        return f"Lỗi trong quá trình truy vấn: {str(e)}"

def mongodb_search_specific_requirements_get_product_ids(query: str, device_type: str, top_k: int = 100) -> Dict[str, Any]:
    """
    Sử dụng LLM để phân tích specific requirements và tạo câu truy vấn MongoDB thông minh.
    
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
        try:
            from all_fields_by_class import device_type_to_class, all_fields_by_class
        except ImportError:
            # Fallback mappings nếu không tìm thấy file
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
                    # Thông tin cơ bản
                    "brand", "productName", "description"
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
                    "batteryType", "maxChargingPower", "batteryFeatures","batteryCapacity"
                    # Kết nối
                    "mobileNetwork", "simType", "wifi", "bluetooth", "gps", "headphoneJack", "otherConnectivity",
                    # Bảo mật và tính năng
                    "securityFeatures", "specialFeatures", "waterResistance",
                    # Media
                    "recording", "video", "audio",
                    # Thiết kế
                    "designType", "materials", "sizeWeight",
                    # Thông tin cơ bản
                    "brand", "productName", "description"
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
                    # Thông tin cơ bản
                    "brand", "productName", "description"
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
                    # Thông tin cơ bản
                    "brand", "productName", "description"
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
                    # Thông tin cơ bản
                    "brand", "productName", "description"
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
                    # Thông tin cơ bản
                    "brand", "productName", "description"
                ]
            }
        
        # **BƯỚC 1: Sử dụng LLM để phân tích specific requirements**
        device_fields = all_fields_by_class.get(device_type.lower(), [])
        
        llm_prompt = f"""
Phân tích specific requirements và tạo MongoDB query cho {device_type}.

SPECIFIC REQUIREMENTS: "{query}"

Các fields có sẵn cho {device_type}: {device_fields}

FIELD TYPES FOR {device_type.upper()}:

LAPTOP FIELDS:
- Numeric: ram, maxRam, ramBusSpeed, coreCount, threadCount, refreshRate, battery, cpuSpeed, maxCpuSpeed
- String: processorModel, ramType, screenSize, resolution, graphicCard, webcam, keyboardBacklight, size, material, os, brand, productName, description
- Arrays: storage, colorGamut, displayTechnology, audioTechnology, ports, wirelessConnectivity, otherFeatures, touchScreen

PHONE FIELDS:
- Numeric: ram, storage, availableStorage, maxBrightness, maxChargingPower, batteryCapacity
- String: processor, cpuSpeed, gpu, os, displayTechnology, displayResolution, screenSize, batteryType, mobileNetwork, simType, headphoneJack, waterResistance, designType, materials, sizeWeight, rearCameraResolution, frontCameraResolution, rearFlash, contactLimit, screenProtection, chargingPort, brand, productName, description
- Arrays: rearCameraFeatures, frontCameraFeatures, rearVideoRecording, batteryFeatures, securityFeatures, specialFeatures, recording, video, audio, wifi, bluetooth, gps, otherConnectivity

WIRELESS_EARPHONE FIELDS:
- Numeric: batteryLife, chargingCaseBatteryLife, weight (extracted from text values)
- String: simultaneousConnections, size, brandOrigin, manufactured, brand, productName, description
- Arrays: chargingPort, audioTechnology, compatibility, connectionApp, features, connectionTechnology, controlType, controlButtons

BACKUP_CHARGER FIELDS:
- Numeric: batteryCapacity, weight (extracted from capacity and weight values)
- String: chargingEfficiency, batteryCellType, size, brandOrigin, manufactured, brand, productName, description
- Arrays: input, output, chargingTime, technologyFeatures

HEADPHONE FIELDS:
- Numeric: weight (extracted from text values)
- String: batteryLife, chargingPort, audioJack, cableLength, simultaneousConnections, size, brandOrigin, manufactured, connectionApp, brand, productName, description
- Arrays: connectionTechnology, compatibility, features, controlType, controlButtons, audioTechnology

WIRED_EARPHONE FIELDS:
- Numeric: weight
- String: audioJack, cableLength, simultaneousConnections, brandOrigin, manufactured, brand, productName, description
- Arrays: audioTechnology, compatibility, features, controlType, controlButtons

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
1. **NUMERIC FIELDS** (dùng numeric operators: gte, lte, gt, lt):
   - RAM: "8GB", "16GB" → value: 8, 16
   - Storage/Dung lượng: "512GB", "1TB" → value: 512, 1024
   - CPU Speed: "2.4GHz", "3.2GHz" → value: 2.4, 3.2
   - Battery/Pin: "4000mAh", "5000mAh" → value: 4000, 5000
   - Camera: "48MP", "108MP" → value: 48, 108
   - Screen size: "6.1 inch", "15.6 inch" → value: 6.1, 15.6

2. **STRING FIELDS** (dùng regex):
   - Processor/Chip: "Snapdragon 8 Gen 2", "Intel i7", "Ryzen 5"
   - GPU/Card đồ họa: "RTX 4070", "GTX 1650", "Adreno 740"
   - OS: "Windows 11", "Android 13", "iOS 16"
   - Brand: "Apple", "Samsung", "Dell"

3. **ARRAY FIELDS** (dùng elemMatch hoặc in):
   - Features/Tính năng: "OIS", "5G", "Face ID", "Wireless charging"
   - Connectivity: "Wi-Fi 6", "Bluetooth 5.3", "USB-C", "Lightning"
   - Display tech: "OLED", "IPS", "AMOLED", "Retina"
   - Audio tech: "Dolby Atmos", "DTS:X", "Hi-Res Audio"

4. **PHÂN BIỆT TOÁN TỬ SO SÁNH CHÍNH XÁC:**
   - "lớn hơn X", "trên X", "hơn X", "cao hơn X" → operator: "gt" (strictly greater than)
   - "từ X trở lên", "ít nhất X", "X trở lên", "tối thiểu X" → operator: "gte" (greater than or equal)
   - "nhỏ hơn X", "dưới X", "thấp hơn X", "ít hơn X" → operator: "lt" (strictly less than)  
   - "tối đa X", "không quá X", "X trở xuống", "nhiều nhất X" → operator: "lte" (less than or equal)
   - "bằng X", "đúng X", "chính xác X" → operator: "eq" (equal)

5. **XỬ LÝ MIN/MAX**:
   - "cao nhất", "tốt nhất", "mạnh nhất" → sort order: "desc"
   - "thấp nhất", "rẻ nhất", "nhẹ nhất" → sort order: "asc"
   - Không cần conditions cho min/max, chỉ cần sort_fields

6. **KEYWORDS QUAN TRỌNG**:
   - text_search_keywords: các từ khóa quan trọng để tìm kiếm full-text
   - text_search_fields: thường là ["productName", "description"] + related fields

Ví dụ laptop:
Input: "laptop gaming RAM 16GB RTX 4070 SSD 1TB"
Output: {{
    "conditions": [
        {{"field": "ram", "operator": "gte", "value": "16", "type": "number", "is_array": false}},
        {{"field": "graphicCard", "operator": "regex", "value": "RTX 4070", "type": "string", "is_array": false}},
        {{"field": "storage", "operator": "elemMatch", "value": "1TB SSD", "type": "string", "is_array": true}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description", "graphicCard"],
    "text_search_keywords": ["gaming", "16GB", "RTX", "4070", "1TB", "SSD"]
}}

Input: "laptop pin cao nhất"
Output: {{
    "conditions": [],
    "sort_fields": [
        {{"field": "battery", "order": "desc", "priority": 1}}
    ],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["pin", "cao nhất", "battery"]
}}

Ví dụ phone:
Input: "điện thoại camera 108MP chip Snapdragon pin 5000mAh"
Output: {{
    "conditions": [
        {{"field": "rearCameraResolution", "operator": "gte", "value": "108", "type": "number", "is_array": false}},
        {{"field": "processor", "operator": "regex", "value": "Snapdragon", "type": "string", "is_array": false}},
        {{"field": "batteryCapacity", "operator": "gte", "value": "5000", "type": "number", "is_array": false}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description", "processor"],
    "text_search_keywords": ["108MP", "Snapdragon", "5000mAh", "camera", "chip", "pin"]
}}

Input: "điện thoại pin lớn hơn 6000 mAh"
Output: {{
    "conditions": [
        {{"field": "batteryCapacity", "operator": "gt", "value": "6000", "type": "number", "is_array": false}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["pin", "lớn hơn", "6000", "mAh"]
}}

Input: "điện thoại màn hình lớn nhất"
Output: {{
    "conditions": [],
    "sort_fields": [
        {{"field": "screenSize", "order": "desc", "priority": 1}}
    ],
    "text_search_fields": ["productName", "screenSize"],
    "text_search_keywords": ["màn hình", "lớn nhất", "screen"]
}}

Ví dụ wireless_earphone:
Input: "tai nghe không dây pin 8 giờ chống nước Bluetooth 5.3"
Output: {{
    "conditions": [
        {{"field": "batteryLife", "operator": "gte", "value": "8", "type": "number", "is_array": false}},
        {{"field": "features", "operator": "elemMatch", "value": "chống nước", "type": "string", "is_array": true}},
        {{"field": "connectionTechnology", "operator": "elemMatch", "value": "Bluetooth 5.3", "type": "string", "is_array": true}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["không dây", "8 giờ", "chống nước", "Bluetooth", "5.3"]
}}

Ví dụ backup_charger:
Input: "sạc dự phòng 20000mAh sạc nhanh PD USB-C"
Output: {{
    "conditions": [
        {{"field": "batteryCapacity", "operator": "gte", "value": "20000", "type": "number", "is_array": false}},
        {{"field": "technologyFeatures", "operator": "elemMatch", "value": "sạc nhanh", "type": "string", "is_array": true}},
        {{"field": "technologyFeatures", "operator": "elemMatch", "value": "PD", "type": "string", "is_array": true}},
        {{"field": "output", "operator": "elemMatch", "value": "USB-C", "type": "string", "is_array": true}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["20000mAh", "sạc nhanh", "PD", "USB-C"]
}}

Ví dụ headphone:
Input: "tai nghe chụp tai pin 50 giờ có mic noise cancelling"
Output: {{
    "conditions": [
        {{"field": "batteryLife", "operator": "regex", "value": "50", "type": "string", "is_array": false}},
        {{"field": "features", "operator": "elemMatch", "value": "mic", "type": "string", "is_array": true}},
        {{"field": "features", "operator": "elemMatch", "value": "noise cancelling", "type": "string", "is_array": true}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["chụp tai", "50 giờ", "mic", "noise cancelling"]
}}

Ví dụ wired_earphone:
Input: "tai nghe có dây jack 3.5mm có mic tương thích điện thoại"
Output: {{
    "conditions": [
        {{"field": "audioJack", "operator": "regex", "value": "3.5mm", "type": "string", "is_array": false}},
        {{"field": "features", "operator": "elemMatch", "value": "mic", "type": "string", "is_array": true}},
        {{"field": "compatibility", "operator": "elemMatch", "value": "điện thoại", "type": "string", "is_array": true}}
    ],
    "sort_fields": [],
    "text_search_fields": ["productName", "description"],
    "text_search_keywords": ["có dây", "3.5mm", "mic", "tương thích"]
}}

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH.
"""

        print(f"LLM analyzing specific requirements: {query}")
        llm_response = llm.complete(llm_prompt)
        print("LLM response:",llm_response)
        # Parse LLM response
        import json
        import re
        
        response_text = llm_response.text.strip()
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            print("LLM response invalid, falling back to keyword search")
            return mongodb_search_fallback_keywords(query, device_type, top_k)
        
        try:
            llm_analysis = json.loads(json_match.group())
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}, falling back to keyword search")
            return mongodb_search_fallback_keywords(query, device_type, top_k)
        
        print(f"LLM analysis: {llm_analysis}")
        
        # **BƯỚC 2: Kết nối MongoDB**
        db = mongodb.connect()
        if db is None:
            print("Cannot connect to MongoDB")
            return []
        
        collection = mongodb.get_collection("baseProduct")
        if collection is None:
            print("Cannot find baseProduct collection")
            return []
        
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
            
            # Xây dựng MongoDB condition
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
        
        # **BƯỚC 4: Xây dựng MongoDB aggregation pipeline**
        pipeline_stages = []
        
        # Match stage với conditions
        field_conditions_count = len(match_conditions) - (1 if base_filter else 0)
        
        if field_conditions_count > 0:
            if len(match_conditions) == 1:
                match_stage = match_conditions[0]
            else:
                match_stage = {"$and": match_conditions}
            pipeline_stages.append({"$match": match_stage})
            print(f"Added match stage: {match_stage}")
        
        # Sort stage với sort_fields từ LLM
        sort_fields = llm_analysis.get("sort_fields", [])
        if sort_fields:
            sort_spec = {}
            # Sort theo priority
            sorted_fields = sorted(sort_fields, key=lambda x: x.get("priority", 999))
            for sort_field in sorted_fields:
                field_name = sort_field.get("field")
                order = sort_field.get("order", "desc")
                if field_name:
                    sort_spec[field_name] = -1 if order == "desc" else 1
            
            if sort_spec:
                pipeline_stages.append({"$sort": sort_spec})
                print(f"Added sort stage: {sort_spec}")
        
        # Limit stage
        pipeline_stages.append({"$limit": top_k})
        
        # Thực hiện aggregation pipeline
        if pipeline_stages:
            print(f"MongoDB aggregation pipeline: {pipeline_stages}")
            results = list(collection.aggregate(pipeline_stages))
        else:
            # Fallback to simple find
            results = list(collection.find(base_filter, {"_id": 1}).limit(top_k))
        
        product_ids = [str(doc['_id']) for doc in results]
        print(f"Pipeline search found {len(product_ids)} product_ids")
        
        # Nếu có kết quả từ pipeline, return luôn
        if product_ids:
            search_method = "MongoDB Field Conditions"
            if sort_fields:
                search_method += " + Sort"
                
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
        print("Step 2 - Field conditions found no results, trying with text search...")
        
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
        
        print(f"Step 2 - Field + Text MongoDB filter: {final_filter}")
        
        # **BƯỚC 7: Thực hiện search với text search**
        results = list(collection.find(final_filter, {"_id": 1}).limit(top_k))
        
        # Extract product_ids
        product_ids = [str(doc['_id']) for doc in results]
        
        print(f"Field + Text search found {len(product_ids)} product_ids")
        
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
        print(f"Error in LLM MongoDB search: {str(e)}")
        print("Falling back to keyword search")
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
        try:
            from all_fields_by_class import device_type_to_class
        except ImportError:
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
        
        print(f"Fallback search found {len(product_ids)} product_ids")
        return product_ids
        
    except Exception as e:
        print(f"Error in fallback search: {str(e)}")
        return []
>>>>>>> server
    finally:
        mongodb.disconnect()


<<<<<<< HEAD
def values_based_search(device_type: str, field_names: List[str], values: Dict[str, str], top_k: int = 5) -> str:
    """
    Hàm tìm kiếm sản phẩm theo giá trị cụ thể của nhiều trường (kết hợp AND).
    
    Args:
        device_type (str): Loại thiết bị ("laptop", "phone", "wireless_earphone", "wired_earphone", "headphone", "backup_charger", "all")
        field_names (List[str]): Danh sách tên trường cần hiển thị trong kết quả
        values (Dict[str, str]): Dictionary chứa điều kiện tìm kiếm theo giá trị cụ thể {field_name: value}
        top_k (int): Số lượng sản phẩm muốn hiển thị
    
    Returns:
        str: Kết quả tìm kiếm sản phẩm
        
    Examples:
        >>> # Tìm laptop có RAM = "32 GB" và processor chứa "Intel i7"
        >>> values_based_search("laptop", ["ram", "processor", "batteryCapacity"], {"ram": "32 GB", "processor": "Intel i7"}, 5)
        
        >>> # Tìm điện thoại có màn hình = "6.7 inch" và processor chứa "Apple"
        >>> values_based_search("phone", ["screenSize", "processor", "ram"], {"screenSize": "6.7\"", "processor": "Apple"}, 3)
        
        >>> # Tìm tai nghe có pin = "8 giờ" và brand = "Sony"
        >>> values_based_search("wireless_earphone", ["batteryCapacity", "brand"], {"batteryCapacity": "8 giờ", "brand": "Sony"}, 5)
        
        >>> # Tìm sạc dự phòng có dung lượng = "20000 mAh"
        >>> values_based_search("backup_charger", ["batteryCapacity", "brand"], {"batteryCapacity": "20000 mAh"}, 3)
    """
    try:
        current_group_ids.clear()
        
        # Kết nối đến MongoDB
        db = mongodb.connect()
        if db is None:
            return "Không thể kết nối đến cơ sở dữ liệu MongoDB."
=======

def debug_mongodb_field_data(device_type: str = "phone", field_name: str = "frontCameraResolution", limit: int = 10) -> str:
    """
    Debug function để kiểm tra data trong MongoDB field và test regex extraction.
    
    Args:
        device_type: Loại thiết bị để test
        field_name: Field name để kiểm tra
        limit: Số lượng sample records
        
    Returns:
        str: Debug information
    """
    try:
        from all_fields_by_class import device_type_to_class
    except ImportError:
        device_type_to_class = {
            "laptop": "com.eazybytes.model.Laptop",
            "phone": "com.eazybytes.model.Phone", 
            "wireless_earphone": "com.eazybytes.model.WirelessEarphone",
            "wired_earphone": "com.eazybytes.model.WiredEarphone",
            "headphone": "com.eazybytes.model.Headphone",
            "backup_charger": "com.eazybytes.model.BackupCharger"
        }
    
    try:
        # Kết nối MongoDB
        db = mongodb.connect()
        if db is None:
            return "❌ Cannot connect to MongoDB"
        
        collection = mongodb.get_collection("baseProduct")
        if collection is None:
            return "❌ Cannot find baseProduct collection"
        
        # Base filter
        base_filter = {}
        if device_type in device_type_to_class:
            base_filter["_class"] = device_type_to_class[device_type]
        
        # Lấy sample data
        projection = {field_name: 1, "productName": 1, "brand": 1, "_id": 1}
        sample_docs = list(collection.find(base_filter, projection).limit(limit))
        
        output = []
        output.append(f"=== DEBUG MongoDB Field: {field_name} (Device: {device_type}) ===")
        output.append(f"Base filter: {base_filter}")
        output.append(f"Found {len(sample_docs)} sample documents")
        output.append("")
        
        # Analyze sample data
        field_values = []
        for i, doc in enumerate(sample_docs, 1):
            product_name = doc.get('productName', 'N/A')
            brand = doc.get('brand', 'N/A')
            field_value = doc.get(field_name, 'N/A')
            doc_id = str(doc.get('_id', 'N/A'))
            
            output.append(f"{i}. Product: {product_name} - {brand}")
            output.append(f"   {field_name}: \"{field_value}\"")
            output.append(f"   _id: {doc_id}")
            
            if field_value != 'N/A':
                field_values.append(str(field_value))
            
            output.append("")
        
        # Test regex extraction
        output.append("=== REGEX EXTRACTION ANALYSIS ===")
        import re
        
        unique_values = list(set(field_values))[:10]  # Test max 10 unique values
        output.append(f"Testing {len(unique_values)} unique field values:")
        output.append("")
        
        extraction_success = 0
        for val in unique_values:
            numbers = re.findall(r'(\d+(?:\.\d+)?)', str(val))
            if numbers:
                extracted = float(numbers[0])
                output.append(f"✓ \"{val}\" → {extracted}")
                extraction_success += 1
            else:
                output.append(f"✗ \"{val}\" → No number found")
        
        output.append("")
        output.append("=== MONGODB QUERY TEST ===")
        
        # Test query với value = 12
        test_value = 12.0
        mongo_filter = {
            "$and": [
                base_filter,
                {
                    "$expr": {
                        "$gte": [
                            {
                                "$convert": {
                                    "input": {
                                        "$arrayElemAt": [
                                            {
                                                "$map": {
                                                    "input": {"$regexFindAll": {"input": f"${field_name}", "regex": r"(\d+(?:\.\d+)?)"}},
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
                            test_value
                        ]
                    }
                }
            ]
        }
        
        output.append(f"Testing MongoDB query for {field_name} >= {test_value}")
        output.append("Query filter:")
        output.append(str(mongo_filter))
        
        query_results = list(collection.find(mongo_filter, projection).limit(5))
        output.append(f"Query results: {len(query_results)} documents found")
        
        for i, doc in enumerate(query_results, 1):
            product_name = doc.get('productName', 'N/A')
            field_value = doc.get(field_name, 'N/A')
            output.append(f"  {i}. {product_name}: {field_value}")
        
        return "\n".join(output)
        
    except Exception as e:
        return f"❌ Error in debug: {str(e)}\n{traceback.format_exc()}"
    finally:
        mongodb.disconnect()

def handle_superlative_query(query: str, device_type: str, top_k: int = 5) -> str:
    """
    Xử lý các query tìm kiếm "lớn nhất", "cao nhất", "tối đa" với unit validation.
    
    Args:
        query: Query chứa từ khóa superlative
        device_type: Loại thiết bị
        top_k: Số lượng kết quả
        
    Returns:
        str: Kết quả tìm kiếm theo tiêu chí "lớn nhất"
    """
    try:
        from all_fields_by_class import device_type_to_class
    except ImportError:
        device_type_to_class = {
            "laptop": "com.eazybytes.model.Laptop",
            "phone": "com.eazybytes.model.Phone", 
            "wireless_earphone": "com.eazybytes.model.WirelessEarphone",
            "wired_earphone": "com.eazybytes.model.WiredEarphone",
            "headphone": "com.eazybytes.model.Headphone",
            "backup_charger": "com.eazybytes.model.BackupCharger"
        }
    
    try:
        # Import config functions
        from tools.superlative_fields_config import (
            find_superlative_field_by_keywords,
            get_default_superlative_field,
            validate_field_value_has_unit,
            get_superlative_field_config
        )
        
        # **BƯỚC 1: Tìm field cần tìm max dựa trên config**
        target_field, field_config = find_superlative_field_by_keywords(device_type, query)
        
        # Nếu không tìm được field cụ thể, dùng field mặc định
        if not target_field or not field_config:
            target_field, field_config = get_default_superlative_field(device_type)
            print(f"Using default field: {target_field}")
        
        if not target_field or not field_config:
            return f"Không thể xác định trường tìm kiếm 'lớn nhất' cho {device_type}."
        
        field_name_vn = field_config.get("name_vn", target_field)
        required_units = field_config.get("required_units", [])
        unit_regex = field_config.get("unit_regex", "")
        sort_order = field_config.get("sort_order", "desc")
        
        print(f"Superlative search: {device_type} with max {target_field} ({field_name_vn})")
        print(f"Required units: {required_units}")
        print(f"Unit regex: {unit_regex}")
        
        # **BƯỚC 2: MongoDB aggregation để tìm max values với unit validation**
        db = mongodb.connect()
        if db is None:
            return "Không thể kết nối MongoDB để tìm giá trị lớn nhất."
>>>>>>> server
        
        collection = mongodb.get_collection("baseProduct")
        if collection is None:
            return "Không tìm thấy collection baseProduct."
        
<<<<<<< HEAD
        # Xây dựng base filter theo device_type (cập nhật mapping theo data thực tế)
        base_filter = {}
        if device_type == "laptop":
            base_filter["_class"] = "com.eazybytes.model.Laptop"
        elif device_type == "phone":
            base_filter["_class"] = "com.eazybytes.model.Phone" 
        elif device_type == "wireless_earphone":
            base_filter["_class"] = "com.eazybytes.model.WirelessEarphone"
        elif device_type == "wired_earphone":
            base_filter["_class"] = "com.eazybytes.model.WiredEarphone"
        elif device_type == "headphone":
            base_filter["_class"] = "com.eazybytes.model.Headphone"
        elif device_type == "backup_charger":
            base_filter["_class"] = "com.eazybytes.model.BackupCharger"
        elif device_type == "cable_charger_hub":
            base_filter["_class"] = "com.eazybytes.model.CableChargerHub"
        
        # Xây dựng pipeline với điều kiện AND cho tất cả values
        match_conditions = [base_filter]
        
        # Xây dựng điều kiện cho từng field trong values
        for field_name, search_value in values.items():
            # Tìm kiếm bằng regex cho tất cả các trường (cả text và số)
            condition = {field_name: {"$regex": search_value, "$options": "i"}}
            match_conditions.append(condition)
        
        # Xây dựng pipeline
        pipeline = []
        
        # Kết hợp tất cả điều kiện với AND
        if len(match_conditions) == 1:
            pipeline.append({"$match": match_conditions[0]})
        else:
            pipeline.append({"$match": {"$and": match_conditions}})
        
        # Thêm sort và limit
        pipeline.append({"$sort": {"productName": 1}})
        pipeline.append({"$limit": top_k})
        
        # Thực hiện tìm kiếm
        results = list(collection.aggregate(pipeline))
        
        if not results:
            device_text = device_type if device_type != "all" else "sản phẩm"
            # Tạo chuỗi hiển thị điều kiện tìm kiếm
            search_conditions = []
            for field_name, search_value in values.items():
                search_conditions.append(f"{field_name} chứa '{search_value}'")
            conditions_text = " VÀ ".join(search_conditions)
            return f"Không tìm thấy {device_text} nào có {conditions_text}."
        
        # Xử lý kết quả
        output = []
        device_text = device_type if device_type != "all" else "sản phẩm"
        
        # Tạo chuỗi hiển thị điều kiện tìm kiếm
        search_conditions = []
        for field_name, search_value in values.items():
            search_conditions.append(f"{field_name} chứa '{search_value}'")
        conditions_text = " VÀ ".join(search_conditions)
        
        output.append(f"=== {len(results)} {device_text} có {conditions_text} ===\n")
        
        for i, product in enumerate(results, 1):
            group_id = str(product.get('_id', ''))
            if group_id:
                current_group_ids.append(group_id)
            
            name = product.get('productName', 'Tên không xác định')
            brand = product.get('brand', 'Không xác định')
            
            product_info = f"{i}. {name} - {brand}"
            
            # Hiển thị các trường được yêu cầu trong field_names
            for field_name in field_names:
                field_value = product.get(field_name, 'Không xác định')
                
                # Hiển thị trường với tên phù hợp (cập nhật theo data thực tế)
                if field_name == "batteryCapacity":
                    product_info += f"\n   Pin: {field_value}"
                elif field_name == "batteryLife":
                    product_info += f"\n   Thời lượng pin: {field_value}"
                elif field_name == "chargingCaseBatteryLife":
                    product_info += f"\n   Pin hộp sạc: {field_value}"
                elif field_name == "ram":
                    product_info += f"\n   RAM: {field_value}"
                elif field_name == "storage":
                    product_info += f"\n   Storage: {field_value}"
                elif field_name == "screenSize":
                    product_info += f"\n   Màn hình: {field_value}"
                elif field_name == "processor":
                    product_info += f"\n   Processor: {field_value}"
                elif field_name == "brand":
                    product_info += f"\n   Thương hiệu: {field_value}"
                elif field_name == "productName":
                    product_info += f"\n   Tên sản phẩm: {field_value}"
                elif field_name == "rearCameraResolution":
                    product_info += f"\n   Camera sau: {field_value}"
                elif field_name == "frontCameraResolution":
                    product_info += f"\n   Camera trước: {field_value}"
                elif field_name == "displayTechnology":
                    product_info += f"\n   Công nghệ màn hình: {field_value}"
                elif field_name == "refreshRate":
                    product_info += f"\n   Tần số quét: {field_value}"
                else:
                    product_info += f"\n   {field_name}: {field_value}"
            
            product_info += f"\n   Group ID: {group_id}"
            output.append(product_info)
            output.append("")  # Dòng trống
            
        return "\n".join(output)
        
    except Exception as e:
        return f"Lỗi khi tìm kiếm theo values: {str(e)}"
    finally:
        mongodb.disconnect()

=======
        # Base filter
        base_filter = {}
        if device_type in device_type_to_class:
            base_filter["_class"] = device_type_to_class[device_type]
        
        # **BƯỚC 3: Aggregation pipeline với unit validation**
        pipeline = [
            {"$match": base_filter},
            {
                "$addFields": {
                    "field_value": f"${target_field}",
                    "has_valid_unit": {
                        "$cond": [
                            {"$ne": [f"${target_field}", None]},
                            {
                                "$cond": [
                                    {"$regexMatch": {"input": f"${target_field}", "regex": unit_regex, "options": "i"}},
                                    True,
                                    False
                                ]
                            },
                            False
                        ]
                    } if unit_regex else True,
                    "numeric_value": {
                        "$convert": {
                            "input": {
                                "$arrayElemAt": [
                                    {
                                        "$map": {
                                            "input": {"$regexFindAll": {"input": f"${target_field}", "regex": r"(\d+(?:\.\d+)?)"}},
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
                    }
                }
            },
            {
                "$match": {
                    "has_valid_unit": True,
                    "numeric_value": {"$gt": 0}
                }
            },
            {"$sort": {"numeric_value": -1 if sort_order == "desc" else 1}},
            {"$limit": top_k * 3},  # Lấy nhiều hơn để đảm bảo có đủ sau khi convert
            {
                "$project": {
                    "_id": 1, 
                    "productName": 1, 
                    "brand": 1, 
                    target_field: 1, 
                    "field_value": 1,
                    "numeric_value": 1,
                    "has_valid_unit": 1
                }
            }
        ]
        
        print(f"MongoDB aggregation pipeline: {pipeline}")
        results = list(collection.aggregate(pipeline))
        
        if not results:
            return f"Không tìm thấy {device_type} nào có {field_name_vn} hợp lệ với đơn vị {required_units}."
        
        print(f"MongoDB found {len(results)} products with valid units")
        
        # **BƯỚC 4: Log một vài kết quả để debug**
        print("Sample results:")
        for i, result in enumerate(results[:3]):
            print(f"  {i+1}. {result.get('productName', 'N/A')}: {result.get('field_value', 'N/A')} (numeric: {result.get('numeric_value', 0)}, valid_unit: {result.get('has_valid_unit', False)})")
        
        # **BƯỚC 5: Convert product_ids to group_ids**
        max_group_ids = []
        max_info = []
        
        for result in results:
            if len(max_group_ids) >= top_k:
                break
                
            product_id = str(result['_id'])
            mysql_result = find_group_id_by_product_id(product_id)
            
            if mysql_result.get("status") == "success":
                group_id = mysql_result.get("group_id")
                if group_id and group_id not in max_group_ids:
                    max_group_ids.append(group_id)
                    max_info.append({
                        "group_id": group_id,
                        "product_name": result.get('productName', 'N/A'),
                        "brand": result.get('brand', 'N/A'),
                        "field_value": result.get('field_value', 'N/A'),
                        "numeric_value": result.get('numeric_value', 0),
                        "has_valid_unit": result.get('has_valid_unit', False)
                    })
        
        if not max_group_ids:
            return f"Không tìm thấy mapping MySQL cho {device_type} có {field_name_vn} lớn nhất."
        
        # **BƯỚC 6: Get detailed info from MySQL**
        conn = mysql.connect()
        cursor = conn.cursor()
        
        placeholders = ','.join(['%s'] * len(max_group_ids))
        detail_sql = f"""
            SELECT 
                gp.group_id, 
                gp.group_name, 
                gp.brand,
                gp.type,
                MIN(gpj.default_current_price) AS min_price,
                GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name) AS tags
            FROM group_product gp
            LEFT JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
            LEFT JOIN group_tags gt ON gp.group_id = gt.group_id
            LEFT JOIN tags t ON gt.tag_id = t.tag_id
            WHERE gp.group_id IN ({placeholders}) AND gp.type = %s
            GROUP BY gp.group_id, gp.group_name, gp.brand, gp.type
            ORDER BY FIELD(gp.group_id, {placeholders})
        """
        
        params = max_group_ids + [device_type] + max_group_ids
        cursor.execute(detail_sql, params)
        mysql_results = cursor.fetchall()
        
        # **BƯỚC 7: Build response**
        current_group_ids.clear()
        current_group_ids.extend(max_group_ids)
        
        filter_params.clear()
        filter_params.update({
            "search": query,
            "type": device_type,
            "method": "superlative_mongodb_max_with_units",
            "target_field": target_field,
            "required_units": ",".join(required_units)
        })
        
        device_name_map = {
            "laptop": "laptop", "phone": "điện thoại", 
            "wireless_earphone": "tai nghe không dây", "wired_earphone": "tai nghe có dây", 
            "headphone": "headphone", "backup_charger": "sạc dự phòng"
        }
        device_name = device_name_map.get(device_type, device_type)
        
        response = []
        response.append(f"**Top {device_name} có {field_name_vn} lớn nhất**")
        response.append(f"Yêu cầu: '{query}'")
        response.append(f"Tiêu chí: {field_name_vn} cao nhất (đơn vị: {', '.join(required_units)})")
        response.append(f"Kết quả: {len(max_group_ids)} sản phẩm hợp lệ")
        response.append("")
        
        # Create mapping for easy lookup
        info_map = {info['group_id']: info for info in max_info}
        
        for i, result in enumerate(mysql_results, 1):
            group_id, group_name, brand, product_type, min_price, tags = result
            
            # Get MongoDB info
            mongo_info = info_map.get(group_id, {})
            field_value = mongo_info.get('field_value', 'N/A')
            numeric_value = mongo_info.get('numeric_value', 0)
            has_valid_unit = mongo_info.get('has_valid_unit', False)
            
            product_info = f"**{i}. {group_name}** - {brand}"
            product_info += f"\n   Group ID: {group_id}"
            product_info += f"\n   {field_name_vn}: {field_value}"
            if numeric_value > 0:
                product_info += f" (giá trị số: {numeric_value})"
            if has_valid_unit:
                product_info += " ✓"
            else:
                product_info += " (đơn vị không chuẩn)"
            product_info += f"\n   Giá từ: {int(min_price):,} đồng" if min_price else "\n   💰 Giá: Đang cập nhật"
            
            response.append(product_info)
            
            
        
        # Thêm thống kê
        if max_info:
            max_value = max_info[0]['numeric_value']
            min_value = max_info[-1]['numeric_value']
            valid_units_count = sum(1 for info in max_info if info.get('has_valid_unit', False))
            
            response.append(f"📈 **Thống kê {field_name_vn}:**")
            response.append(f"   • Giá trị cao nhất: {max_value}")
            response.append(f"   • Giá trị thấp nhất trong top: {min_value}")
            response.append(f"   • Sản phẩm có đơn vị hợp lệ: {valid_units_count}/{len(max_info)}")
            response.append(f"   • Đơn vị được chấp nhận: {', '.join(required_units)}")
            response.append("")
        
        response.append("💡 **Ghi chú:**")
        response.append(f"   • Kết quả được sắp xếp theo {field_name_vn} từ cao đến thấp")
        response.append(f"   • Chỉ tính các sản phẩm có đơn vị hợp lệ: {', '.join(required_units)}")
        response.append("   • ✓ = Có đơn vị hợp lệ, ⚠️ = Đơn vị không chuẩn")
        
        cursor.close()
        conn.close()
        return "\n".join(response)
        
    except Exception as e:
        print(f"Error in handle_superlative_query: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Fallback to simple approach if config fails
        try:
            return handle_superlative_query_fallback(query, device_type, top_k)
        except:
            return f"Lỗi tìm kiếm {device_type} với tiêu chí 'lớn nhất': {str(e)}"
    finally:
        mongodb.disconnect()

def handle_superlative_query_fallback(query: str, device_type: str, top_k: int = 5) -> str:
    """
    Fallback method khi config system fails.
    """
    try:
        from all_fields_by_class import device_type_to_class
    except ImportError:
        device_type_to_class = {
            "laptop": "com.eazybytes.model.Laptop",
            "phone": "com.eazybytes.model.Phone", 
            "wireless_earphone": "com.eazybytes.model.WirelessEarphone",
            "wired_earphone": "com.eazybytes.model.WiredEarphone",
            "headphone": "com.eazybytes.model.Headphone",
            "backup_charger": "com.eazybytes.model.BackupCharger"
        }
    
    # Simple field mapping as fallback
    fallback_mapping = {
        "laptop": ("ram", "RAM"),
        "phone": ("batteryCapacity", "Dung lượng pin"),
        "wireless_earphone": ("batteryLife", "Thời lượng pin"),
        "headphone": ("batteryLife", "Thời lượng pin"),
        "backup_charger": ("batteryCapacity", "Dung lượng pin"),
        "wired_earphone": ("cableLength", "Độ dài dây")
    }
    
    target_field, field_name_vn = fallback_mapping.get(device_type, ("ram", "RAM"))
    
    try:
        db = mongodb.connect()
        if db is None:
            return "Không thể kết nối MongoDB."
        
        collection = mongodb.get_collection("baseProduct")
        if collection is None:
            return "Không tìm thấy collection baseProduct."
        
        # Simple aggregation without unit validation
        base_filter = {}
        if device_type in device_type_to_class:
            base_filter["_class"] = device_type_to_class[device_type]
        
        pipeline = [
            {"$match": base_filter},
            {
                "$addFields": {
                    "numeric_value": {
                        "$convert": {
                            "input": {
                                "$arrayElemAt": [
                                    {
                                        "$map": {
                                            "input": {"$regexFindAll": {"input": f"${target_field}", "regex": r"(\d+(?:\.\d+)?)"}},
                                            "as": "match",
                                            "in": "$match.match"
                                        }
                                    },
                                    0
                                ]
                            },
                            "to": "double",
                            "onError": 0
                        }
                    }
                }
            },
            {"$match": {"numeric_value": {"$gt": 0}}},
            {"$sort": {"numeric_value": -1}},
            {"$limit": top_k * 2},
            {"$project": {"_id": 1, "productName": 1, "brand": 1, target_field: 1, "numeric_value": 1}}
        ]
        
        results = list(collection.aggregate(pipeline))
        
        if not results:
            return f"Không tìm thấy {device_type} nào có {field_name_vn} hợp lệ."
        
        # Convert to group_ids
        max_group_ids = []
        for result in results:
            if len(max_group_ids) >= top_k:
                break
                
            product_id = str(result['_id'])
            mysql_result = find_group_id_by_product_id(product_id)
            
            if mysql_result.get("status") == "success":
                group_id = mysql_result.get("group_id")
                if group_id and group_id not in max_group_ids:
                    max_group_ids.append(group_id)
        
        if not max_group_ids:
            return f"Không tìm thấy mapping cho {device_type}."
        
        current_group_ids.clear()
        current_group_ids.extend(max_group_ids)
        
        return f"Tìm thấy {len(max_group_ids)} {device_type} có {field_name_vn} cao nhất (fallback mode)."
        
    except Exception as e:
        return f"Lỗi fallback: {str(e)}"
    finally:
        mongodb.disconnect()

def detailed_specs_search_hybrid(query: str, device_type: str, top_k: int = 5) -> str:
    """
    Hàm tìm kiếm cấu hình chi tiết và thông số kỹ thuật kết hợp MongoDB và Elasticsearch.
    
    Workflow:
    1. MongoDB: Tìm kiếm structured data (RAM, CPU, storage, specifications)
    2. Elasticsearch: Tìm kiếm text descriptions và detailed features
    3. Kết hợp và rank kết quả từ cả hai nguồn
    4. Trả về thông tin chi tiết về cấu hình và thông số kỹ thuật
    
    Args:
        query (str): Yêu cầu người dùng về cấu hình/thông số kỹ thuật 
                    (ví dụ: "32GB RAM RTX 4070 gaming hiệu năng cao")
        device_type (str): Loại thiết bị ("laptop", "phone", "wireless_earphone", "wired_earphone", "headphone", "backup_charger")
        top_k (int): Số lượng sản phẩm muốn hiển thị (default: 5)
        
    Returns:
        str: Kết quả chi tiết với cấu hình và thông số kỹ thuật từ MongoDB + Elasticsearch
        
    Examples:
        >>> detailed_specs_search_hybrid("32GB RAM i7 RTX 4070", "laptop", 5)
        >>> detailed_specs_search_hybrid("camera 48MP pin 4000mAh", "phone", 3)
        >>> detailed_specs_search_hybrid("pin 30h Bluetooth 5.3", "wireless_earphone", 4)
    """
    current_group_ids.clear()
    filter_params.clear()
    
    try:
        # **BƯỚC 1: Validate device_type**
        valid_device_types = ["laptop", "phone", "wireless_earphone", "wired_earphone", "headphone", "backup_charger"]
        if device_type not in valid_device_types:
            return f"Loại thiết bị không hợp lệ: '{device_type}'. Các loại hỗ trợ: {', '.join(valid_device_types)}"
        
        print(f"Hybrid search for {device_type}: '{query}'")
        
        # **BƯỚC 1.5: Detect "lớn nhất/cao nhất" queries**
        superlative_keywords = [
            "lớn nhất", "cao nhất", "tối đa", "max", "maximum", "highest", "biggest", "largest",
            "mạnh nhất", "nhanh nhất", "tốt nhất", "best", "fastest", "strongest",
            "pin cao nhất", "ram lớn nhất", "dung lượng lớn nhất", "camera cao nhất"
        ]
        
        is_superlative_query = any(keyword in query.lower() for keyword in superlative_keywords)
        
        if is_superlative_query:
            print(f"Detected superlative query: '{query}'")
            # Handle superlative queries với MongoDB aggregation pipeline
            superlative_result = handle_superlative_query(query, device_type, top_k)
            if superlative_result:
                return superlative_result
        
        # **BƯỚC 2: MongoDB Search cho structured requirements**
        mongodb_product_ids = []
        mongodb_search_info = {}
        
        print(f"Step 1: MongoDB search for structured requirements...")
        mongo_search_result = mongodb_search_specific_requirements_get_product_ids(
            query=query,
            device_type=device_type,
            top_k=top_k * 3  # Lấy nhiều hơn để có nhiều lựa chọn
        )
        
        if mongo_search_result.get("success") and mongo_search_result.get("product_ids"):
            mongodb_product_ids = mongo_search_result["product_ids"]
            mongodb_search_info = mongo_search_result["search_info"]
            print(f"MongoDB found {len(mongodb_product_ids)} product_ids")
        else:
            print("MongoDB search returned no results")
        
        # **BƯỚC 3: Convert MongoDB product_ids to group_ids**
        mongodb_group_ids = []
        if mongodb_product_ids:
            print(f"Step 2: Converting {len(mongodb_product_ids)} product_ids to group_ids...")
            for product_id in mongodb_product_ids:
                mysql_result = find_group_id_by_product_id(str(product_id))
                if mysql_result.get("status") == "success":
                    group_id = mysql_result.get("group_id")
                    if group_id and group_id not in mongodb_group_ids:
                        mongodb_group_ids.append(group_id)
            print(f"Converted to {len(mongodb_group_ids)} group_ids")
        
        # **BƯỚC 4: Elasticsearch Search cho text descriptions**
        elasticsearch_group_ids = []
        elasticsearch_scores = {}
        
        print(f"Step 3: Elasticsearch search for text descriptions...")
        try:
            # Nếu có MongoDB group_ids, có thể filter hoặc không filter tùy strategy
            es_filter_ids = mongodb_group_ids
            # Không filter để có thêm kết quả từ Elasticsearch
            
            es_results = search_elasticsearch(
                query=query,
                ids=es_filter_ids,
                size=top_k * 2
            )
            
            if es_results:
                for hit in es_results:
                    group_id = hit.get('group_id')
                    score = hit.get('_score', 0)
                    if group_id:
                        group_id = int(group_id)
                        if group_id not in elasticsearch_group_ids:
                            elasticsearch_group_ids.append(group_id)
                            elasticsearch_scores[group_id] = score
                print(f"Elasticsearch found {len(elasticsearch_group_ids)} group_ids")
            else:
                print("Elasticsearch returned no results")
        except Exception as es_error:
            print(f"Elasticsearch search failed: {str(es_error)}")
        
        # **BƯỚC 5: Kết hợp kết quả với weighted scoring**
        print("Step 4: Combining MongoDB and Elasticsearch results...")
        
        # Tạo scoring map kết hợp
        combined_scores = {}
        
        # MongoDB scores (weight 1.3 - cao hơn vì structured data chính xác hơn)
        for i, group_id in enumerate(mongodb_group_ids):
            mongodb_score = (len(mongodb_group_ids) - i) * 1.3
            combined_scores[group_id] = combined_scores.get(group_id, 0) + mongodb_score
        
        # Elasticsearch scores (weight 1.0)
        for i, group_id in enumerate(elasticsearch_group_ids):
            es_score = elasticsearch_scores.get(group_id, len(elasticsearch_group_ids) - i) * 1.0
            combined_scores[group_id] = combined_scores.get(group_id, 0) + es_score
        
        # Sort by combined score
        sorted_groups = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
        final_group_ids = [group_id for group_id, score in sorted_groups[:top_k]]
        
        if not final_group_ids:
            return f"Không tìm thấy {device_type} nào phù hợp với yêu cầu: '{query}'"
        
        search_method = f"Hybrid (MongoDB: {len(mongodb_group_ids)}, ES: {len(elasticsearch_group_ids)})"
        
        # **BƯỚC 6: Lấy thông tin chi tiết từ MySQL**
        print(f"Step 5: Getting detailed info for {len(final_group_ids)} group_ids...")
        
        conn = mysql.connect()
        cursor = conn.cursor()
        
        # Lấy thông tin chi tiết
        placeholders = ','.join(['%s'] * len(final_group_ids))
        detail_sql = f"""
            SELECT 
                gp.group_id, 
                gp.group_name, 
                gp.brand,
                gp.type,
                MIN(gpj.default_current_price) AS min_price,
                GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name) AS tags
            FROM group_product gp
            LEFT JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
            LEFT JOIN group_tags gt ON gp.group_id = gt.group_id
            LEFT JOIN tags t ON gt.tag_id = t.tag_id
            WHERE gp.group_id IN ({placeholders}) AND gp.type = %s
            GROUP BY gp.group_id, gp.group_name, gp.brand, gp.type
            ORDER BY FIELD(gp.group_id, {placeholders})
        """
        
        params = final_group_ids + [device_type] + final_group_ids
        cursor.execute(detail_sql, params)
        mysql_results = cursor.fetchall()
        
        # **BƯỚC 7: Build response**
        current_group_ids.extend(final_group_ids)
        
        # Update filter_params
        filter_params.update({
            "search": query,
            "type": device_type,
            "method": "hybrid_mongodb_elasticsearch"
        })
        
        device_name_map = {
            "laptop": "laptop",
            "phone": "điện thoại", 
            "wireless_earphone": "tai nghe không dây",
            "wired_earphone": "tai nghe có dây", 
            "headphone": "headphone",
            "backup_charger": "sạc dự phòng"
        }
        device_name = device_name_map.get(device_type, device_type)
        
        response = []
        response.append(f"**Tìm kiếm cấu hình chi tiết {device_name}**")
        response.append(f"Yêu cầu: '{query}'")
        response.append(f"Phương pháp: {search_method}")
        response.append(f"Kết quả: {len(final_group_ids)} sản phẩm")
        response.append("")
        
        # Hiển thị MongoDB search conditions nếu có
        if mongodb_search_info and mongodb_search_info.get("applied_conditions"):
            response.append("**Điều kiện kỹ thuật đã áp dụng:**")
            for condition in mongodb_search_info["applied_conditions"]:
                field = condition["field"]
                operator = condition["operator"]
                value = condition["value"]
                
                # Field translations
                field_translations = {
                    "ram": "RAM", "storage": "Bộ nhớ", 
                    "processorModel": "Processor", "processor": "Processor",
                    "graphicCard": "Card đồ họa", "batteryCapacity": "Dung lượng pin",
                    "rearCameraResolution": "Camera sau", "frontCameraResolution": "Camera trước",
                    "batteryLife": "Thời lượng pin", "screenSize": "Màn hình",
                    "refreshRate": "Tần số quét", "brand": "Thương hiệu",
                    "productName": "Tên sản phẩm", "audioTechnology": "Công nghệ âm thanh",
                    "connectionTechnology": "Công nghệ kết nối", "chargingCaseBatteryLife": "Pin hộp sạc"
                }
                
                field_vn = field_translations.get(field, field)
                
                if operator in ["gte", "gt"]:
                    response.append(f"   ✓ {field_vn} ≥ {value}")
                elif operator in ["lte", "lt"]:
                    response.append(f"   ✓ {field_vn} ≤ {value}")
                elif operator == "eq":
                    response.append(f"   ✓ {field_vn} = {value}")
                elif operator == "regex":
                    response.append(f"   ✓ {field_vn} chứa '{value}'")
                elif operator == "elemMatch":
                    response.append(f"   ✓ {field_vn} có '{value}'")
                else:
                    response.append(f"   ✓ {field_vn}: {value}")
            response.append("")
        
        # Hiển thị kết quả
        response.append("**Danh sách sản phẩm phù hợp:**")
        response.append("")
        
        for i, result in enumerate(mysql_results, 1):
            group_id, group_name, brand, product_type, min_price, tags = result
            
            # Lấy combined score để hiển thị
            combined_score = combined_scores.get(group_id, 0)
            
            product_info = f"**{i}. {group_name}** - {brand}"
            product_info += f"\n  Group ID: {group_id}"
            product_info += f"\n  Giá từ: {int(min_price):,} đồng" if min_price else "\n   💰 Giá: Đang cập nhật"
            product_info += f"\n  Score: {combined_score:.1f}"
            
            # MongoDB vs Elasticsearch indicator
            in_mongo = group_id in mongodb_group_ids
            in_es = group_id in elasticsearch_group_ids
            source_indicator = ""
            if in_mongo and in_es:
                source_indicator = " (MongoDB + ES)"
            elif in_mongo:
                source_indicator = " (MongoDB)"
            elif in_es:
                source_indicator = " (Elasticsearch)"
            product_info += source_indicator
            
            response.append(product_info)
            response.append("")
        
        cursor.close()
        conn.close()
        return "\n".join(response)
        
    except Exception as e:
        print(f"Error in detailed_specs_search_hybrid: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Lỗi tìm kiếm {device_type}: {str(e)}"



>>>>>>> server
