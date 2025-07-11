import copy
import re
from google.adk.agents.callback_context import CallbackContext
from typing import Optional
from google.genai import types
from google.adk.models import LlmResponse

def after_model_modifier(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> Optional[LlmResponse]:
    """Kiểm tra và chỉnh sửa nội dung phản hồi từ LLM nếu cần."""

    agent_name = callback_context.agent_name
    print(f"[Callback] After model call for agent: {agent_name}")

    # --- Kiểm tra nội dung phản hồi ---
    if not llm_response.content or not llm_response.content.parts:
        print("[Callback] No content to modify.")
        # Tạo response mới với thông báo lỗi
        error_part = types.Part(text="Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể nói lại không?")
        new_response = LlmResponse(
            content=types.Content(role="model", parts=[error_part]),
            grounding_metadata=llm_response.grounding_metadata if llm_response.grounding_metadata else None
        )
        return new_response

    part = llm_response.content.parts[0]
    if part.function_call:
        print(f"[Callback] Contains function call: {part.function_call.name}. Skipping.")
        return None

    if not part.text:
        print("[Callback] No text found in first part.")
        return None

    original_text = part.text
    print(f"[Callback] Original text: '{original_text[:100]}...'")

    modified_text = original_text

    # --- 1. Xóa thông tin nhạy cảm nhưng giữ nguyên format ---
    patterns_to_remove = [
        r'[\s,;:\(\[]*ID\s*[:=]?\s*\w+[\s,;:\)\]]*',
        r'[\s,;:\(\[]*group_id\s*[:=]?\s*\w+[\s,;:\)\]]*',
        r'[\s,;:\(\[]*Group\s*id\s*[:=]?\s*\w+[\s,;:\)\]]*',
        r'[\s,;:\(\[]*product_id\s*[:=]?\s*\w+[\s,;:\)\]]*',
        r'[\s,;:\(\[]*mã\s*sản\s*phẩm\s*[:=]?\s*\w+[\s,;:\)\]]*',
    ]

    for pattern in patterns_to_remove:
        if re.search(pattern, modified_text, flags=re.IGNORECASE):
            print(f"[Callback] Removing sensitive info matching: '{pattern}'")
            modified_text = re.sub(pattern, '', modified_text, flags=re.IGNORECASE)

    # --- 2. Cải thiện format text một cách thông minh hơn ---
    print("[Callback] Processing text formatting for better readability...")
    
    # Chỉ xử lý markdown nếu có markdown thật sự và không phá vỡ format hiện tại
    if '**' in modified_text or '*' in modified_text:
        # Cẩn thận với markdown - chỉ xử lý khi cần thiết
        # Giữ nguyên dấu * nếu nó không phải markdown mà là bullet point
        lines = modified_text.split('\n')
        processed_lines = []
        
        for line in lines:
            # Chỉ xử lý markdown khi chắc chắn là markdown (có cặp ** hoặc *)
            if '**' in line:
                # Xử lý bold markdown: **text** -> text (in đậm)
                line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
            
            # Không xóa dấu * đơn vì có thể là bullet point
            processed_lines.append(line)
        
        modified_text = '\n'.join(processed_lines)
    
    # --- 3. Cải thiện format danh sách và giá tiền ---
    # Chuẩn hóa format giá tiền
    modified_text = re.sub(r'(\d{1,3}(?:[\.,]\d{3})*)\s*đồng', r'\1 đồng', modified_text, flags=re.IGNORECASE)
    modified_text = re.sub(r'(\d{1,3}(?:[\.,]\d{3})*)\s*VNĐ', r'\1 VNĐ', modified_text, flags=re.IGNORECASE)
    
    # Cải thiện format danh sách sản phẩm
    # Trước tiên, xử lý case đặc biệt: giá bị xuống dòng riêng
    modified_text = re.sub(r'\)\s*\(Giá\s*\n\s*(\d+)', r') (Giá \1', modified_text)
    modified_text = re.sub(r'\)\s*\n\s*(\d{1,3}(?:[\.,]\d{3})*\s*đồng)', r') (Giá \1)', modified_text)
    
    lines = modified_text.split('\n')
    processed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Nếu là dòng trống, bỏ qua
        if not line:
            i += 1
            continue
            
        # Xử lý bullet point và format sản phẩm
        if 'laptop' in line.lower() or 'máy tính' in line.lower():
            # Kiểm tra xem có phải là dòng sản phẩm thực sự không (có model/mã sản phẩm)
            is_product_line = bool(re.search(r'laptop\s+\w+\s+\w+', line.lower()) or 
                                 re.search(r'(i\d|r\d|ryzen|core)', line.lower()) or
                                 re.search(r'\w+\d+\w*', line))
            
            if is_product_line:
                # Thay thế dấu * bằng bullet đẹp hơn
                if line.startswith('*'):
                    line = '•' + line[1:]
                elif not line.startswith('•') and not line.startswith('-'):
                    line = '• ' + line
            else:
                # Nếu không phải sản phẩm cụ thể, xóa bullet nếu có
                if line.startswith('•') and ('chào' in line.lower() or 'với ngân sách' in line.lower() or 'ngoài ra' in line.lower()):
                    line = line[1:].strip()
            
            # Kiểm tra và ghép dòng tiếp theo nếu là thông tin giá bị tách
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                # Nếu dòng tiếp theo chỉ chứa số tiền (bị tách từ dòng trước)
                if next_line and re.match(r'^\d{1,3}(?:[\.,]\d{3})*\s*đồng\s*\)?\s*$', next_line):
                    # Ghép vào dòng hiện tại
                    line = f"{line.rstrip(')')} {next_line}"
                    i += 1  # Skip dòng tiếp theo
                elif next_line and ('giá' in next_line.lower() or next_line.startswith('(')):
                    # Ghép dòng giá vào
                    line = f"{line} {next_line}"
                    i += 1
            
            # Format tách tên sản phẩm và giá để dễ đọc
            if '(giá' in line.lower():
                # Tìm và tách phần giá ra
                price_pattern = r'\s*\([^)]*[gG]iá[^)]*\)'
                price_match = re.search(price_pattern, line)
                if price_match:
                    product_part = line[:price_match.start()].strip()
                    price_part = price_match.group().strip()
                    processed_lines.append(product_part)
                    processed_lines.append(f"    {price_part}")
                else:
                    processed_lines.append(line)
            else:
                processed_lines.append(line)
        else:
            # Dòng không phải sản phẩm
            processed_lines.append(line)
        
        i += 1
    
    modified_text = '\n'.join(processed_lines)
    
    # Thêm khoảng cách giữa các sản phẩm để dễ đọc hơn
    modified_text = re.sub(r'(\(Giá[^)]*\))\n(•)', r'\1\n\n\2', modified_text)
    
    # Xử lý các dấu * còn sót lại trong văn bản (không phải bullet point)
    # Pattern 1: Xử lý dấu * sau dấu chấm hoặc ở giữa câu trước laptop
    modified_text = re.sub(r'(\.|đồng)\s*\*\s*(Laptop\s+\w+)', r'\1\n\n• \2', modified_text)
    modified_text = re.sub(r'(\w+)\s*\*\s*(Laptop\s+\w+)', r'\1\n\n• \2', modified_text)
    
    # Pattern 2: Xử lý dấu * ở đầu hoặc giữa dòng
    modified_text = re.sub(r'(?<=\s)\*\s*(Laptop\s+\w+)', r'\n\n• \1', modified_text)
    modified_text = re.sub(r'^\*\s*(Laptop\s+\w+)', r'• \1', modified_text, flags=re.MULTILINE)
    
    # Xử lý tất cả các dòng để đảm bảo không còn dấu * thừa
    lines = modified_text.split('\n')
    final_lines = []
    for line in lines:
        line_stripped = line.strip()
        # Nếu dòng bắt đầu bằng * và chứa laptop
        if line_stripped.startswith('*') and 'laptop' in line_stripped.lower():
            # Kiểm tra có phải sản phẩm thật không
            if (re.search(r'laptop\s+\w+\s+\w+', line_stripped.lower()) or 
                re.search(r'(i\d|r\d|ryzen|core)', line_stripped.lower()) or
                re.search(r'\w+\d+\w*', line_stripped)):
                line = line.replace('*', '•', 1)
        # Xử lý dấu * ở giữa dòng
        elif '*' in line and 'laptop' in line.lower():
            # Tìm vị trí của dấu * và thay thế
            if re.search(r'\*\s*(Laptop\s+\w+)', line):
                line = re.sub(r'(.+?)\s*\*\s*(Laptop\s+\w+.*)', r'\1\n\n• \2', line)
        
        final_lines.append(line)
    modified_text = '\n'.join(final_lines)

    # --- 4. Làm sạch các lỗi format nhẹ nhàng ---
    # Chỉ xóa khoảng trắng thừa và dấu câu lỗi, không làm mất format
    modified_text = re.sub(r' {3,}', '  ', modified_text)  # Giảm khoảng trắng quá nhiều thành 2
    modified_text = re.sub(r'\n{3,}', '\n\n', modified_text)  # Giảm xuống dòng quá nhiều
    
    # Xóa dấu câu trống nhưng cẩn thận
    modified_text = re.sub(r'\(\s*[,;]?\s*\)', '', modified_text)
    modified_text = re.sub(r'\[\s*[,;]?\s*\]', '', modified_text)
    
    # Strip cuối cùng
    modified_text = modified_text.strip()

    # Nếu không có thay đổi gì, return None
    if modified_text == original_text:
        print("[Callback] No modification needed.")
        return None

    # --- Tạo LlmResponse mới đã chỉnh sửa ---
    modified_parts = [copy.deepcopy(part) for part in llm_response.content.parts]
    modified_parts[0].text = modified_text

    new_response = LlmResponse(
        content=types.Content(role="model", parts=modified_parts),
        grounding_metadata=llm_response.grounding_metadata
    )

    print(f"[Callback] Text modified from {len(original_text)} to {len(modified_text)} chars")
    print(f"[Callback] Modified text preview: '{modified_text[:200]}...'")
    return new_response
