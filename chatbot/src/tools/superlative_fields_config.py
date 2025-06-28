# superlative_fields_config.py

"""
Configuration cho các trường có thể tìm kiếm "lớn nhất/cao nhất" với đơn vị validate tương ứng.
Chỉ những giá trị có đơn vị phù hợp mới được tính trong aggregation.
"""

SUPERLATIVE_FIELDS_CONFIG = {
    # Common fields cho nhiều loại thiết bị
    "common": {
        "ram": {
            "name_vn": "RAM",
            "keywords": ["ram lớn nhất", "ram cao nhất", "ram max", "ram tối đa", "bộ nhớ đệm lớn nhất"],
            "required_units": ["GB"],  # Phải có GB hoặc MB
            "unit_regex": r"\b\d+\s*(GB|MB)\b",
            "sort_order": "desc"
        },
        "storage": {
            "name_vn": "Bộ nhớ",
            "keywords": ["dung lượng lớn nhất", "bộ nhớ lớn nhất", "storage lớn nhất", "ổ cứng lớn nhất"],
            "required_units": ["GB", "TB", "SSD", "HDD"],
            "unit_regex": r"\b\d+\s*(GB|TB)\b|SSD|HDD",
            "sort_order": "desc"
        },
        "batteryCapacity": {
            "name_vn": "Dung lượng pin",
            "keywords": ["pin lớn nhất", "pin cao nhất", "battery lớn nhất", "dung lượng pin cao nhất", "pin khủng nhất"],
            "required_units": ["mAh", "Wh"],
            "unit_regex": r"\b\d+\s*(mAh|Wh)\b",
            "sort_order": "desc"
        }
    },
    
    # Laptop specific fields
    "laptop": {
        "processorModel": {
            "name_vn": "Processor",
            "keywords": ["cpu mạnh nhất", "processor mạnh nhất", "vi xử lý mạnh nhất", "chip mạnh nhất"],
            "required_units": ["Intel", "AMD", "Core", "Ryzen", "GHz"],
            "unit_regex": r"(Intel|AMD|Core|Ryzen|i\d|GHz)",
            "sort_order": "desc"
        },
        "graphicCard": {
            "name_vn": "Card đồ họa",
            "keywords": ["gpu mạnh nhất", "card đồ họa mạnh nhất", "vga mạnh nhất", "đồ họa mạnh nhất"],
            "required_units": ["RTX", "GTX", "RX", "Arc", "GB"],
            "unit_regex": r"(RTX|GTX|RX|Arc|\d+\s*GB)",
            "sort_order": "desc"
        },
        "refreshRate": {
            "name_vn": "Tần số quét",
            "keywords": ["refresh rate cao nhất", "tần số quét cao nhất", "hz cao nhất", "màn hình mượt nhất"],
            "required_units": ["Hz"],
            "unit_regex": r"\b\d+\s*Hz\b",
            "sort_order": "desc"
        },
        "screenSize": {
            "name_vn": "Kích thước màn hình",
            "keywords": ["màn hình lớn nhất", "screen lớn nhất", "inch lớn nhất", "kích thước màn hình lớn nhất"],
            "required_units": ["inch", '"'],
            "unit_regex": r"\b\d+\.?\d*\s*(inch|\")\b",
            "sort_order": "desc"
        },
        "battery": {
            "name_vn": "Pin laptop",
            "keywords": ["pin laptop lớn nhất", "thời lượng pin lâu nhất", "pin lâu nhất"],
            "required_units": ["Wh", "hours", "giờ", "h"],
            "unit_regex": r"\b\d+\s*(Wh|hours|giờ|h)\b",
            "sort_order": "desc"
        },
        "coreCount": {
            "name_vn": "Số nhân CPU",
            "keywords": ["cpu nhiều nhân nhất", "nhân cpu nhiều nhất", "core nhiều nhất"],
            "required_units": ["core", "nhân"],
            "unit_regex": r"\b\d+\s*(core|nhân)\b",
            "sort_order": "desc"
        },
        "threadCount": {
            "name_vn": "Số luồng CPU",
            "keywords": ["thread nhiều nhất", "luồng nhiều nhất", "cpu nhiều luồng nhất"],
            "required_units": ["thread", "luồng"],
            "unit_regex": r"\b\d+\s*(thread|luồng)\b",
            "sort_order": "desc"
        }
    },
    
    # Phone specific fields
    "phone": {
        "rearCameraResolution": {
            "name_vn": "Camera sau",
            "keywords": ["camera sau cao nhất", "camera chính cao nhất", "camera sau tốt nhất", "megapixel cao nhất"],
            "required_units": ["MP", "megapixel"],
            "unit_regex": r"\b\d+\s*(MP|megapixel)\b",
            "sort_order": "desc"
        },
        "frontCameraResolution": {
            "name_vn": "Camera trước",
            "keywords": ["camera trước cao nhất", "camera selfie cao nhất", "camera trước tốt nhất"],
            "required_units": ["MP", "megapixel"],
            "unit_regex": r"\b\d+\s*(MP|megapixel)\b",
            "sort_order": "desc"
        },
        "maxBrightness": {
            "name_vn": "Độ sáng màn hình",
            "keywords": ["độ sáng cao nhất", "brightness cao nhất", "màn hình sáng nhất", "nits cao nhất"],
            "required_units": ["nits", "cd/m²"],
            "unit_regex": r"\b\d+\s*(nits|cd/m²)\b",
            "sort_order": "desc"
        },
        "maxChargingPower": {
            "name_vn": "Công suất sạc",
            "keywords": ["sạc nhanh nhất", "công suất sạc cao nhất", "watt sạc cao nhất", "sạc mạnh nhất"],
            "required_units": ["W", "watt"],
            "unit_regex": r"\b\d+\s*(W|watt)\b",
            "sort_order": "desc"
        },
        "screenSize": {
            "name_vn": "Kích thước màn hình",
            "keywords": ["màn hình lớn nhất", "screen lớn nhất", "inch lớn nhất"],
            "required_units": ["inch", '"'],
            "unit_regex": r"\b\d+\.?\d*\s*(inch|\")\b",
            "sort_order": "desc"
        },
        "processor": {
            "name_vn": "Processor",
            "keywords": ["chip mạnh nhất", "processor mạnh nhất", "cpu mạnh nhất", "snapdragon cao nhất"],
            "required_units": ["Snapdragon", "Dimensity", "Exynos", "A17", "A16", "A15", "GHz"],
            "unit_regex": r"(Snapdragon|Dimensity|Exynos|A1[5-7]|GHz|\d{3,4})",
            "sort_order": "desc"
        }
    },
    
    # Wireless Earphone specific fields
    "wireless_earphone": {
        "batteryLife": {
            "name_vn": "Thời lượng pin",
            "keywords": ["pin lâu nhất", "thời lượng pin cao nhất", "pin dài nhất", "nghe nhạc lâu nhất"],
            "required_units": ["giờ", "hours", "h"],
            "unit_regex": r"\b\d+\s*(giờ|hours|h)\b",
            "sort_order": "desc"
        },
        "chargingCaseBatteryLife": {
            "name_vn": "Pin hộp sạc",
            "keywords": ["pin hộp sạc lớn nhất", "thời lượng sạc cao nhất", "hộp sạc lâu nhất"],
            "required_units": ["giờ", "hours", "h"],
            "unit_regex": r"\b\d+\s*(giờ|hours|h)\b",
            "sort_order": "desc"
        }
    },
    
    # Headphone specific fields
    "headphone": {
        "batteryLife": {
            "name_vn": "Thời lượng pin",
            "keywords": ["pin lâu nhất", "thời lượng pin cao nhất", "pin dài nhất", "nghe nhạc lâu nhất"],
            "required_units": ["giờ", "hours", "h"],
            "unit_regex": r"\b\d+\s*(giờ|hours|h)\b",
            "sort_order": "desc"
        }
    },
    
    # Backup Charger specific fields
    "backup_charger": {
        "batteryCapacity": {
            "name_vn": "Dung lượng pin",
            "keywords": ["dung lượng lớn nhất", "pin lớn nhất", "mah cao nhất", "dung lượng cao nhất"],
            "required_units": ["mAh", "Wh"],
            "unit_regex": r"\b\d+\s*(mAh|Wh)\b",
            "sort_order": "desc"
        },
        "output": {
            "name_vn": "Công suất đầu ra",
            "keywords": ["công suất cao nhất", "output cao nhất", "watt cao nhất", "sạc nhanh nhất"],
            "required_units": ["W", "watt", "A"],
            "unit_regex": r"\b\d+\s*(W|watt|A)\b",
            "sort_order": "desc"
        }
    },
    
    # Wired Earphone specific fields (có ít fields có thể superlative)
    "wired_earphone": {
        "cableLength": {
            "name_vn": "Độ dài dây",
            "keywords": ["dây dài nhất", "cable dài nhất", "độ dài dây lớn nhất"],
            "required_units": ["m", "cm", "meter"],
            "unit_regex": r"\b\d+\.?\d*\s*(m|cm|meter)\b",
            "sort_order": "desc"
        }
    }
}

