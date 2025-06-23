from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
from flask_cors import CORS  # Import CORS
import json
import re

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
# Kết nối tới Elasticsearch (cấu hình mặc định localhost:9200)
es = Elasticsearch(["http://elasticsearch:9200"])

# Hàm loại bỏ "(Xem chi tiết tại đây)" khỏi chuỗi
def remove_detail_link(text):
    if isinstance(text, str):
        return re.sub(r'\s*\(Xem chi tiết tại đây\)', '', text).strip()
    return text

# Hàm xử lý giá trị None hoặc rỗng
def handle_empty_value(value):
    if value is None or value == "":
        return "Không có"
    return value

# Hàm gộp cấu hình từ các productRequest
def merge_product_configs(product_data, device_type):
    # Danh sách các trường cấu hình theo loại thiết bị
    phone_fields = [
        "Hệ điều hành", "Vi xử lý", "Tốc độ chip", "Chip đồ họa", "RAM", "Dung lượng", "Dung lượng khả dụng",
        "Danh bạ", "Độ phân giải camera sau", "Quay phim camera sau", "Đèn flash", "Tính năng camera sau",
        "Độ phân giải camera trước", "Tính năng camera trước", "Công nghệ màn hình", "Độ phân giải màn hình",
        "Màn hình rộng", "Độ sáng tối đa", "Mặt kính cảm ứng", "Dung lượng pin", "Loại pin",
        "Hỗ trợ sạc tối đa", "Công nghệ pin", "Bảo mật nâng cao", "Tính năng đặc biệt", "Kháng nước, bụi",
        "Ghi âm", "Xem phim", "Nghe nhạc", "Mạng di động", "SIM", "WiFi", "GPS", "Bluetooth",
        "Cổng sạc", "Jack tai nghe", "Kết nối khác", "Kiểu thiết kế", "Chất liệu", "Kích thước, khối lượng"
    ]
    
    laptop_fields = [
        "Công nghệ CPU", "Số nhân", "Số luồng", "Tốc độ CPU", "Tốc độ tối đa", "RAM", "Loại RAM",
        "Tốc độ Bus RAM", "Hỗ trợ RAM tối đa", "Ổ cứng", "Kích thước màn hình", "Độ phân giải",
        "Tần số quét", "Độ phủ màu", "Công nghệ màn hình", "Card màn hình", "Công nghệ âm thanh",
        "Cổng giao tiếp", "Kết nối không dây", "Webcam", "Tính năng khác", "Đèn bàn phím",
        "Kích thước", "Chất liệu", "Pin", "Hệ điều hành"
    ]
    
    backup_charger_fields = [
        "Dung lượng pin", "Hiệu suất sạc", "Lõi pin", "Công nghệ/ Tiện ích", "Thời gian sạc đầy pin",
        "Nguồn ra", "Nguồn vào", "Kích thước", "Khối lượng", "Thương hiệu của", "Sản xuất tại"
    ]
    
    cable_charger_hub_fields = [
        "Model", "Chức năng", "Đầu vào", "Đầu ra", "Độ dài dây", "Công suất tối đa",
        "Sản xuất tại", "Thương hiệu của", "Công nghệ/Tiện ích", "Dòng sạc tối đa", "Jack kết nối"
    ]

    headphone_fields = [
        "Thời lượng pin tai nghe", "Cổng sạc","Công nghệ âm thanh", "Tương thích","Ứng dụng kết nối", "Jack cắm", "Độ dài dây", "Tiện ích",
        "Kết nối cùng lúc", "Công nghệ kết nối", "Điều khiển", "Phím điều khiển", "Kích thước",
        "Khối lượng", "Thương hiệu của", "Sản xuất tại"
    ]
    
    wired_earphone_fields = [
        "Tương thích", "Jack cắm", "Độ dài dây", "Tiện ích", "Kết nối cùng lúc", "Điều khiển",
        "Phím điều khiển", "Khối lượng", "Thương hiệu của", "Sản xuất tại"
    ]
    
    wireless_earphone_fields = [
        "Thời lượng pin tai nghe", "Thời lượng pin hộp sạc", "Cổng sạc", "Công nghệ âm thanh",
        "Tương thích", "Ứng dụng kết nối", "Tiện ích", "Kết nối cùng lúc", "Công nghệ kết nối",
        "Điều khiển", "Phím điều khiển", "Kích thước", "Khối lượng", "Thương hiệu của", "Sản xuất tại"
    ]
    # Chọn danh sách trường dựa trên type
    config_fields = {
        "phone": phone_fields,
        "laptop": laptop_fields,
        "backup_charger": backup_charger_fields,
        "cable_charger_hub": cable_charger_hub_fields,
        "headphone": headphone_fields,
        "wired_earphone": wired_earphone_fields,
        "wireless_earphone": wireless_earphone_fields
    }.get(device_type, [])
    
    # Ánh xạ tên trường tiếng Anh sang tiếng Việt
    field_mapping = {
        "phone": {
            "os": "Hệ điều hành", "processor": "Vi xử lý", "cpuSpeed": "Tốc độ chip", "gpu": "Chip đồ họa",
            "ram": "RAM", "storage": "Dung lượng", "availableStorage": "Dung lượng khả dụng",
            "contactLimit": "Danh bạ", "rearCameraResolution": "Độ phân giải camera sau",
            "rearVideoRecording": "Quay phim camera sau", "rearFlash": "Đèn flash",
            "rearCameraFeatures": "Tính năng camera sau", "frontCameraResolution": "Độ phân giải camera trước",
            "frontCameraFeatures": "Tính năng camera trước", "displayTechnology": "Công nghệ màn hình",
            "displayResolution": "Độ phân giải màn hình", "screenSize": "Màn hình rộng",
            "maxBrightness": "Độ sáng tối đa", "screenProtection": "Mặt kính cảm ứng",
            "batteryCapacity": "Dung lượng pin", "batteryType": "Loại pin",
            "maxChargingPower": "Hỗ trợ sạc tối đa", "batteryFeatures": "Công nghệ pin",
            "securityFeatures": "Bảo mật nâng cao", "specialFeatures": "Tính năng đặc biệt",
            "waterResistance": "Kháng nước, bụi", "recording": "Ghi âm", "video": "Xem phim",
            "audio": "Nghe nhạc", "mobileNetwork": "Mạng di động", "simType": "SIM", "wifi": "WiFi",
            "gps": "GPS", "bluetooth": "Bluetooth", "chargingPort": "Cổng sạc",
            "headphoneJack": "Jack tai nghe", "otherConnectivity": "Kết nối khác",
            "designType": "Kiểu thiết kế", "materials": "Chất liệu", "sizeWeight": "Kích thước, khối lượng"
        },
        "laptop": {
            "processorModel": "Công nghệ CPU", "coreCount": "Số nhân", "threadCount": "Số luồng",
            "cpuSpeed": "Tốc độ CPU", "maxCpuSpeed": "Tốc độ tối đa", "ram": "RAM", "ramType": "Loại RAM",
            "ramBusSpeed": "Tốc độ Bus RAM", "maxRam": "Hỗ trợ RAM tối đa", "storage": "Ổ cứng",
            "screenSize": "Kích thước màn hình", "resolution": "Độ phân giải", "refreshRate": "Tần số quét",
            "colorGamut": "Độ phủ màu", "displayTechnology": "Công nghệ màn hình",
            "graphicCard": "Card màn hình", "audioTechnology": "Công nghệ âm thanh", "ports": "Cổng giao tiếp",
            "wirelessConnectivity": "Kết nối không dây", "webcam": "Webcam", "otherFeatures": "Tính năng khác",
            "keyboardBacklight": "Đèn bàn phím", "size": "Kích thước", "material": "Chất liệu",
            "battery": "Pin", "os": "Hệ điều hành"
        },
        "backup_charger": {
            "batteryCapacity": "Dung lượng pin",
            "chargingEfficiency": "Hiệu suất sạc",
            "batteryCellType": "Lõi pin",
            "technologyFeatures": "Công nghệ/ Tiện ích",
            "chargingTime": "Thời gian sạc đầy pin",
            "output": "Nguồn ra",
            "input": "Nguồn vào",
            "size": "Kích thước",
            "weight": "Khối lượng",
            "brandOrigin": "Thương hiệu của",
            "manufactured": "Sản xuất tại"
        },
        "cable_charger_hub": {
            "model": "Model",
            "features": "Chức năng",
            "input": "Đầu vào",
            "output": "Đầu ra",
            "length": "Độ dài dây",
            "maximumPower": "Công suất tối đa",
            "manufactured": "Sản xuất tại",
            "brandOrigin": "Thương hiệu của",
            "technologyFeatures": "Công nghệ/Tiện ích",
            "maximumCharging": "Dòng sạc tối đa",
            "connectionJack": "Jack kết nối"
        },
        "headphone": {
            "batteryLife": "Thời lượng pin tai nghe",
            "chargingPort": "Cổng sạc",
            "audioTechnology": "Công nghệ âm thanh",
            "compatibility": "Tương thích",
            "connectionApp": "Ứng dụng kết nối",
            "audioJack": "Jack cắm",
            "cableLength": "Độ dài dây",
            "features": "Tiện ích",
            "simultaneousConnections": "Kết nối cùng lúc",
            "connectionTechnology": "Công nghệ kết nối",
            "controlType": "Điều khiển",
            "controlButtons": "Phím điều khiển",
            "size": "Kích thước",
            "weight": "Khối lượng",
            "brandOrigin": "Thương hiệu của",
            "manufactured": "Sản xuất tại",
            "brand_info": "Hãng",
        },
        "wired_earphone": {
            "compatibility": "Tương thích",
            "audioJack": "Jack cắm",
            "cableLength": "Độ dài dây",
            "features": "Tiện ích",
            "simultaneousConnections": "Kết nối cùng lúc",
            "controlType": "Điều khiển",
            "controlButtons": "Phím điều khiển",
            "weight": "Khối lượng",
            "brandOrigin": "Thương hiệu của",
            "manufactured": "Sản xuất tại"
        },
        "wireless_earphone": {
            "batteryLife": "Thời lượng pin tai nghe",
            "chargingCaseBatteryLife": "Thời lượng pin hộp sạc",
            "chargingPort": "Cổng sạc",
            "audioTechnology": "Công nghệ âm thanh",
            "compatibility": "Tương thích",
            "connectionApp": "Ứng dụng kết nối",
            "features": "Tiện ích",
            "simultaneousConnections": "Kết nối cùng lúc",
            "connectionTechnology": "Công nghệ kết nối",
            "controlType": "Điều khiển",
            "controlButtons": "Phím điều khiển",
            "size": "Kích thước",
            "weight": "Khối lượng",
            "brandOrigin": "Thương hiệu của",
            "manufactured": "Sản xuất tại"
        }
    }
    
    # Tạo dictionary để lưu giá trị gộp
    merged_config = {}
    
    # Lấy tất cả các biến thể từ product_data
    variants = [item["productRequest"]["variant"] for item in product_data]
    
    # Duyệt qua từng trường để kiểm tra sự khác biệt
    for field in config_fields:
        values = {}
        for product in product_data:
            variant = product["productRequest"]["variant"] or "Default"
            config = product["productRequest"]
            eng_field = next((k for k, v in field_mapping.get(device_type, {}).items() if v == field), None)
            
            if eng_field:
                value = config.get(eng_field, None)
                if isinstance(value, list):
                    value = [remove_detail_link(handle_empty_value(v)) for v in value]
                else:
                    value = remove_detail_link(handle_empty_value(value))
                values[variant] = value
        
        if not values:  # Bỏ qua nếu không có dữ liệu
            continue
            
        # ===== PHẦN SỬA CHÍNH =====
        # Kiểm tra xem giá trị có giống nhau giữa các phiên bản không
        def normalize_value_for_comparison(val):
            """Chuẩn hóa giá trị để so sánh"""
            if isinstance(val, list):
                # Sắp xếp list và loại bỏ duplicates
                normalized = list(set(val))
                normalized.sort()
                return tuple(normalized)  # Convert to tuple để có thể hash
            elif isinstance(val, str):
                return val.strip().lower()
            else:
                return str(val) if val is not None else ""
        
        # Chuẩn hóa tất cả giá trị để so sánh
        normalized_values = {k: normalize_value_for_comparison(v) for k, v in values.items()}
        unique_normalized_values = set(normalized_values.values())
        
        if len(unique_normalized_values) <= 1:
            # Tất cả giá trị giống nhau -> gộp thành một giá trị
            first_value = list(values.values())[0] if values else None
            merged_config[field] = first_value
        else:
            # Có sự khác biệt -> giữ nguyên format dict
            merged_config[field] = values
    
    # Gộp thông tin giá và màu từ inventoryRequests
    price_info = []
    for product in product_data:
        variant = product["productRequest"]["variant"] or "Default"
        inventory = product.get("inventoryRequests", [])
        color_price_pairs = [f"{handle_empty_value(item['color'])}: {item['currentPrice']}" for item in inventory]
        price_info.append(f"{variant} - {', '.join(color_price_pairs)}")
    
    return merged_config, price_info

