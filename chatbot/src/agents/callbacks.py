from google.adk.agents.callback_context import CallbackContext
from google.adk.tools.base_tool import BaseTool
from google.adk.models import LlmResponse, LlmRequest
from typing import Dict, Any, Optional
from google.adk.tools.tool_context import ToolContext
from google.genai.types import Content, Part
from google.genai import types
import json
import re
import copy

def log_after_tool_execution(
    tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext, tool_response: Dict
) -> Optional[Dict]:
    """
    Callback được gọi sau khi một tool thực thi thành công.
    Log lại tên agent, tên tool, tham số đầu vào và kết quả tool trả về.
    """
    agent_name = tool_context.agent_name
    tool_name = tool.name
    print("\n" + "="*20 + " AFTER TOOL EXECUTION (CALLBACK) " + "="*20)
    print(f"[Callback] Agent Name: '{agent_name}'")
    print(f"[Callback] Tool Executed: '{tool_name}'")
    try:
        print(f"[Callback] Arguments (Input) Passed to Tool:\n{json.dumps(args, indent=2, ensure_ascii=False)}")
        print(f"[Callback] Original Tool Response (Output):\n{json.dumps(tool_response, indent=2, ensure_ascii=False)}")
    except TypeError:
        print(f"[Callback] Arguments (Input) Passed to Tool: {args}")
        print(f"[Callback] Original Tool Response (Output): {tool_response}")
    print("="* (40 + len(" AFTER TOOL EXECUTION (CALLBACK) ")) + "\n")
    return None

def log_before_agent_entry(callback_context: CallbackContext) -> Optional[Content]:
    """Logs khi một agent chuẩn bị bắt đầu thực thi."""
    agent_name = callback_context.agent_name
    invocation_id = callback_context.invocation_id
    # current_state = callback_context.state.to_dict() # Bỏ comment nếu muốn xem state

    print("\n" + "-"*20 + f" AGENT START: {agent_name} " + "-"*20)
    print(f"[Callback] Invocation ID: {invocation_id}")
    # print(f"[Callback] State entering: {json.dumps(current_state, indent=2)}") # Bỏ comment nếu muốn xem state
    print("-"*(40 + len(f" AGENT START: {agent_name} ")) + "\n")

    # Luôn trả về None để agent tiếp tục chạy bình thường
    return None

def product_before_tool_modifier(
    tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext
) -> Optional[Dict]:
    """Inspects and modifies tool args for product_consultation_tool, ensuring top_k is set."""
    tool_name = tool.name
    agent_name = tool_context.agent_name
    print(f"[Before Tool Callback] Tool '{tool_name}' in agent '{agent_name}'")
    print(f"[Before Tool Callback] Original args: {args}")

    if tool_name == 'product_consultation_tool':
        # Kiểm tra xem top_k có trong args không
        if 'top_k' not in args or args['top_k'] is None:
            print("[Before Tool Callback] top_k not provided. Setting default to 5.")
            args['top_k'] = 5
        elif not isinstance(args['top_k'], int) or args['top_k'] <= 0:
            print("[Before Tool Callback] top_k is invalid. Setting to 5.")
            args['top_k'] = 5

        print(f"[Before Tool Callback] Modified args: {args}")
        return None  # Tiếp tục gọi tool với args đã sửa

    print("[Before Tool Callback] No modifications needed for other tools.")
    return None