def get_superlative_field_config(device_type: str, field_name: str) -> dict:
    """
    Lấy config cho một field cụ thể của device type.
    
    Args:
        device_type: Loại thiết bị
        field_name: Tên field
        
    Returns:
        dict: Config của field hoặc None nếu không tìm thấy
    """
    # Check common fields first
    if field_name in SUPERLATIVE_FIELDS_CONFIG.get("common", {}):
        return SUPERLATIVE_FIELDS_CONFIG["common"][field_name]
    
    # Check device-specific fields
    device_config = SUPERLATIVE_FIELDS_CONFIG.get(device_type, {})
    return device_config.get(field_name)

def find_superlative_field_by_keywords(device_type: str, query: str) -> tuple:
    """
    Tìm field phù hợp dựa trên keywords trong query.
    
    Args:
        device_type: Loại thiết bị
        query: Query của người dùng
        
    Returns:
        tuple: (field_name, field_config) hoặc (None, None) nếu không tìm thấy
    """
    query_lower = query.lower()
    
    # Check common fields
    for field_name, config in SUPERLATIVE_FIELDS_CONFIG.get("common", {}).items():
        if any(keyword in query_lower for keyword in config["keywords"]):
            return field_name, config
    
    # Check device-specific fields
    device_config = SUPERLATIVE_FIELDS_CONFIG.get(device_type, {})
    for field_name, config in device_config.items():
        if any(keyword in query_lower for keyword in config["keywords"]):
            return field_name, config
    
    return None, None