# Hàm tạo document từ dữ liệu JSON
def create_document(data):
    product_data = data.get('products_new_data', [])
    group_data = data.get('group_data', {})
    device_type = group_data.get('type', 'phone')  
    
    # Gộp cấu hình từ các productRequest
    merged_config, price_info = merge_product_configs(product_data, device_type)
    
    # Bắt đầu tạo document
    document = ''
    
    # Lấy thông tin từ sản phẩm đầu tiên cho promotions, brand, release
    first_product = product_data[0]["productRequest"] if product_data else {}
    promotions = [remove_detail_link(p) for p in first_product.get('promotions', [])]
    
    # Tạo tiêu đề document với group_name
    document += f"""\
Tên dòng sản phẩm: {group_data.get('group_name', '')}
Chương trình khuyến mãi: {', '.join(promotions)}
Hãng: {first_product.get('brand', '')}
Thời điểm ra mắt: {first_product.get('release', '')}
Giá: {'; '.join(price_info)} (Việt Nam đồng)
"""
    
    # Thêm thông tin cấu hình gộp
    document += "Thông tin cấu hình:\n"
    
    for field, value in merged_config.items():
        if isinstance(value, dict):
            # Kiểm tra xem tất cả giá trị trong dict có giống nhau không
            dict_values = list(value.values())
            if len(set(str(v) for v in dict_values)) == 1:
                # Tất cả giá trị giống nhau -> chỉ hiển thị một lần
                single_value = dict_values[0]
                if isinstance(single_value, list):
                    document += f"{field}: {', '.join(single_value)}\n"
                else:
                    document += f"{field}: {single_value}\n"
            else:
                # Có sự khác biệt -> hiển thị theo variant
                formatted_value = ', '.join(
                    [f"{k}: {v}" if not isinstance(v, list) else f"{k}: {', '.join(v)}" for k, v in value.items()]
                )
                document += f"{field}: {formatted_value}\n"
        else:
            if isinstance(value, list):
                document += f"{field}: {', '.join(value)}\n"
            else:
                document += f"{field}: {value}\n"
    
    return document, group_data.get('group_id', None), group_data.get('group_name', None), group_data.get('type', None)

