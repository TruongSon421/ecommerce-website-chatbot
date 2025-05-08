from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
import json
import re

app = Flask(__name__)

# Kết nối tới Elasticsearch (cấu hình mặc định localhost:9200)
es = Elasticsearch(["http://localhost:9200"])

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
    
    # Chọn danh sách trường dựa trên type
    config_fields = phone_fields if device_type == "PHONE" else laptop_fields
    
    # Ánh xạ tên trường tiếng Anh sang tiếng Việt
    field_mapping = {
        "PHONE": {
            "os": "Hệ điều hành", "processor": "Vi xử lý", "cpuSpeed": "Tốc độ chip", "gpu": "Chip đồ họa",
            "ram": "RAM", "storage": "Dung lượng", "availableStorage": "Dung lượng khả dụng",
            "contactLimit": "Danh bạ", "rearCameraResolution": "Độ phân giải camera sau",
            "rearVideoRecording": "Quay phim camera sau", "rearFlash": "Đèn flash",
            "rearCameraFeatures": "Tính năng camera sau", "frontCameraResolution": "Độ phân giải camera trước",
            "frontCameraFeatures": "Tính năng camera trước", "displayTechnology": "Công nghệ màn hình",
            "displayResolution": "Độ phân giải màn hình", "screenSize": "Màn hình rộng",
            "maxBrightness": "Độ sáng tối đa", "screenProtection": "Mặt kính cảm ứng",
            "batteryCapactity": "Dung lượng pin", "batteryType": "Loại pin",
            "maxChargingPower": "Hỗ trợ sạc tối đa", "batteryFeatures": "Công nghệ pin",
            "securityFeatures": "Bảo mật nâng cao", "specialFeatures": "Tính năng đặc biệt",
            "waterResistance": "Kháng nước, bụi", "recording": "Ghi âm", "video": "Xem phim",
            "audio": "Nghe nhạc", "mobileNetwork": "Mạng di động", "simType": "SIM", "wifi": "WiFi",
            "gps": "GPS", "bluetooth": "Bluetooth", "chargingPort": "Cổng sạc",
            "headphoneJack": "Jack tai nghe", "otherConnectivity": "Kết nối khác",
            "designType": "Kiểu thiết kế", "materials": "Chất liệu", "sizeWeight": "Kích thước, khối lượng"
        },
        "LAPTOP": {
            "processorModel": "Công nghệ CPU", "coreCount": "Số nhân", "threadCount": "Số luồng",
            "cpuSpeed": "Tốc độ CPU", "maxCpuSpeed": "Tốc độ tối đa", "ram": "RAM", "ramType": "Loại RAM",
            "ramBusSpeed": "Tốc độ Bus RAM", "maxRam": "Hỗ trợ RAM tối đa", "storage": "Ổ cứng",
            "screenSize": "Kích thước màn hình", "resolution": "Độ phân giải", "refreshRate": "Tần số quét",
            "colorGamut": "Độ phủ màu", "displayTechnology": "Công nghệ màn hình",
            "graphicCard": "Card màn hình", "audioTechnology": "Công nghệ âm thanh", "ports": "Cổng giao tiếp",
            "wirelessConnectivity": "Kết nối không dây", "webcam": "Webcam", "otherFeatures": "Tính năng khác",
            "keyboardBacklight": "Đèn bàn phím", "size": "Kích thước", "material": "Chất liệu",
            "battery": "Pin", "os": "Hệ điều hành"
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
            variant = product["productRequest"]["variant"]
            config = product["productRequest"]
            eng_field = next(k for k, v in field_mapping[device_type].items() if v == field)
            value = config.get(eng_field, None)
            if isinstance(value, list):
                value = [remove_detail_link(handle_empty_value(v)) for v in value]
            else:
                value = remove_detail_link(handle_empty_value(value))
            values[variant] = value
        
        # Kiểm tra xem giá trị có giống nhau giữa các phiên bản không
        unique_values = set(tuple(v) if isinstance(v, list) else str(v) for v in values.values())
        if len(unique_values) == 1:
            merged_config[field] = list(values.values())[0]
        else:
            merged_config[field] = values
    
    # Gộp thông tin giá và màu từ inventoryRequests
    price_info = []
    for product in product_data:
        variant = product["productRequest"]["variant"]
        inventory = product.get("inventoryRequests", [])
        color_price_pairs = [f"{item['color']}: {item['currentPrice']}" for item in inventory]
        price_info.append(f"{variant} - {', '.join(color_price_pairs)}")
    
    return merged_config, price_info

# Hàm tạo document từ dữ liệu JSON
def create_document(data):
    product_data = data.get('products_data', [])
    group_data = data.get('group_data', {})
    device_type = group_data.get('type', None)  # Mặc định là PHONE nếu không có type
    
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
            "group_data": document,
            "group_id": group_id,
            "group_name": group_name,
            "type": product_type
        }
        
        response = es.index(index="products", body=es_doc)
        
        return jsonify({
            "message": "Document added to Elasticsearch successfully",
            "id": response["_id"],
            "document": document
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)