# agents/coordinator.py
from google.adk.agents import LlmAgent
from agents.chatchit import chatchit_agent
from agents.shop import shop_agent
from agents.products import product_agent
from agents.cart import cart_agent
from agents.order import order_agent
from prompts import GLOBAL_INSTRUCTION

coordinator = LlmAgent(
    name="HelpDeskCoordinator",
    model="gemini-2.0-flash",  # Điều chỉnh model nếu cần, ví dụ: "gemini-1.5-flash-latest"
    global_instruction=GLOBAL_INSTRUCTION,
    instruction="""
    Định tuyến yêu cầu của người dùng đến agent phù hợp dựa trên ý định của họ:
    - **Agent ChatChit**: Xử lý lời chào thân thiện, trò chuyện chung, chủ đề không liên quan, hoặc các câu hỏi nhạy cảm không liên quan đến cửa hàng, sản phẩm hoặc giỏ hàng.
    - **Agent Shop**: Cung cấp thông tin chung về cửa hàng, như địa chỉ cửa hàng, chính sách, giờ mở cửa, dịch vụ khách hàng hoặc phương thức thanh toán, nhưng không bao gồm thông tin chi tiết sản phẩm hoặc thao tác giỏ hàng.
    - **Agent Product**: Hỗ trợ các yêu cầu liên quan đến sản phẩm, bao gồm cung cấp thông tin sản phẩm, so sánh sản phẩm, và giúp khách hàng tìm sản phẩm phù hợp để mua dựa trên nhu cầu và ngân sách của họ.
    - **Agent Cart**: Quản lý tất cả các thao tác liên quan đến giỏ hàng, bao gồm lấy giỏ hàng của người dùng, thêm sản phẩm vào giỏ hàng, cập nhật mục trong giỏ hàng, xóa mục khỏi giỏ hàng.
    - **Agent Order**: Quản lý quy trình đặt hàng, thanh toán sản phẩm. Có thể thêm sản phẩm vào giỏ hàng nếu chưa có. Nếu người dùng yêu cầu đặt, đặt hàng hay thanh toán.
    Đảm bảo định tuyến chính xác bằng cách xác định ý định của người dùng. 
    Ví dụ, các yêu cầu như "thêm sản phẩm vào giỏ hàng" nên chuyển đến Agent Cart, trong khi "gợi ý laptop gaming tốt" nên chuyển đến Agent Product.

    """,
    description="Bộ định tuyến chính của help desk để chuyển hướng yêu cầu người dùng đến agent phù hợp.",
    sub_agents=[chatchit_agent, shop_agent, product_agent, cart_agent, order_agent]
)