def get_default_superlative_field(device_type: str) -> tuple:
    """
    Lấy field mặc định cho superlative search khi không detect được field cụ thể.
    
    Args:
        device_type: Loại thiết bị
        
    Returns:
        tuple: (field_name, field_config)
    """
    default_fields = {
        "laptop": "ram",
        "phone": "ram", 
        "wireless_earphone": "batteryLife",
        "headphone": "batteryLife",
        "backup_charger": "batteryCapacity",
        "wired_earphone": "cableLength"
    }
    
    default_field = default_fields.get(device_type, "ram")
    
    # Get config from common first, then device-specific
    config = get_superlative_field_config(device_type, default_field)
    return default_field, config

def validate_field_value_has_unit(field_value: str, field_config: dict) -> bool:
    """
    Kiểm tra xem giá trị field có chứa đơn vị hợp lệ không.
    
    Args:
        field_value: Giá trị field từ MongoDB
        field_config: Config của field
        
    Returns:
        bool: True nếu có đơn vị hợp lệ, False nếu không
    """
    if not field_value or not field_config:
        return False
    
    import re
    unit_regex = field_config.get("unit_regex", "")
    if not unit_regex:
        return True  # Nếu không có regex thì accept
    
    try:
        return bool(re.search(unit_regex, str(field_value), re.IGNORECASE))
    except Exception:
        return False

def get_all_superlative_fields_for_device(device_type: str) -> dict:
    """
    Lấy tất cả fields có thể superlative cho một device type.
    
    Args:
        device_type: Loại thiết bị
        
    Returns:
        dict: Mapping field_name -> field_config
    """
    result = {}
    
    # Add common fields
    result.update(SUPERLATIVE_FIELDS_CONFIG.get("common", {}))
    
    # Add device-specific fields
    result.update(SUPERLATIVE_FIELDS_CONFIG.get(device_type, {}))
    
    return result

# Test function
def test_superlative_config():
    """Test function để kiểm tra config."""
    
    test_cases = [
        ("laptop", "laptop RAM lớn nhất", "ram"),
        ("phone", "điện thoại pin cao nhất", "batteryCapacity"),
        ("phone", "camera sau tốt nhất", "rearCameraResolution"),
        ("laptop", "card đồ họa mạnh nhất", "graphicCard"),
        ("wireless_earphone", "tai nghe pin lâu nhất", "batteryLife"),
        ("backup_charger", "sạc dự phòng dung lượng lớn nhất", "batteryCapacity")
    ]
    
    print("=== TESTING SUPERLATIVE CONFIG ===")
    for device_type, query, expected_field in test_cases:
        field_name, config = find_superlative_field_by_keywords(device_type, query)
        status = "✓" if field_name == expected_field else "✗"
        print(f"{status} {device_type}: '{query}' → {field_name} (expected: {expected_field})")
        if config:
            print(f"   Config: {config['name_vn']}, Units: {config['required_units']}")
    
    print("\n=== TESTING UNIT VALIDATION ===")
    test_values = [
        ("batteryCapacity", "4500 mAh", True),
        ("batteryCapacity", "4500", False),
        ("rearCameraResolution", "48 MP", True),
        ("rearCameraResolution", "48", False),
        ("refreshRate", "144 Hz", True),
        ("refreshRate", "144", False),
        ("screenSize", "15.6 inch", True),
        ("screenSize", "15.6", False)
    ]
    
    for field_name, value, expected in test_values:
        config = get_superlative_field_config("laptop", field_name) or get_superlative_field_config("phone", field_name)
        if config:
            result = validate_field_value_has_unit(value, config)
            status = "✓" if result == expected else "✗"
            print(f"{status} {field_name}: '{value}' → {result} (expected: {expected})")
if __name__ == "__main__":
    test_superlative_config()
