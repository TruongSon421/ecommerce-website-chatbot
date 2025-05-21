from google.adk.agents import LlmAgent
from prompts import CHATCHIT_INSTRUCTION
from agents.callbacks import log_before_agent_entry
chatchit_agent = LlmAgent(
    name="ChatChit",
    description="Casual greeting, unrelated or sensitive topics.",
    instruction=CHATCHIT_INSTRUCTION,
    # Không có tool, không cần callback
    before_agent_callback = log_before_agent_entry
)
