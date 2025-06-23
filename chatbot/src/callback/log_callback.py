from google.adk.agents.callback_context import CallbackContext
from google.adk.tools.base_tool import BaseTool
from google.adk.models import LlmResponse, LlmRequest
from typing import Dict, Any, Optional
from google.adk.tools.tool_context import ToolContext
from google.genai.types import Content, Part
from google.genai import types
import json
import re
import copy

def log_after_tool_execution(
    tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext, tool_response: Dict
) -> Optional[Dict]:
    """
    Callback được gọi sau khi một tool thực thi thành công.
    Log lại tên agent, tên tool, tham số đầu vào và kết quả tool trả về.
    """
    agent_name = tool_context.agent_name
    tool_name = tool.name
    print("\n" + "="*20 + " AFTER TOOL EXECUTION (CALLBACK) " + "="*20)
    print(f"[Callback] Agent Name: '{agent_name}'")
    print(f"[Callback] Tool Executed: '{tool_name}'")
    try:
        print(f"[Callback] Arguments (Input) Passed to Tool:\n{json.dumps(args, indent=2, ensure_ascii=False)}")
        print(f"[Callback] Original Tool Response (Output):\n{json.dumps(tool_response, indent=2, ensure_ascii=False)}")
    except TypeError:
        print(f"[Callback] Arguments (Input) Passed to Tool: {args}")
        print(f"[Callback] Original Tool Response (Output): {tool_response}")
    print("="* (40 + len(" AFTER TOOL EXECUTION (CALLBACK) ")) + "\n")
    return None

def log_before_agent_entry(callback_context: CallbackContext) -> Optional[Content]:
    """Logs khi một agent chuẩn bị bắt đầu thực thi."""
    agent_name = callback_context.agent_name
    invocation_id = callback_context.invocation_id
    # current_state = callback_context.state.to_dict() # Bỏ comment nếu muốn xem state
    if agent_name == 'order':
        if 'access_token' not in callback_context.state:
            print(f"[Callback] No access_token found: Asking user to log in before running agent {agent_name}.")
            return Content(
                parts=[Part(text="Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.")],
                role="model"
            )
        else: 
            print(f"[Callback] Access token found: Running agent {agent_name}.")
            return None
    print("\n" + "-"*20 + f" AGENT START: {agent_name} " + "-"*20)
    print(f"[Callback] Invocation ID: {invocation_id}")
    # print(f"[Callback] State entering: {json.dumps(current_state, indent=2)}") # Bỏ comment nếu muốn xem state
    print("-"*(40 + len(f" AGENT START: {agent_name} ")) + "\n")

    # Luôn trả về None để agent tiếp tục chạy bình thường
    return None

def product_before_tool_modifier(
    tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext
) -> Optional[Dict]:
    """Inspects and modifies tool args for product_consultation_tool, ensuring top_k is set."""
    tool_name = tool.name
    agent_name = tool_context.agent_name
    print(f"[Before Tool Callback] Tool '{tool_name}' in agent '{agent_name}'")
    print(f"[Before Tool Callback] Original args: {args}")

    if tool_name == 'product_consultation_tool':
        # Kiểm tra xem top_k có trong args không
        if 'top_k' not in args or args['top_k'] is None:
            print("[Before Tool Callback] top_k not provided. Setting default to 5.")
            args['top_k'] = 5
        elif not isinstance(args['top_k'], int) or args['top_k'] <= 0:
            print("[Before Tool Callback] top_k is invalid. Setting to 5.")
            args['top_k'] = 5

        print(f"[Before Tool Callback] Modified args: {args}")
        return None  # Tiếp tục gọi tool với args đã sửa

    print("[Before Tool Callback] No modifications needed for other tools.")
    return None

