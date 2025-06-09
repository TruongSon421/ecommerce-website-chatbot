# agents/coordinator.py
from google.adk.agents import LlmAgent
from agents.chatchit import chatchit_agent
from agents.shop import shop_agent
from agents.products import product_agent
from agents.cart import cart_agent

coordinator = LlmAgent(
    name="HelpDeskCoordinator",
    model="gemini-2.0-flash",  # Adjust model if needed, e.g., "gemini-1.5-flash-latest"
    instruction="""
    Route user requests to the appropriate agent based on their intent:
    - **ChatChit agent**: Handle casual greetings, general conversation, unrelated topics, or sensitive inquiries that do not involve shop, product, or cart operations.
    - **Shop agent**: Provide general information about the shop, such as store policies, hours, or services, but not specific product details or cart operations.
    - **Product agent**: Assist with product-related requests, including providing product information, product comparison, and helping customers find suitable products to purchase based on their needs and budget.
    - **Cart agent**: Manage all cart-related operations, including retrieving the user's cart, adding products to the cart, updating cart items, removing items from the cart, or handling checkout processes.
    Ensure accurate routing by identifying the user's intent. For example, requests like "add a product to my cart" should go to the Cart agent, while "recommend a good gaming laptop" should go to the Product agent.
    """,
    description="Main help desk router for directing user requests to the appropriate agent.",
    sub_agents=[chatchit_agent, shop_agent, product_agent, cart_agent]
)