def format_product_comparison_table(callback_context: CallbackContext, llm_response: LlmResponse) -> Optional[LlmResponse]:
    """
    After model callback để format lại text về so sánh và cấu hình sản phẩm cho dễ đọc.
    Format theo cấu trúc: mở đầu -> danh sách sản phẩm -> nhận xét -> lời khuyên.
    """
    agent_name = callback_context.agent_name
    print(f"[After Model Callback] Processing response for agent: {agent_name}")
    
    # Kiểm tra xem có nội dung text không
    if not llm_response.content or not llm_response.content.parts:
        print("[After Model Callback] No content parts found in response")
        return None
    
    # Lấy part đầu tiên
    first_part = llm_response.content.parts[0]
    
    # Kiểm tra nếu là function call thì không xử lý
    if first_part.function_call:
        print("[After Model Callback] Response contains function call, no text modification needed")
        return None
    
    # Kiểm tra nếu không có text content
    if not first_part.text:
        print("[After Model Callback] No text content found in response")
        return "Hệ thống đang bận, vui lòng thử lại sau."
    
    original_text = first_part.text
    print(f"[After Model Callback] Original text length: {len(original_text)}")
    
    # Kiểm tra xem response có chứa thông tin so sánh/cấu hình không
    comparison_keywords = [
        "**", "*"
    ]
    
    has_comparison_content = any(keyword.lower() in original_text.lower() for keyword in comparison_keywords)
    
    if not has_comparison_content:
        print("[After Model Callback] No ** content detected")
        return None
    
    print("[After Model Callback] Formatting text for better readability")
    
    # Format text cho dễ đọc
    formatted_text = format_text_for_readability(original_text)
    
    # Nếu không có thay đổi, trả về None
    if formatted_text == original_text:
        print("[After Model Callback] No formatting changes needed")
        return None
    
    # Tạo response mới với text đã format
    modified_parts = [copy.deepcopy(part) for part in llm_response.content.parts]
    modified_parts[0].text = formatted_text
    
    new_response = LlmResponse(
        content=Content(role="model", parts=modified_parts),
        grounding_metadata=llm_response.grounding_metadata
    )
    
    print("[After Model Callback] Returning formatted text for better readability")
    return new_response

def format_text_for_readability(text: str) -> str:
    """
    Format lại text về so sánh sản phẩm cho dễ đọc với layout đẹp.
    """
    # Phân tách text thành các phần
    sections = identify_text_sections(text)
    
    formatted_parts = []
    
    # 1. Phần mở đầu (intro)
    if sections.get('intro'):
        formatted_parts.append(f"**THÔNG TIN TỔNG QUAN**\n\n{clean_intro_text(sections['intro'])}\n")
    
    # 2. Danh sách sản phẩm
    if sections.get('products'):
        formatted_parts.append("**CHI TIẾT SẢN PHẨM**\n")
        for i, product in enumerate(sections['products'], 1):
            formatted_product = format_product_details(product, i)
            formatted_parts.append(formatted_product)
        formatted_parts.append("")
    
    # 3. Phần so sánh/nhận xét
    if sections.get('comparison'):
        formatted_parts.append(" **SO SÁNH & NHẬN XÉT**\n")
        formatted_comparison = format_comparison_text(sections['comparison'])
        formatted_parts.append(formatted_comparison + "\n")
    
    # 4. Lời khuyên
    if sections.get('advice'):
        # formatted_parts.append(" **KHUYẾN NGHỊ**\n")
        formatted_advice = format_advice_text(sections['advice'])
        formatted_parts.append(formatted_advice)
    
    return "\n".join(formatted_parts)

def identify_text_sections(text: str) -> dict:
    """
    Phân tách text thành các phần: intro, products, comparison, advice
    """
    sections = {}
    lines = text.split('\n')
    current_section = 'intro'
    current_content = []
    
    products = []
    current_product = None
    
    for line in lines:
        line = line.strip()
        
        # Detect product sections (bắt đầu với ** và có :)
        if re.match(r'\*\*([^*]+?)\*\*:', line):
            if current_section == 'intro' and current_content:
                sections['intro'] = '\n'.join(current_content).strip()
                current_content = []
                current_section = 'products'
            
            # Save previous product
            if current_product:
                products.append(current_product)
            
            # Start new product
            product_match = re.match(r'\*\*([^*]+?)\*\*:(.*)', line)
            if product_match:
                current_product = {
                    'name': product_match.group(1).strip(),
                    'specs': []
                }
                if product_match.group(2).strip():
                    current_product['specs'].append(product_match.group(2).strip())
        
        # Detect comparison section
        elif any(keyword in line.lower() for keyword in ['so sánh', 'nhận xét', 'đánh giá']):
            if current_product:
                products.append(current_product)
                current_product = None
            if products:
                sections['products'] = products
            current_section = 'comparison'
            current_content = [line]
        
        # Detect advice section
        elif any(keyword in line.lower() for keyword in ['lời khuyên', 'khuyến nghị', 'để đưa', 'nên xem xét', 'gợi ý']):
            if current_section == 'comparison' and current_content:
                sections['comparison'] = '\n'.join(current_content).strip()
                current_content = []
            current_section = 'advice'
            current_content = [line]
        
        # Add content to current section
        else:
            if current_product and line.startswith('*'):
                # Spec line for current product
                spec_text = line.lstrip('* ').strip()
                if spec_text:
                    current_product['specs'].append(spec_text)
            else:
                current_content.append(line)
    
    # Save remaining content
    if current_product:
        products.append(current_product)
    if products and 'products' not in sections:
        sections['products'] = products
    if current_section == 'intro' and current_content:
        sections['intro'] = '\n'.join(current_content).strip()
    elif current_section == 'comparison' and current_content:
        sections['comparison'] = '\n'.join(current_content).strip()
    elif current_section == 'advice' and current_content:
        sections['advice'] = '\n'.join(current_content).strip()
    
    return sections

