from google.adk.agents import LlmAgent
from prompts import SHOP_INSTRUCTION, GLOBAL_INSTRUCTION
from callback.log_callback import log_before_agent_entry,log_after_tool_execution
from tools.shop_tools import shop_information_tool
from google.adk.tools import FunctionTool
from callback.before_llm_callback_lang import before_llm_callback_lang

shop_agent = LlmAgent(
    name="Shop",
    description="Necessary when users want to ask about general shop information like sales, addresses, hotline, promotions, policies, payment methods...",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction=SHOP_INSTRUCTION,
    tools=[FunctionTool(func=shop_information_tool)],
    after_tool_callback=log_after_tool_execution,  
    before_agent_callback = log_before_agent_entry,
    before_model_callback=before_llm_callback_lang
)
