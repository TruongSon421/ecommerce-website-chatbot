# agents/product.py
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool, google_search, agent_tool
from tools.product_tools import product_consultation_tool, product_information_tool
from prompts import PRODUCT_INSTRUCTION, GLOBAL_INSTRUCTION
from callback.log_callback import *
from callback.before_llm_callback_lang import before_llm_callback_lang
from callback.after_model_callback import after_model_modifier

web_search_tool = LlmAgent(
    model="gemini-2.0-flash",
    name="SearchAgent",
    instruction="""
    You are a technology search specialist for an e-commerce platform. Use Google Search to provide accurate information about electronics and technology.

    SUPPORTED QUERIES:
    - Product info: "thông tin [product]" → specs, price, features
    - Product/technology comparison: "so sánh [product1/tech1] vs [product2/tech2]" → comparison table
    - Technology info: "công nghệ [tech]" → explanation, benefits
    - Market trends: "xu hướng [category]" → latest trends, news
    - Buying advice: "tư vấn [category] [budget]" → recommendations
    - Troubleshooting: "lỗi [device/problem]" → solutions

    RULES:
    - Only handle technology/electronics queries
    - Provide accurate, up-to-date information
    - Include Vietnamese market context
    - If no results: "Không tìm thấy thông tin cho [query]"
    - If off-topic: "Tôi chỉ hỗ trợ thông tin công nghệ và sản phẩm điện tử"
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
        FunctionTool(func=product_consultation_tool),
        FunctionTool(func=product_information_tool),
        agent_tool.AgentTool(agent=web_search_tool)
    ],
    after_tool_callback=log_after_tool_execution,
    before_tool_callback=product_before_tool_modifier,
    before_agent_callback=log_before_agent_entry,
    before_model_callback=before_llm_callback_lang,
    after_model_callback=after_model_modifier,
    output_key="product_result"
)