def clean_intro_text(intro: str) -> str:
    """
    Clean up intro text
    """
    # Remove excessive line breaks
    intro = re.sub(r'\n{3,}', '\n\n', intro)
    intro = intro.strip()
    return intro

def format_product_details(product: dict, index: int) -> str:
    """
    Format thông tin chi tiết sản phẩm
    """
    formatted = f"\n**{index}. {product['name']}**\n"
    formatted += "─" * (len(product['name']) + 10) + "\n"
    
    for spec in product['specs']:
        # Parse spec line để tách field và value
        if ':' in spec:
            field, value = spec.split(':', 1)
            field = field.strip().lstrip('*').strip()
            value = value.strip()
            formatted += f"• {field}: {value}\n"
        else:
            formatted += f"• {spec.lstrip('*').strip()}\n"
    
    return formatted

def format_comparison_text(comparison: str) -> str:
    """
    Format phần so sánh
    """
    lines = comparison.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Remove * bullets and format nicely
        if line.startswith('*'):
            line = line.lstrip('* ').strip()
            if line:
                formatted_lines.append(f"▶ {line}")
        elif line.lower().startswith('so sánh'):
            continue  # Skip the header
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def format_advice_text(advice: str) -> str:
    """
    Format phần lời khuyên
    """
    lines = advice.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Remove * bullets and format nicely
        if line.startswith('*'):
            line = line.lstrip('* ').strip()
            if line:
                formatted_lines.append(f"✓ {line}")
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def detect_product_type(text: str) -> str:
    """
    Detect loại sản phẩm từ text để áp dụng pattern phù hợp.
    """
    text_lower = text.lower()
    
    # Phone indicators
    phone_indicators = ['galaxy', 'iphone', 'redmi', 'xiaomi', 'oppo', 'vivo', 'điện thoại', 'smartphone']
    
    # Laptop indicators  
    laptop_indicators = ['macbook', 'laptop', 'dell', 'hp', 'asus', 'lenovo', 'acer', 'msi', 'máy tính']
    
    # Headphone/Earphone indicators
    audio_indicators = ['airpods', 'buds', 'freebuds', 'tai nghe', 'headphone', 'earphone', 'earbud']
    
    # Charger/Cable indicators
    charger_indicators = ['sạc', 'charger', 'cable', 'cáp', 'pin dự phòng', 'power bank']
    
    if any(indicator in text_lower for indicator in phone_indicators):
        return 'phone'
    elif any(indicator in text_lower for indicator in laptop_indicators):
        return 'laptop'
    elif any(indicator in text_lower for indicator in audio_indicators):
        return 'audio'
    elif any(indicator in text_lower for indicator in charger_indicators):
        return 'charger'
    
    return 'phone'  # Default to phone

