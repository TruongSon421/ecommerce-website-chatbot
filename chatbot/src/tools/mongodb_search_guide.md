# Hướng dẫn sử dụng công cụ tìm kiếm MongoDB

## Tổng quan

Đã thêm 6 hàm mới để tìm kiếm sản phẩm theo cấu hình chi tiết trong MongoDB:

1. **product_specs_search_tool**: Tìm kiếm tổng quát theo nhiều tiêu chí
2. **laptop_battery_search_tool**: Chuyên biệt tìm laptop theo pin
3. **advanced_product_filter_tool**: Lọc nâng cao với nhiều điều kiện kết hợp
4. **intelligent_product_search_tool**: Tìm kiếm thông minh tự động nhận biết trường
5. **find_max_from_field_tool**: Tìm giá trị cao nhất với regex extraction (theo pattern của bạn)
6. **smart_query_processor**: Bộ xử lý query thông minh toàn diện

## Cấu trúc dữ liệu MongoDB

Dữ liệu sản phẩm được lưu trong collection `merge_product_configs` với các trường chính:

### Trường chung cho tất cả sản phẩm:
- `_id`: ObjectId duy nhất
- `_class`: Loại sản phẩm (com.eazybytes.model.Phone, com.eazybytes.model.Laptop, etc.)
- `productName`: Tên sản phẩm
- `brand`: Thương hiệu
- `description`: Mô tả sản phẩm

### Trường cấu hình cho laptop:
- `processor`: Bộ xử lý (VD: "Apple M2 8 nhân", "Intel Core i7-12700H")
- `ram`: RAM (VD: "16 GB", "32 GB")
- `storage`: Bộ nhớ (VD: "512 GB SSD", "1 TB")
- `batteryCapacity`: Dung lượng pin (VD: "12 giờ", "18 giờ")
- `screenSize`: Kích thước màn hình (VD: "13.3\"", "15.6\"")
- `displayTechnology`: Công nghệ màn hình (VD: "IPS LCD", "OLED")
- `displayResolution`: Độ phân giải (VD: "1920 x 1080", "2560 x 1600")

### Trường cấu hình cho điện thoại:
- `processor`: Chip xử lý (VD: "Apple A18 6 nhân", "Snapdragon 8 Gen 3")
- `ram`: RAM (VD: "8 GB", "12 GB")
- `storage`: Bộ nhớ (VD: "128 GB", "256 GB")
- `batteryCapacity`: Pin (VD: "26 giờ", "20 giờ")
- `screenSize`: Kích thước màn hình (VD: "6.1\"", "6.7\"")
- `rearCameraResolution`: Camera sau (VD: "48 MP", "108 MP")
- `frontCameraResolution`: Camera trước (VD: "12 MP", "32 MP")

## 🎯 Hàm Mới - find_max_from_field_tool

### Mục đích:
Tìm sản phẩm có giá trị cao nhất từ một trường cụ thể sử dụng regex extraction theo đúng pattern bạn đưa ra.

### Cú pháp:
```python
find_max_from_field_tool(field_name, device_type="all", top_k=5)
```

### Tham số:
- `field_name`: Tên trường trong database ("batteryCapacity", "ram", "storage", "screenSize", "rearCameraResolution", "frontCameraResolution")
- `device_type`: "laptop", "phone", "tablet", "all"
- `top_k`: Số lượng sản phẩm hiển thị

### Ví dụ sử dụng:

```python
# Tìm 5 laptop có pin cao nhất
find_max_from_field_tool("batteryCapacity", "laptop", 5)

# Tìm 3 điện thoại có RAM lớn nhất
find_max_from_field_tool("ram", "phone", 3)

# Tìm 10 sản phẩm có camera sau tốt nhất
find_max_from_field_tool("rearCameraResolution", "all", 10)

# Tìm laptop có màn hình lớn nhất
find_max_from_field_tool("screenSize", "laptop", 5)
```

### Pipeline MongoDB:
```javascript
[
    {"$match": base_filter},
    {
        "$addFields": {
            "numericValue": {
                "$toDouble": {
                    "$arrayElemAt": [
                        {
                            "$regexFindAll": {
                                "input": "$batteryCapacity",  // field_name
                                "regex": r"\d+(\.\d+)?"
                            }
                        },
                        0
                    ]
                }
            }
        }
    },
    {"$match": {"numericValue": {"$exists": true, "$ne": null}}},
    {"$sort": {"numericValue": -1}},
    {"$limit": top_k}
]
```

## 🤖 smart_query_processor

