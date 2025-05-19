# agents/coordinator.py
from google.adk.agents import LlmAgent
from agents.chatchit import chatchit_agent
from agents.shop import shop_agent
from agents.products import product_agent

coordinator = LlmAgent(
    name="HelpDeskCoordinator",
    model="gemini-2.0-flash", # Sửa lại model nếu cần, ví dụ: "gemini-1.5-flash-latest"
    instruction="Route user requests: ChatChit agent for casual greeting, unrelated or sensitive topics; Shop agent for general shop information and Product agent for request about products.",
    description="Main help desk router.",
    sub_agents=[chatchit_agent, shop_agent, product_agent]
)