# API endpoint để thêm document vào Elasticsearch
@app.route('/add-to-elasticsearch', methods=['POST'])
def add_to_elasticsearch():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        document, group_id, group_name, product_type = create_document(data)
        
        es_doc = {
            "document": document,
            "group_id": group_id,
            "name": group_name,
            "type": product_type
        }
        
        response = es.index(index="products_new", body=es_doc)
        
        return jsonify({
            "message": "Document added to Elasticsearch successfully",
            "id": response["_id"],
            "document": document
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint để xóa document khỏi Elasticsearch
@app.route('/delete-from-elasticsearch/<doc_id>', methods=['DELETE'])
def delete_from_elasticsearch(doc_id):
    try:
        # Kiểm tra document có tồn tại không
        if not es.exists(index="products_new", id=doc_id):
            return jsonify({"error": "Document not found"}), 404
        
        # Xóa document
        response = es.delete(index="products_new", id=doc_id)
        
        return jsonify({
            "message": "Document deleted successfully",
            "id": doc_id,
            "result": response["result"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint để xóa document theo group_id
@app.route('/delete-by-group-id/<group_id>', methods=['DELETE'])
def delete_by_group_id(group_id):
    try:
        # Tìm kiếm documents có group_id tương ứng
        search_query = {
            "query": {
                "term": {
                    "group_id": group_id
                }
            }
        }
        
        # Thực hiện delete by query
        response = es.delete_by_query(index="products_new", body=search_query)
        
        if response["deleted"] == 0:
            return jsonify({"error": "No documents found with the given group_id"}), 404
        
        return jsonify({
            "message": f"Deleted {response['deleted']} document(s) successfully",
            "group_id": group_id,
            "deleted_count": response["deleted"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint để cập nhật document trong Elasticsearch
@app.route('/update-elasticsearch/<doc_id>', methods=['PUT'])
def update_elasticsearch(doc_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Kiểm tra document có tồn tại không
        if not es.exists(index="products_new", id=doc_id):
            return jsonify({"error": "Document not found"}), 404
        
        # Tạo document mới từ dữ liệu
        document, group_id, group_name, product_type = create_document(data)
        
        es_doc = {
            "document": document,
            "group_id": group_id,
            "name": group_name,
            "type": product_type
        }
        
        # Cập nhật document
        response = es.update(index="products_new", id=doc_id, body={"doc": es_doc})
        
        return jsonify({
            "message": "Document updated successfully",
            "id": doc_id,
            "document": document,
            "result": response["result"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint để cập nhật document theo group_id
@app.route('/update-by-group-id/<group_id>', methods=['PUT'])
def update_by_group_id(group_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Tìm document có group_id tương ứng
        search_query = {
            "query": {
                "term": {
                    "group_id": group_id
                }
            }
        }
        
        search_response = es.search(index="products_new", body=search_query)
        
        if search_response["hits"]["total"]["value"] == 0:
            return jsonify({"error": "No documents found with the given group_id"}), 404
        
        # Tạo document mới từ dữ liệu
        document, new_group_id, group_name, product_type = create_document(data)
        
        es_doc = {
            "document": document,
            "group_id": new_group_id,
            "name": group_name,
            "type": product_type
        }
        
        # Cập nhật tất cả documents có group_id này
        update_query = {
            "script": {
                "source": """
                    ctx._source.document = params.document;
                    ctx._source.group_id = params.group_id;
                    ctx._source.name = params.name;
                    ctx._source.type = params.type;
                """,
                "params": es_doc
            },
            "query": {
                "term": {
                    "group_id": group_id
                }
            }
        }
        
        response = es.update_by_query(index="products_new", body=update_query)
        
        return jsonify({
            "message": f"Updated {response['updated']} document(s) successfully",
            "group_id": group_id,
            "updated_count": response["updated"],
            "document": document
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint để lấy thông tin document theo ID
@app.route('/get-document/<doc_id>', methods=['GET'])
def get_document(doc_id):
    try:
        if not es.exists(index="products_new", id=doc_id):
            return jsonify({"error": "Document not found"}), 404
        
        response = es.get(index="products_new", id=doc_id)
        
        return jsonify({
            "id": doc_id,
            "document": response["_source"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint để tìm kiếm documents
@app.route('/search-documents', methods=['GET'])
def search_documents():
    try:
        query = request.args.get('q', '')
        size = int(request.args.get('size', 10))
        from_param = int(request.args.get('from', 0))
        
        if not query:
            # Trả về tất cả documents nếu không có query
            search_body = {
                "query": {"match_all": {}},
                "size": size,
                "from": from_param
            }
        else:
            # Tìm kiếm trong document content
            search_body = {
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["document", "name", "type"]
                    }
                },
                "size": size,
                "from": from_param
            }
        
        response = es.search(index="products_new", body=search_body)
        
        results = []
        for hit in response["hits"]["hits"]:
            results.append({
                "id": hit["_id"],
                "score": hit["_score"],
                "source": hit["_source"]
            })
        
        return jsonify({
            "total": response["hits"]["total"]["value"],
            "results": results
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)