### Mục đích:
Bộ xử lý query thông minh nhất - tự động phân tích câu hỏi tự nhiên và chọn phương pháp tìm kiếm phù hợp.

### Cú pháp:
```python
smart_query_processor(query, top_k=5)
```

### Ví dụ sử dụng:

```python
# Tự động nhận diện và tìm laptop có pin cao nhất
smart_query_processor("laptop pin cao nhất", 5)

# Tự động nhận diện và tìm điện thoại camera tốt nhất  
smart_query_processor("điện thoại camera tốt nhất", 3)

# Tự động nhận diện và tìm máy tính RAM lớn nhất
smart_query_processor("máy tính nào có RAM lớn nhất?", 5)

# Tự động nhận diện storage
smart_query_processor("laptop ổ cứng lớn nhất", 5)
```

### Tính năng thông minh:
- **Tự động phát hiện device type**: laptop, điện thoại, tablet
- **Tự động ánh xạ field**: pin → batteryCapacity, RAM → ram, etc.
- **Sử dụng regex extraction**: Giống như pattern bạn đưa ra
- **Làm sạch query**: Loại bỏ từ thừa như "nào có", "tìm", "cho tôi"

## 🔍 intelligent_product_search_tool

### Mục đích:
Tìm kiếm thông minh với regex extraction nâng cao.

### Cú pháp:
```python
intelligent_product_search_tool(query, device_type="all", top_k=5)
```

### Ví dụ sử dụng:

```python
# Tìm kiếm thông minh với device type cụ thể
intelligent_product_search_tool("pin cao nhất", "laptop", 5)
intelligent_product_search_tool("camera tốt nhất", "phone", 3)
intelligent_product_search_tool("RAM lớn nhất", "all", 10)
```

## 1. product_specs_search_tool

### Mục đích:
Tìm kiếm sản phẩm theo các tiêu chí cấu hình cụ thể.

### Cú pháp:
```python
product_specs_search_tool(device_type, spec_criteria, sort_by="desc", top_k=5)
```

### Tham số:
- `device_type`: "laptop", "phone", "tablet"
- `spec_criteria`: Tiêu chí tìm kiếm (VD: "pin cao nhất", "RAM lớn nhất", "chip Intel i7")
- `sort_by`: "desc" (giảm dần) hoặc "asc" (tăng dần)
- `top_k`: Số lượng sản phẩm hiển thị

### Ví dụ sử dụng:

```python
# Tìm laptop có pin cao nhất
product_specs_search_tool("laptop", "pin cao nhất", "desc", 5)

# Tìm điện thoại có RAM lớn nhất
product_specs_search_tool("phone", "RAM lớn nhất", "desc", 3)

# Tìm laptop có chip Intel i7
product_specs_search_tool("laptop", "chip Intel i7", "desc", 5)

# Tìm laptop có màn hình lớn nhất
product_specs_search_tool("laptop", "màn hình lớn nhất", "desc", 5)
```

### Các từ khóa hỗ trợ:
- **Pin**: "pin cao nhất", "pin tốt nhất", "pin lớn nhất"
- **RAM**: "RAM cao nhất", "RAM lớn nhất", "RAM tốt nhất"
- **Storage**: "storage", "ổ cứng", "bộ nhớ"
- **Processor**: "chip", "processor", "cpu"
- **Màn hình**: "màn hình", "screen", "display"

## 2. laptop_battery_search_tool

### Mục đích:
Chuyên biệt tìm kiếm laptop theo pin với xử lý chi tiết hơn.

### Cú pháp:
```python
laptop_battery_search_tool(query, top_k=5)
```

### Tham số:
- `query`: Yêu cầu tìm kiếm về pin
- `top_k`: Số lượng laptop hiển thị

### Ví dụ sử dụng:

```python
# Tìm laptop có pin cao nhất
laptop_battery_search_tool("laptop pin cao nhất", 5)

# Tìm laptop có pin trên 10 giờ
laptop_battery_search_tool("laptop pin trên 10 giờ", 3)

# Tìm laptop có pin từ 8 giờ trở lên
laptop_battery_search_tool("laptop pin từ 8 giờ", 5)
```

### Tính năng đặc biệt:
- Tự động phân tích ngưỡng pin từ query
- Hiển thị thông tin chi tiết về pin và cấu hình
- Sắp xếp theo thời lượng pin giảm dần

## 3. advanced_product_filter_tool

### Mục đích:
Lọc sản phẩm với nhiều tiêu chí kết hợp phức tạp.

