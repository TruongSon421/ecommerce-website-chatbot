# agents/product.py
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool, google_search, agent_tool
from tools.product_tools import product_consultation_tool, product_information_tool, product_consultation_tool_mongo, detailed_specs_search_hybrid
from prompts import PRODUCT_INSTRUCTION, GLOBAL_INSTRUCTION
from callback.log_callback import *
from callback.before_llm_callback_lang import before_llm_callback_lang
from callback.after_model_callback import after_model_modifier
from google.adk.models.lite_llm import LiteLlm
from dotenv import load_dotenv
import os
load_dotenv("../.env")
web_search_tool = LlmAgent(
    model="gemini-2.0-flash",
    name="SearchAgent",
    instruction="""
   Bạn là chuyên gia tìm kiếm thông tin công nghệ cho nền tảng thương mại điện tử. Sử dụng Google Search để cung cấp thông tin chính xác về điện tử và công nghệ.

   CÁC LOẠI TRUY VẤN HỖ TRỢ:
   - Thông tin sản phẩm: "thông tin [sản phẩm]" → thông số kỹ thuật, giá cả, tính năng
   - So sánh sản phẩm/công nghệ: "so sánh [sản phẩm1/công nghệ1] vs [sản phẩm2/công nghệ2]" → bảng so sánh
   - Thông tin công nghệ: "công nghệ [tên công nghệ]" → giải thích, lợi ích
   - Xu hướng thị trường: "xu hướng [danh mục]" → xu hướng mới nhất, tin tức
   - Xử lý lỗi: "lỗi [thiết bị/vấn đề]" → giải pháp khắc phục

   QUY TẮC:
   - Chỉ xử lý các truy vấn về công nghệ/điện tử
   - Cung cấp thông tin chính xác, cập nhật
   - Bao gồm bối cảnh thị trường Việt Nam
   - Không trả lời các câu hỏi liên quan đến tìm kiếm sản phẩm theo nhu cầu hay tư vấn sản phẩm
   - Nếu không tìm thấy kết quả: "Không tìm thấy thông tin cho [truy vấn]"
   """,
    tools=[google_search]
)

product_agent = LlmAgent(
    model="gemini-2.0-flash",
    name="Product",
    description="Handles product shopping, product consultation and product information.",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction=PRODUCT_INSTRUCTION,
    tools=[
        FunctionTool(func=product_consultation_tool_mongo),
        FunctionTool(func=product_information_tool),
        FunctionTool(func=detailed_specs_search_hybrid),
        agent_tool.AgentTool(agent=web_search_tool)
    ],
    after_tool_callback=log_after_tool_execution,
    before_tool_callback=product_before_tool_modifier,
    before_agent_callback=log_before_agent_entry,
    after_model_callback=after_model_modifier,
    before_model_callback=before_llm_callback_lang,
    output_key="product_result"
)