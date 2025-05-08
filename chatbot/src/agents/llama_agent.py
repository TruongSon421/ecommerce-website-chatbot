from llama_index.core.agent import ReActAgent
from llama_index.core.tools import FunctionTool
from llama_index.core.llms import ChatMessage
from typing import List, Dict, Any
from dotenv import load_dotenv
import os
from typing_extensions import TypedDict
from models import Requirements
from rag.retrieve import combine_results
from llama_index.llms.google_genai import GoogleGenAI
from .prompts import *
from .tools import *

load_dotenv()

def create_llama_tools():
    tools = [
        # FunctionTool.from_defaults(
        #     fn=casual_chatchit_tool,
        #     name="casual_chatchit_tool",
        #     description="Use this tool when users . Requires the original query."
        # ),
        FunctionTool.from_defaults(
            fn=product_consultation_tool,
            name="product_consultation_tool",
            description="Use this tool when users need help finding a suitable electronic device. Requires the device type (e.g., 'phone', 'laptop') and the original query."
        ),
        FunctionTool.from_defaults(
            fn=product_information_tool,
            name="product_information_tool",
            description="Use this tool to retrieve product information when users request specific details about a product or compare different products. Requires the specific product name. "
        ),
        FunctionTool.from_defaults(
            fn=product_complain_tool,
            name="product_complain_tool",
            description="Use this tool when users raise complaints about products or services. Requires the original query to process the complaint."
        ),
        FunctionTool.from_defaults(
            fn=shop_information_tool,
            name="shop_information_tool",
            description="Use this tool when users ask about shop details such as addresses, operating hours, hotlines, promotions, warranty periods, or return policies. Requires the original query."
        ),
        FunctionTool.from_defaults(
            fn=web_search_tool,
            name="web_search_tool",
            description="Use this tool to search for product information on the internet, specifically configuration details, only when the information for a product mentioned by the user is not available from product_information_tool. Input query should include 'thông tin cấu hình' followed by the product name (e.g., 'thông tin cấu hình iPhone 14').")
    ]
    return tools

def create_manager_agent(language):
    llm = GoogleGenAI(
        model="gemini-2.0-flash",
    )
    tools = create_llama_tools()    
    print(language)
    manager_instructions = MANAGER_INSTRUCTION.format(language=language)
    
    agent = ReActAgent.from_tools(
        tools,
        llm=llm,
        verbose=True,
        system_prompt=manager_instructions,
        max_iterations=20
    )
    
    return agent

async def process_chat(query: str, chat_history: List[ChatMessage] = None, language: str = 'vie'):
    if chat_history is None:
        chat_history = []
    map_language = {'vie':'Vietnamese','eng':'English'}
    agent = create_manager_agent(map_language[language])
    
    # Process the query with chat history
    if chat_history:
        response = await agent.achat(query, chat_history=chat_history)
    else:
        response = await agent.achat(query)
    
    return response.response