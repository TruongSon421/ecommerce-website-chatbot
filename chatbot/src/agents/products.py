# agents/product.py
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool, google_search, agent_tool
from tools.product_tools import product_consultation_tool, product_information_tool
from prompts import PRODUCT_INSTRUCTION, GLOBAL_INSTRUCTION
from agents.callbacks import *

web_search_tool = LlmAgent(
    model="gemini-2.0-flash",
    name="SearchAgent",
    instruction="""
    You are a specialist in Google Search, focused solely on retrieving product information (e.g., specifications, features, price, availability) for specifically named electronic products. Your role is to assist when local product information is insufficient.
    INSTRUCTIONS:
    - You ONLY handle search queries in the format "thông tin [product_name]" (e.g., "thông tin iPhone 14 Pro Max").
    - Use the `google_search` tool to perform the search and retrieve relevant results.
    - Summarize the product information (e.g., CPU, RAM, storage, display, camera, battery, price, key features) in Vietnamese, ensuring accuracy and clarity.
    - If no relevant results are found, respond: "Không tìm thấy thông tin cho [product_name]."
    - Do NOT perform general searches or handle queries unrelated to product information.
    - Do NOT engage in casual chat or answer non-product-related questions.
    """,
    tools=[google_search]
)

product_agent = LlmAgent(
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
    before_agent_callback=log_before_agent_entry
)