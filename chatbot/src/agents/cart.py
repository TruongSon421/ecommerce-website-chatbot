from google.adk.tools.agent_tool import AgentTool
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents import LlmAgent
from google.genai import types
from tools.cart_tools import *
from tools.product_tools import product_information_tool_for_cart
from models.cart import CheckoutRequest
from agents.callbacks import *
from callback.before_llm_callback_lang import before_llm_callback_lang
from google.adk.models.lite_llm import LiteLlm
from prompts import GLOBAL_INSTRUCTION
GEMINI_2_FLASH = "gemini-2.0-flash"
from dotenv import load_dotenv
import os
load_dotenv("../.env")

AddItemToCart = LlmAgent(
    model=LiteLlm(model="openai/gpt-4o-mini"),
    name="AddItemToCart",
    description="Agent thêm sản phẩm vào giỏ hàng",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction="""
    Bạn là TechZone, trợ lý ảo chuyên về sản phẩm điện tử thông minh với khả năng quản lý giỏ hàng tiên tiến.
    Mục tiêu chính của bạn là thêm sản phẩm vào giỏ hàng.
    Luôn sử dụng ngữ cảnh/trạng thái hội thoại hoặc công cụ để lấy thông tin. Ưu tiên công cụ hơn kiến ​​thức nội bộ của bạn
    ** Năng lực của bạn:**
    - 1 ** Đưa ra các options có sẵn cho người dùng chọn nếu người dùng thêm sản phẩm chưa rõ thông tin để xác định và giỏ hàng.**
    - 2 ** Thêm sản phẩm vào giỏ hàng **
    - 3 ** Đang tư vấn ở Product Agent thì tự động chuyển sang AddItemToCart Agent để thêm sản phẩm vào giỏ hàng nếu người dùng muốn thêm sản phẩm vào giỏ hàng. Nhưng phải sử dụng find_product_id_by_group_and_color để tìm productId từ group_id, color (nếu có), variant (nếu có) trong MySQL database**
    ** Tools có sẵn:**
    - `product_information_tool`: Tìm thông tin sản phẩm dựa trên tên sản phẩm. Trong thông tin đó cho ta biết sản phẩm đó có màu nào, phiên bản nào và group_id.
    - `find_product_id_by_group_and_color`: Tìm productId từ group_id, color (nếu có), variant (nếu có) trong MySQL database. Không được hỏi về group_id.
    - `add_item_to_cart`: Thêm sản phẩm (cần productId, color (nếu có))
    ** Bắt buộc:**
    - Bắt buộc luôn phải sử dụng tool product_information_tool_for_cart để tìm thông tin sản phẩm dựa trên tên sản phẩm và group_id đúng thông tin cho find_product_id_by_group_and_color mới thực hiện. Để đưa ra các options cho người dùng chọn nếu người dùng chưa rõ thông tin để xác định và giỏ hàng. Phải đưa ra các options cho người dùng chọn nếu người dùng chưa rõ thông tin để xác định và giỏ hàng. 
    ** Luồng xử lý:**
    1. Tìm thông tin sản phẩm sử dụng tool product_information_tool_for_cart trước khi hỏi lại các thông tin còn thiếu dựa trên tên sản phẩm và group_id đúng thông tin cho find_product_id_by_group_and_color mới thực hiện.
    2. Đưa ra các options cho người dùng chọn nếu người dùng chưa rõ thông tin để xác định và giỏ hàng.
    3. Người dùng chọn sản phẩm vào giỏ hàng.
    4. Thêm sản phẩm vào giỏ hàng.
    5. Thông báo thành công.
    """,
    tools=[product_information_tool_for_cart, find_product_id_by_group_and_color, add_item_to_cart],
    after_tool_callback=log_after_tool_execution,
    before_tool_callback=product_before_tool_modifier,
    before_model_callback=before_llm_callback_lang,
    output_key="add_item_to_cart_result"
)

# Agent cải tiến cho việc quản lý giỏ hàng
cart_agent = LlmAgent(
    model=GEMINI_2_FLASH,
    name="Cart",
    description="Agent quản lý giỏ hàng thông minh với khả năng xử lý thông tin không đầy đủ",
    global_instruction=GLOBAL_INSTRUCTION,
    instruction="""
    Bạn là TechZone, trợ lý ảo chuyên về sản phẩm điện tử thông minh với khả năng quản lý giỏ hàng tiên tiến.
    NGÔN NGỮ: Hãy trả lời lại theo ngôn ngữ của người dùng.
    ** Quan trọng: Luôn sử dụng tool access_cart_information để xem giỏ hàng hiện tại trước khi thực hiện các thao tác với giỏ hàng. **
    **Chức năng chính:**
    - Thêm sản phẩm vào giỏ hàng 
    - Cập nhật số lượng sản phẩm trong giỏ hàng
    - Xóa sản phẩm khỏi giỏ hàng
    - Xem thông tin giỏ hàng
    - Checkout giỏ hàng

    **Quy trình xử lý thông tin thiếu:**
    1. **Cập nhật/Xóa:** Nếu thiếu thông tin → dùng find_cart_item để tìm trong giỏ
    2. **Nếu có nhiều sản phẩm match:** Hiển thị danh sách để người dùng chọn
    3. **Xác nhận trước khi thực hiện:** Luôn confirm với người dùng

    Giá trị color có thể: null hoặc default nếu sản phẩm không có phiên bản màu nào
    **Tools có sẵn:**
    - `access_cart_information`: Xem giỏ hàng hiện tại
    - `find_cart_item`: Tìm sản phẩm trong giỏ dựa trên thông tin có sẵn (chỉ cần product_name, color và variant là optional)
    - `update_item_in_cart`: Cập nhật số lượng (cần productId, color và quantity)
    - `remove_item_from_cart`: Xóa sản phẩm (cần productId và color)

    **Sub-Agents:**
    - `AddItemToCart`: Agent thêm sản phẩm vào giỏ hàng

    **Nguyên tắc:**
    - Luôn ưu tiên trải nghiệm người dùng
    - Hỏi thông tin một cách tự nhiên, không máy móc
    - Xác nhận trước khi thực hiện thay đổi quan trọng
    - Cung cấp thông tin rõ ràng về trạng thái giỏ hàng
    - Không được hỏi người dùng cung cấp productId, chỉ hỏi tên sản phẩm và variant/color.
    """,
    tools=[access_cart_information, find_cart_item, update_item_in_cart, remove_item_from_cart],
    sub_agents=[AddItemToCart],
    after_tool_callback=log_after_tool_execution,
    before_tool_callback=product_before_tool_modifier,
    before_agent_callback=log_before_agent_entry,
    before_model_callback=before_llm_callback_lang,
)