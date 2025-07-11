from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse, LlmRequest
from typing import Optional
from google.genai import types
import json
import re

def before_llm_callback_lang(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmResponse]:
    """
    Universal language callback for all agents.
    Ensures all responses are in the correct detected language from state.
    Also provides specific guidance for cart operations when needed.
    """

    agent_name = callback_context.agent_name
    print(f"[Language Callback] Before model call for agent: {agent_name}")
    
    # Get detected language from state
    detected_language = callback_context.state.get("detected_language")
    print(f"[Language Callback] Detected language from state: '{detected_language}'")
    
    # Determine if model is OpenAI (via LiteLLM)
    model_name = llm_request.model.lower() if llm_request.model else ""
    is_openai = any(m in model_name for m in ["gpt", "openai"])
    
    # Create instruction content
    language_instructions = ""
    if detected_language:
        if detected_language.lower() in ['vie', 'vietnamese', 'vi']:
            language_instructions = """

HƯỚNG DẪN NGÔN NGỮ QUAN TRỌNG CHO TẤT CẢ AGENT:
- BẮT BUỘC trả lời bằng tiếng Việt cho tất cả các phản hồi
- Sử dụng từ ngữ tự nhiên và phù hợp với văn hóa Việt Nam
- Địa chỉ khách hàng một cách lịch sự (anh/chị, quý khách)
- Nếu không thể trả lời bằng tiếng Việt, hãy giải thích bằng tiếng Việt tại sao
- Áp dụng cho mọi tương tác: tìm kiếm sản phẩm, thêm vào giỏ hàng, thanh toán, tư vấn, etc.
"""
        elif detected_language.lower() in ['eng', 'english', 'en']:
            language_instructions = """

IMPORTANT LANGUAGE INSTRUCTIONS FOR ALL AGENTS:
- MUST respond in English for all responses
- Use natural and professional English language
- Address customers politely and professionally
- If unable to respond in English, explain why in English
- Apply to all interactions: product search, cart operations, checkout, consultation, etc.
"""
        else:
            language_instructions = f"""

IMPORTANT LANGUAGE INSTRUCTIONS FOR ALL AGENTS:
- MUST respond in {detected_language} language for all responses
- Use natural and appropriate language for {detected_language}
- If unable to respond in {detected_language}, acknowledge in {detected_language} or English and explain why
- Apply to all interactions: product search, cart operations, checkout, consultation, etc.
"""
    else:
        language_instructions = """

HƯỚNG DẪN NGÔN NGỮ MẶC ĐỊNH CHO TẤT CẢ AGENT:
- Mặc định trả lời bằng tiếng Việt
- Sử dụng từ ngữ tự nhiên và lịch sự
- Áp dụng cho mọi tương tác trong hệ thống
"""

    # Handle GPT-style system_instruction (as plain string or list)
    if is_openai:
        current_instruction = llm_request.config.system_instruction or ""
        if isinstance(current_instruction, list):
            # multi-modal (GPT-4o style), add new text block
            current_instruction.append({
                "type": "text",
                "text": language_instructions.strip()
            })
            llm_request.config.system_instruction = current_instruction
        else:
            # plain text mode
            new_instruction = (current_instruction or "") + "\n" + language_instructions.strip()
            llm_request.config.system_instruction = new_instruction

    # Handle Gemini-style instruction (Content object)
    else:
        original_instruction = llm_request.config.system_instruction or types.Content(
            role="system", parts=[]
        )
        if not isinstance(original_instruction, types.Content):
            original_instruction = types.Content(
                role="system", parts=[types.Part(text=str(original_instruction))]
            )
        if not original_instruction.parts:
            original_instruction.parts.append(types.Part(text=""))
        original_text = original_instruction.parts[0].text or ""
        original_instruction.parts[0].text = original_text + "\n" + language_instructions.strip()
        llm_request.config.system_instruction = original_instruction

    print(f"[Language Callback] Added universal language instructions for: '{detected_language or 'default'}'")
    return None
