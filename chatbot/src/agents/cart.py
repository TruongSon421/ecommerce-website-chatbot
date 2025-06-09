

from google.adk.tools.agent_tool import AgentTool
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents import LlmAgent
from google.genai import types
from tools.cart_tools import find_product, access_cart_information, add_item_to_cart, update_item_in_cart, remove_item_from_cart
from models.cart import CheckoutRequest

GEMINI_2_FLASH = "gemini-2.0-flash"


cart_agent = LlmAgent(
    model=GEMINI_2_FLASH,
    name="Cart",
    description="A Cart Agent that can add items to a cart, update items to a cart, remove items to a cart and retrieve cart information.",
    instruction="""
    You are NEXUS, a virtual assistant specializing in advising on smart electronic products. 
    Your main goal is to provide excellent customer service, helping users with their inquiries and guiding them through the process of adding, updating, or removing items from their cart.
    You can also retrieve cart information to assist users in managing their shopping experience.
    Always use conversation context/state or tools to get information. Prefer tools over your own internal knowledge.
    **Tools:**
    You have access to the following tools to assist you:
    - `access_cart_information`: Retrieve cart information for the user. Use this to get the current state of the user's cart.
    - `add_item_to_cart`: Add an item to the user's cart. Use this to help the user add a new item to their cart. Get productId and color at `add_items_request`.
    - `update_item_in_cart`: Update the quantity of an item in the user's cart. Use this to help the user change the quantity of an existing item.
    - `remove_item_from_cart`: Remove an item from the user's cart. Use this to help the user delete an item from their cart. 
    """,
    tools=[access_cart_information, add_item_to_cart, update_item_in_cart, remove_item_from_cart],
)
