from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse, LlmRequest
from typing import Optional
from google.genai import types
import json
import re

def cart_before_llm_callback(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmResponse]:
    """
    Callback to handle missing productId in add_item_to_cart function calls.
    Adds instructions and few-shot examples to help the LLM understand how to obtain productId.
    """
    agent_name = callback_context.agent_name
    print(f"[Cart Callback] Before model call for agent: {agent_name}")
    
    # Get the last user message
    last_user_message = ""
    if llm_request.contents and llm_request.contents[-1].role == 'user':
        if llm_request.contents[-1].parts:
            last_user_message = llm_request.contents[-1].parts[0].text
    
    print(f"[Cart Callback] User message: '{last_user_message}'")
    
    # Check if user is trying to add item to cart without productId
    is_cart_related = any(keyword in last_user_message.lower() for keyword in [
        'thêm vào giỏ hàng', 'thêm vào giỏ', 'thêm vào', 'giỏ hàng', 'giỏ', 'thêm'
    ])
    
    # Check if the message contains product names but no explicit productId
    has_product_name = any(keyword in last_user_message.lower() for keyword in [
        'shirt', 'dress', 'pants', 'shoes', 'jacket', 'product', 'item'
    ])
    
    # Check if productId is explicitly mentioned
    has_product_id = re.search(r'(product.?id|id):\s*\d+', last_user_message.lower())
    
    if is_cart_related and has_product_name and not has_product_id:
        print("[Cart Callback] Detected cart operation with product name but missing productId")
        
        # Get current system instruction
        original_instruction = llm_request.config.system_instruction or types.Content(
            role="system", parts=[]
        )
        
        # Ensure system_instruction is Content and parts list exists
        if not isinstance(original_instruction, types.Content):
            original_instruction = types.Content(
                role="system", 
                parts=[types.Part(text=str(original_instruction))]
            )
        
        if not original_instruction.parts:
            original_instruction.parts.append(types.Part(text=""))
        
        # Add enhanced instructions for cart operations
        cart_instructions = """

IMPORTANT CART OPERATION INSTRUCTIONS:
When a user wants to add items to their cart, you MUST first search for the product to get its productId before calling add_item_to_cart.

REQUIRED WORKFLOW:
1. First, use search_products to find the product by name/description
2. Extract the productId from the search results
3. Then call add_item_to_cart with the correct productId

EXAMPLES:

User: "Add a blue shirt to my cart"
Assistant: I'll help you add a blue shirt to your cart. Let me first search for blue shirts to find the right product.

[Call search_products with query="blue shirt"]
[Get results with productId=123]
[Then call add_item_to_cart with productId=123, quantity=1]

User: "I want to buy running shoes"
Assistant: I'll help you find and add running shoes to your cart. Let me search for available running shoes first.

[Call search_products with query="running shoes"]
[Get results with productId=456]
[Then call add_item_to_cart with productId=456, quantity=1]

User: "Add 2 red dresses to cart"
Assistant: I'll help you add red dresses to your cart. First, let me search for red dresses to find the available options.

[Call search_products with query="red dress"]
[Get results with productId=789]
[Then call add_item_to_cart with productId=789, quantity=2]

NEVER call add_item_to_cart without a valid productId. Always search first!
"""
        
        # Combine original instruction with cart instructions
        original_text = original_instruction.parts[0].text or ""
        modified_text = original_text + cart_instructions
        original_instruction.parts[0].text = modified_text
        
        llm_request.config.system_instruction = original_instruction
        print("[Cart Callback] Added cart operation instructions and examples")
    
    # Continue with normal LLM call
    return None