def get_spec_fields_by_type(product_type: str) -> list:
    """
    Lấy danh sách thông số kỹ thuật theo loại sản phẩm.
    """
    spec_fields = {
        'phone': [
            "Hệ điều hành", "Vi xử lý", "Tốc độ chip", "Chip đồ họa", "RAM", "Dung lượng", "Dung lượng khả dụng",
            "Danh bạ", "Độ phân giải camera sau", "Quay phim camera sau", "Đèn flash", "Tính năng camera sau",
            "Độ phân giải camera trước", "Tính năng camera trước", "Công nghệ màn hình", "Độ phân giải màn hình",
            "Màn hình rộng", "Độ sáng tối đa", "Mặt kính cảm ứng", "Dung lượng pin", "Loại pin",
            "Hỗ trợ sạc tối đa", "Công nghệ pin", "Bảo mật nâng cao", "Tính năng đặc biệt", "Kháng nước, bụi",
            "Ghi âm", "Xem phim", "Nghe nhạc", "Mạng di động", "SIM", "WiFi", "GPS", "Bluetooth",
            "Cổng sạc", "Jack tai nghe", "Kết nối khác", "Kiểu thiết kế", "Chất liệu", "Kích thước, khối lượng"
        ],
        'laptop': [
            "Công nghệ CPU", "Số nhân", "Số luồng", "Tốc độ CPU", "Tốc độ tối đa", "RAM", "Loại RAM",
            "Tốc độ Bus RAM", "Hỗ trợ RAM tối đa", "Ổ cứng", "Kích thước màn hình", "Độ phân giải",
            "Tần số quét", "Độ phủ màu", "Công nghệ màn hình", "Card màn hình", "Công nghệ âm thanh",
            "Cổng giao tiếp", "Kết nối không dây", "Webcam", "Tính năng khác", "Đèn bàn phím",
            "Kích thước", "Chất liệu", "Pin", "Hệ điều hành"
        ],
        'audio': [
            "Thời lượng pin tai nghe", "Thời lượng pin hộp sạc", "Cổng sạc", "Công nghệ âm thanh",
            "Tương thích", "Ứng dụng kết nối", "Jack cắm", "Độ dài dây", "Tiện ích",
            "Kết nối cùng lúc", "Công nghệ kết nối", "Điều khiển", "Phím điều khiển",
            "Kích thước", "Khối lượng", "Thương hiệu của", "Sản xuất tại"
        ],
        'charger': [
            "Dung lượng pin", "Hiệu suất sạc", "Lõi pin", "Công nghệ/ Tiện ích", "Thời gian sạc đầy pin",
            "Nguồn ra", "Nguồn vào", "Model", "Chức năng", "Đầu vào", "Đầu ra", "Độ dài dây", "Công suất tối đa",
            "Dòng sạc tối đa", "Jack kết nối", "Kích thước", "Khối lượng", "Thương hiệu của", "Sản xuất tại"
        ]
    }
    
    return spec_fields.get(product_type, spec_fields['phone'])

def extract_specifications_data(text: str) -> dict:
    """
    Tổng quát hóa việc extract thông tin cấu hình và so sánh sản phẩm.
    Xử lý được mọi format response từ LLM.
    """
    product_type = detect_product_type(text)
    expected_specs = get_spec_fields_by_type(product_type)
    
    print(f"[Extract Specs] Detected product type: {product_type}")
    print(f"[Extract Specs] Processing text length: {len(text)}")
    
    # Bước 1: Tìm các sản phẩm được mention trong text
    products = extract_all_products(text)
    print(f"[Extract Specs] Found products: {[p['name'] for p in products]}")
    
    # Bước 2: Nếu có 2+ sản phẩm -> tạo comparison
    if len(products) >= 2:
        comparison_data = create_comparison_table(products, text, expected_specs)
        if comparison_data:
            return {
                "comparison": comparison_data,
                "type": "comparison", 
                "product_type": product_type
            }
    
    # Bước 3: Nếu chỉ có 1 sản phẩm hoặc specs tổng quát -> tạo single specs table
    all_specs = extract_all_specifications(text, expected_specs, products)
    
    if not all_specs:
        return {}
    
    # Nếu chỉ có 1 sản phẩm và có specs riêng cho sản phẩm đó
    if len(products) == 1 and any(products[0]['name'] in spec['name'] for spec in all_specs):
        return {
            "specifications": all_specs,
            "type": "specifications",
            "product_type": product_type,
            "product_name": products[0]['name']
        }
    
    # Specs tổng quát
    return {
        "specifications": all_specs,
        "type": "specifications", 
        "product_type": product_type
    }

