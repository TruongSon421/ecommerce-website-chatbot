import logging
import warnings
from google.adk import Agent
from google.adk.agents import LlmAgent
from .promts import GLOBAL_INSTRUCTION
from .CartAgent import CartAgent
from .FilterProductAgent import FilterProductAgent
from .CompareAgent import CompareProductAgent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools import load_memory # Tool to query memory

logger = logging.getLogger(__name__)

GEMINI_2_FLASH = "gemini-2.0-flash"

GreetingAgent = LlmAgent(
    name="GreetingAgent",
    model=GEMINI_2_FLASH,
    description="A simple agent that greets the user.",
    instruction='''You are the Greeting Agent.  
                Your ONLY task is to print this exact sentence, and nothing else:  
                "Xin chào bạn! Tôi là trợ lý ảo của NEXUS. Rất vui khi được giúp đỡ bạn."
                Do not provide any additional responses, explanations, or actions. 
                ''',
)


ChatChitAgent = LlmAgent(
    name="ChatChitAgent",
    model=GEMINI_2_FLASH,
    description="An agent that chats with users but avoids answering sensitive questions.",
    instruction='''You are the Chat Chit Agent.

            Your task is to have friendly, natural small talk with the customer.  
            You should sound warm, polite, and conversational — like a helpful assistant making the customer feel welcome.

            You may gently mention that you're available to help with NEXUS's products or services (such as phones, laptops, or digital accessories) if the topic comes up naturally.  
            Avoid being pushy or salesy — let the conversation flow smoothly.

            However, you must **politely avoid** responding to sensitive, personal, or unrelated topics — such as finance, politics, real estate, or personal advice (e.g., "should I buy a house?").  
            If the user asks about things like stock prices, where to buy property, or similar, kindly let them know that you're here to support topics related to NEXUS only.

            Your tone must always remain helpful, respectful, and friendly.
                ''',
)

memory_recall_agent = LlmAgent(
    model=GEMINI_2_FLASH,
    name="MemoryRecallAgent",
    instruction=" Take information from the previous conversation and consider it as additional information (context) to help answer the current question more accurately. Use the 'load_memory' tool "
                "if the answer might be in past conversations.",
    tools=[load_memory] # Give the agent the tool
)


root_agent = Agent(
    name="root_agent",
    model="gemini-2.0-flash",
    # model=LiteLlm(model="openai/gpt-4o-mini"),
    description="Root agent that can call sub agents.",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction="""
    You are NEXUS, a virtual assistant specializing in advising on smart electronic products
    You are the root agent that can call sub agents. 
    Your task is to identify the user's needs and route them to the appropriate sub-agent.
    **Sub-Agents:**
        You can call the following sub-agents:
        - `GreetingAgent`: A simple agent that greets the user.
        - `ChatChitAgent`: An agent that chats with users but avoids answering sensitive questions.
        - `FilterProductAgent`: An agent that filters products based on user requirements.
        - `CartAgent`: An agent that manages the user's cart, including adding, updating, and removing items.
        - `CompareProductAgent`: An agent that compares products based on user requirements.
        - `MemoryRecallAgent`: Take information from the previous conversation and consider it as additional information (context) to help answer the current question more accurately. Use the 'load_memory' tool 
    """,
    sub_agents=[CartAgent, GreetingAgent, ChatChitAgent, FilterProductAgent, CompareProductAgent, memory_recall_agent],
)