### Cú pháp:
```python
advanced_product_filter_tool(device_type, filters, top_k=10)
```

### Tham số:
- `device_type`: "laptop", "phone", "tablet"
- `filters`: Dictionary chứa các điều kiện lọc
- `top_k`: Số lượng sản phẩm hiển thị

### Các filter hỗ trợ:
- `min_battery`: Pin tối thiểu (số giờ)
- `max_battery`: Pin tối đa (số giờ)
- `min_ram`: RAM tối thiểu (GB)
- `max_ram`: RAM tối đa (GB)
- `min_storage`: Storage tối thiểu (GB)
- `max_storage`: Storage tối đa (GB)
- `processor_contains`: Processor chứa từ khóa
- `brand_contains`: Brand chứa từ khóa
- `min_screen`: Màn hình tối thiểu (inch)
- `max_screen`: Màn hình tối đa (inch)

### Ví dụ sử dụng:

```python
# Tìm laptop: pin > 8 giờ, RAM >= 16GB, thương hiệu Apple
filters = {
    "min_battery": 8,
    "min_ram": 16,
    "brand_contains": "Apple"
}
advanced_product_filter_tool("laptop", filters, 5)

# Tìm điện thoại: RAM 8-12GB, pin > 20 giờ, chip Apple
filters = {
    "min_ram": 8,
    "max_ram": 12,
    "min_battery": 20,
    "processor_contains": "Apple"
}
advanced_product_filter_tool("phone", filters, 3)

# Tìm laptop gaming: RAM >= 16GB, màn hình 15-17 inch
filters = {
    "min_ram": 16,
    "min_screen": 15,
    "max_screen": 17,
    "processor_contains": "gaming"
}
advanced_product_filter_tool("laptop", filters, 5)
```

## Kết quả trả về

Tất cả các hàm đều trả về chuỗi văn bản có định dạng:

```
=== Top X sản phẩm có [field] cao nhất ===

1. Tên sản phẩm - Thương hiệu
   🔋 Pin: Thông tin pin (Giá trị: 12.0 giờ)
   🔧 Processor: Thông tin chip
   💾 RAM: Thông tin RAM
   💿 Storage: Thông tin storage
   🖥️ Màn hình: Thông tin màn hình
   🆔 Group ID: ObjectId

2. Sản phẩm tiếp theo...
```

## Lưu ý quan trọng

1. **group_id**: Tất cả kết quả tìm được sẽ được lưu vào `current_group_ids` để sử dụng cho các tool khác.

2. **Regex Extraction**: Sử dụng regex `\d+(\.\d+)?` để trích xuất số từ chuỗi text.

3. **Kết nối MongoDB**: Các hàm tự động kết nối và ngắt kết nối MongoDB.

4. **Xử lý lỗi**: Các hàm có xử lý lỗi và trả về thông báo lỗi rõ ràng.

5. **Tối ưu hiệu suất**: Sử dụng MongoDB aggregation pipeline để tối ưu hiệu suất tìm kiếm.

6. **Chuyển đổi dữ liệu**: Tự động chuyển đổi text thành số cho các phép so sánh (VD: "16 GB" → 16).

## 🚀 Hướng dẫn sử dụng nhanh

### Cho trường hợp "laptop pin cao nhất":

```python
# Cách 1: Sử dụng smart_query_processor (KHUYẾN NGHỊ)
result = smart_query_processor("laptop pin cao nhất", 5)

# Cách 2: Sử dụng find_max_from_field_tool trực tiếp
result = find_max_from_field_tool("batteryCapacity", "laptop", 5)

# Cách 3: Sử dụng intelligent_product_search_tool
result = intelligent_product_search_tool("pin cao nhất", "laptop", 5)
```

### Mapping field names:
- **pin** → `batteryCapacity`
- **RAM** → `ram`
- **storage/ổ cứng** → `storage`
- **màn hình** → `screenSize`
- **camera** → `rearCameraResolution`
- **camera trước** → `frontCameraResolution`

## Mở rộng

Có thể dễ dàng thêm các filter mới bằng cách:

1. Thêm mapping trong `field_keywords` của `smart_query_processor`
2. Thêm field mới trong `field_display_names` và `field_icons`
3. Tạo hàm chuyên biệt mới cho các trường hợp đặc biệt

## Cài đặt và Cấu hình

Đảm bảo các thông tin MongoDB trong file `.env`:

```
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USERNAME=admin
MONGODB_PASSWORD=password
MONGODB_DATABASE=products
```

Cài đặt dependencies:
```bash
pip install pymongo
``` 