def extract_all_products(text: str) -> list:
    """
    Tìm tất cả sản phẩm được đề cập trong text.
    """
    products = []
    
    # Pattern 1: **Product Name (specs):**
    pattern1 = r'\*\*([^*]+?(?:\([^)]+\))?)\*\*:'
    matches1 = re.findall(pattern1, text)
    
    for match in matches1:
        product_name = match.strip()
        if product_name and len(product_name) > 2:
            products.append({
                'name': product_name,
                'pattern': 'bold_with_colon'
            })
    
    # Pattern 2: Tìm tên sản phẩm trong text (brand + model)
    brand_patterns = [
        r'(iPhone\s+[^\s,\.]+)',
        r'(Galaxy\s+[^\s,\.]+)', 
        r'(Redmi\s+[^\s,\.]+)',
        r'(OPPO\s+[^\s,\.]+)',
        r'(vivo\s+[^\s,\.]+)',
        r'(Xiaomi\s+[^\s,\.]+)',
        r'(MacBook\s+[^\s,\.]+)',
        r'(Dell\s+[^\s,\.]+)',
        r'(HP\s+[^\s,\.]+)',
        r'(ASUS\s+[^\s,\.]+)',
        r'(Lenovo\s+[^\s,\.]+)'
    ]
    
    for pattern in brand_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            product_name = match.strip()
            # Tránh duplicate
            if product_name and not any(p['name'].lower() == product_name.lower() for p in products):
                products.append({
                    'name': product_name,
                    'pattern': 'brand_model'
                })
    
    return products

def create_comparison_table(products: list, text: str, expected_specs: list) -> dict:
    """
    Tạo bảng so sánh cho nhiều sản phẩm.
    """
    comparison_products = []
    
    for product in products:
        product_name = product['name']
        specs = []
        
        # Tìm specs cho sản phẩm này
        specs.extend(extract_product_specific_specs(text, product_name, expected_specs))
        
        if specs:
            comparison_products.append({
                'name': product_name,
                'specs': specs
            })
    
    if len(comparison_products) >= 2:
        return {
            'products': comparison_products
        }
    
    return {}

def extract_all_specifications(text: str, expected_specs: list, products: list) -> list:
    """
    Extract tất cả specifications từ text.
    """
    all_specs = []
    seen_specs = set()
    
    # 1. Extract specs specific cho từng sản phẩm
    for product in products:
        product_specs = extract_product_specific_specs(text, product['name'], expected_specs)
        for spec in product_specs:
            spec_key = f"{spec['name']}:{spec['value']}"
            if spec_key not in seen_specs:
                seen_specs.add(spec_key)
                all_specs.append(spec)
    
    # 2. Extract general specs không gắn với sản phẩm cụ thể
    general_specs = extract_general_specs(text, expected_specs)
    for spec in general_specs:
        spec_key = f"{spec['name']}:{spec['value']}"
        if spec_key not in seen_specs:
            seen_specs.add(spec_key)
            all_specs.append(spec)
    
    return all_specs

def extract_product_specific_specs(text: str, product_name: str, expected_specs: list) -> list:
    """
    Extract specs cho một sản phẩm cụ thể.
    """
    specs = []
    
    # Tìm section cho sản phẩm này
    product_sections = find_product_sections(text, product_name)
    
    for section in product_sections:
        # Pattern 1: * **Field:** Value
        bullet_pattern = r'\*\s*\*\*([^*]+?)\*\*:\s*([^\n*]+)'
        matches = re.findall(bullet_pattern, section, re.IGNORECASE)
        
        for field, value in matches:
            field = field.strip()
            value = value.strip()
            
            if is_technical_specification(field) and value:
                specs.append({
                    'name': f"{product_name} - {field}",
                    'value': value
                })
        
        # Pattern 2: Field: Value (trong bullet points)
        field_pattern = r'\*\s*([^:*]+?):\s*([^\n*]+)'
        matches = re.findall(field_pattern, section, re.IGNORECASE)
        
        for field, value in matches:
            field = field.strip()
            value = value.strip()
            
            if is_technical_specification(field) and value:
                specs.append({
                    'name': f"{product_name} - {field}",
                    'value': value
                })
        
        # Pattern 3: Expected specs format
        for expected_spec in expected_specs:
            pattern = rf'{re.escape(expected_spec)}\s*:\s*([^\n,;*]+)'
            matches = re.findall(pattern, section, re.IGNORECASE)
            
            for match in matches:
                value = match.strip()
                if value and value != "Không có":
                    specs.append({
                        'name': f"{product_name} - {expected_spec}",
                        'value': value
                    })
    
    return specs

