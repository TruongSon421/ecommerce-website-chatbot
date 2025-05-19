

from google.adk.tools.agent_tool import AgentTool
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents import LlmAgent
from google.genai import types
from subagent_tools.FindProduct import (
    find_color_by_product_id,
    find_variant_by_group_id,
    find_product
)
from subagent_tools.CartTools import (
    access_cart_information, 
    add_item_to_cart,
    update_item_in_cart, 
    remove_item_from_cart,
    checkout_cart
)
from entities.cart import CheckoutRequest

GEMINI_2_FLASH = "gemini-2.0-flash"

AddItemsAgent = LlmAgent(
    #model=LiteLlm(model="openai/gpt-4o-mini"),
    model=GEMINI_2_FLASH,
    name="AddItemsAgent",
    description="Add Items Agent that can dentify product, color and variant for Cart Agent.",
    instruction="""
    You are NextUS, a smart assistant that helps users select electronic products for their cart.

    Your goal is to identify 3 key pieces of information from the user:
    - `product name` (e.g., "iPhone 16e")
    - `variant` (e.g., "128GB", "256GB", etc.)
    - `color` (e.g., "Đen", "Trắng", etc.)
    **Tools:**
    You have access to the following tools to assist you:
    - `find_product`: Determine productId and color in database from user's input
    """,
    tools=[find_product],
    output_key="add_items_request",
)

CheckoutAgent = LlmAgent(
    model=GEMINI_2_FLASH,
    name="CheckoutAgent",
    description="A Checkout Agent that can checkout the user's cart.",
    instruction="""
    You are NEXUS, a virtual assistant specializing in advising on smart electronic products. 
    Your goal is to help the user checkout their cart.
    The user will provide shipping address, payment method and selected items they want to buy. 
    If selected items is [], you should ask the user to select items or check your cart to confirm you want to checkout all items in cart.**
    Always use conversation context/state or tools to get information. Prefer tools over your own internal knowledge.
    **Tools:**
    You have access to the following tools to assist you:
    - `checkout_cart(shipping_address: str, payment_method: str, selected_items: List[dict] = [])`: Checkout the user's cart.
    """,
    tools=[checkout_cart],
)


CartAgent = LlmAgent(
    # model=LiteLlm(model="openai/gpt-4o-mini"),
    model=GEMINI_2_FLASH,
    name="CartAgent",
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
    **Sub-Agents:**
    You can call sub-agents to help you with specific tasks. The sub-agents are:
    - `AddItemsAgent`: Determine productId from product name and color from user input.
    - `CheckoutAgent`: Checkout the user's cart.
    """,
    tools=[access_cart_information, add_item_to_cart, update_item_in_cart, remove_item_from_cart],
    sub_agents=[AddItemsAgent, CheckoutAgent],
)