def find_product_sections(text: str, product_name: str) -> list:
    """
    Tìm các section trong text liên quan đến sản phẩm.
    """
    sections = []
    
    # Pattern 1: **Product:** đến hết đoạn hoặc đến product khác
    pattern1 = rf'\*\*{re.escape(product_name)}\*\*:(.*?)(?=\*\*[^*]+?\*\*:|$)'
    matches1 = re.findall(pattern1, text, re.DOTALL | re.IGNORECASE)
    sections.extend(matches1)
    
    # Pattern 2: Tìm đoạn text có chứa tên sản phẩm
    lines = text.split('\n')
    current_section = []
    in_product_section = False
    
    for line in lines:
        if product_name.lower() in line.lower():
            in_product_section = True
            current_section = [line]
        elif in_product_section:
            if line.strip() == '' or any(brand in line for brand in ['**', 'So sánh', 'Để đưa']):
                if current_section:
                    sections.append('\n'.join(current_section))
                    current_section = []
                in_product_section = False
            else:
                current_section.append(line)
    
    if current_section:
        sections.append('\n'.join(current_section))
    
    return sections

def extract_general_specs(text: str, expected_specs: list) -> list:
    """
    Extract specs tổng quát không gắn với sản phẩm cụ thể.
    """
    specs = []
    
    # Các pattern cho specs tổng quát
    patterns = [
        r'([A-Za-zÀ-ÿ\s]+?):\s*([^\n]+)',  # Field: Value
        r'•\s*([^:]+?):\s*([^\n]+)',       # • Field: Value
        r'-\s*([^:]+?):\s*([^\n]+)',       # - Field: Value
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        for field, value in matches:
            field = field.strip()
            value = value.strip()
            
            # Bỏ qua nếu có tên sản phẩm trong field
            if any(brand in field.lower() for brand in ['iphone', 'galaxy', 'redmi', 'oppo', 'vivo', 'xiaomi']):
                continue
                
            if is_technical_specification(field) and value:
                specs.append({
                    'name': field,
                    'value': value
                })
    
    return specs



def extract_product_specs(text: str, product_name: str, product_type: str = 'phone') -> list:
    """
    Extract thông số kỹ thuật cho một sản phẩm cụ thể.
    """
    # Tìm section chứa thông tin của sản phẩm
    product_section_pattern = rf'{re.escape(product_name)}.*?(?=\n\n|\Z)'
    section_match = re.search(product_section_pattern, text, re.IGNORECASE | re.DOTALL)
    
    if not section_match:
        return []
    
    section_text = section_match.group(0)
    expected_specs = get_spec_fields_by_type(product_type)
    
    # Extract specs từ section này
    spec_patterns = [
        r'(\w+.*?):\s*([^\n]+)',
        r'•\s*(\w+.*?):\s*([^\n]+)',
        r'-\s*(\w+.*?):\s*([^\n]+)',
    ]
    
    specs = []
    
    # Tìm theo expected specs trước
    for expected_spec in expected_specs:
        pattern = rf'{re.escape(expected_spec)}\s*:\s*([^\n,;]+)'
        matches = re.findall(pattern, section_text, re.IGNORECASE)
        
        for match in matches:
            value = match.strip()
            if value and value != "Không có":
                specs.append({
                    "name": expected_spec,
                    "value": value
                })
    
    # Fallback với patterns chung
    for pattern in spec_patterns:
        matches = re.findall(pattern, section_text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            spec_name = match[0].strip()
            spec_value = match[1].strip()
            
            if is_technical_specification(spec_name):
                # Tránh duplicate
                existing_names = [s["name"] for s in specs]
                if spec_name not in existing_names:
                    specs.append({
                        "name": spec_name,
                        "value": spec_value
                    })
    
    return specs

def is_technical_specification(spec_name: str) -> bool:
    """
    Kiểm tra xem một tên có phải là thông số kỹ thuật không.
    Sử dụng thông tin từ product config mapping.
    """
    # Danh sách thông số kỹ thuật từ rag_app.py
    phone_specs = [
        "hệ điều hành", "vi xử lý", "tốc độ chip", "chip đồ họa", "ram", "dung lượng", "dung lượng khả dụng",
        "danh bạ", "độ phân giải camera sau", "quay phim camera sau", "đèn flash", "tính năng camera sau",
        "độ phân giải camera trước", "tính năng camera trước", "công nghệ màn hình", "độ phân giải màn hình",
        "màn hình rộng", "độ sáng tối đa", "mặt kính cảm ứng", "dung lượng pin", "loại pin",
        "hỗ trợ sạc tối đa", "công nghệ pin", "bảo mật nâng cao", "tính năng đặc biệt", "kháng nước, bụi",
        "ghi âm", "xem phim", "nghe nhạc", "mạng di động", "sim", "wifi", "gps", "bluetooth",
        "cổng sạc", "jack tai nghe", "kết nối khác", "kiểu thiết kế", "chất liệu", "kích thước, khối lượng"
    ]
    
    laptop_specs = [
        "công nghệ cpu", "số nhân", "số luồng", "tốc độ cpu", "tốc độ tối đa", "ram", "loại ram",
        "tốc độ bus ram", "hỗ trợ ram tối đa", "ổ cứng", "kích thước màn hình", "độ phân giải",
        "tần số quét", "độ phủ màu", "công nghệ màn hình", "card màn hình", "công nghệ âm thanh",
        "cổng giao tiếp", "kết nối không dây", "webcam", "tính năng khác", "đèn bàn phím",
        "kích thước", "chất liệu", "pin", "hệ điều hành"
    ]
    
    accessory_specs = [
        "dung lượng pin", "hiệu suất sạc", "lõi pin", "công nghệ/ tiện ích", "thời gian sạc đầy pin",
        "nguồn ra", "nguồn vào", "model", "chức năng", "đầu vào", "đầu ra", "độ dài dây", "công suất tối đa",
        "dòng sạc tối đa", "jack kết nối", "thời lượng pin tai nghe", "thời lượng pin hộp sạc", "cổng sạc",
        "tương thích", "ứng dụng kết nối", "jack cắm", "tiện ích", "kết nối cùng lúc", "công nghệ kết nối",
        "điều khiển", "phím điều khiển", "khối lượng", "thương hiệu của", "sản xuất tại"
    ]
    
    # Từ khóa chung
    common_keywords = [
        'cpu', 'processor', 'ram', 'memory', 'storage', 'bộ nhớ',
        'camera', 'pin', 'battery', 'màn hình', 'screen', 'display',
        'chipset', 'gpu', 'wifi', 'bluetooth', 'usb', 'port',
        'resolution', 'độ phân giải', 'kích thước', 'size', 'weight',
        'trọng lượng', 'hệ điều hành', 'os', 'operating system',
        'sim', 'network', 'mạng', 'kết nối', 'connectivity',
        'dài', 'ngang', 'dày', 'nặng', 'length', 'width', 'thickness',
        'height', 'depth', 'dimension', 'kích cỡ'
    ]
    
    # Tên thương hiệu/sản phẩm
    brand_keywords = [
        'galaxy', 'redmi', 'iphone', 'xiaomi', 'samsung', 'oppo', 'vivo',
        'macbook', 'dell', 'hp', 'asus', 'lenovo', 'acer', 'msi',
        'airpods', 'buds', 'freebuds', 'soundcore', 'jbl', 'sony'
    ]
    
    spec_lower = spec_name.lower()
    
    # Nếu chứa tên sản phẩm thì luôn coi là spec
    if any(brand in spec_lower for brand in brand_keywords):
        return True
    
    # Kiểm tra các thông số kỹ thuật cụ thể
    all_specs = phone_specs + laptop_specs + accessory_specs + common_keywords
    
    # Kiểm tra exact match hoặc partial match
    for spec in all_specs:
        if spec.lower() in spec_lower or any(word in spec_lower for word in spec.lower().split()):
            return True
    
    return False

