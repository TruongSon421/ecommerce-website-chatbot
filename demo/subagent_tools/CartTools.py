import logging
from typing import Optional, List, Dict
import requests
from google.adk.tools import ToolContext
from entities.cart import CheckoutRequest, PaymentMethod, CartIdentity
logger = logging.getLogger(__name__)
from .AuthTools import auth_config
def access_cart_information(tool_context: ToolContext) -> dict:
    """
    Truy cập thông tin giỏ hàng của khách hàng dựa trên token xác thực.

    Args:
        token (str): Mã token xác thực của khách hàng.

    Returns:
        dict: Một dictionary chứa thông tin giỏ hàng hiện tại của khách hàng.

    Example:
        >>> access_cart_information(token='your_token')
        {'items': [{'product_id': 'soil-123', 'name': 'Standard Potting Soil', 'quantity': 1}, {'product_id': 'fert-456', 'name': 'General Purpose Fertilizer', 'quantity': 1}], 'subtotal': 25.98}
    """
    print('>'*50)
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    guest_id = tool_context.state.get("guest_id", None)
    if accessToken:
        url = "http://localhost:8070/api/carts"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }

        logger.info("Accessing cart information using token.")
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error accessing cart: %s", e)
            return {}
    elif guest_id:
        url = f"http://localhost:8070/api/guest-carts/{guest_id}"
        headers = {
            "Content-Type": "application/json"
        }
        logger.info("Accessing cart information guest user.")
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error accessing cart guest user: %s", e)
            return {}
    else:
        return {}
        

def add_item_to_cart(product_id: str, color: str, quantity: int, tool_context: ToolContext) -> dict:
    """
    Thêm một sản phẩm vào giỏ hàng của khách hàng.

    Args:
        token (str): Mã token xác thực của khách hàng.
        product_id (str): Mã sản phẩm cần thêm vào giỏ hàng.
        color (str): Màu sắc của sản phẩm.
        quantity (int): Số lượng sản phẩm cần thêm.

    Returns:
        dict: Một dictionary chứa thông tin giỏ hàng sau khi thêm sản phẩm.
    """
    print('>'*50)
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    guest_id = tool_context.state.get("guest_id", None)
    if accessToken:
        url = "http://localhost:8070/api/carts/items"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }

        logger.info("Adding item to cart using token.")

        product_body = {
            "productId": product_id,
            "quantity": quantity,
            "color": color
        }

        try:
            response = requests.post(url, headers=headers, json=product_body)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error adding item to cart: %s", e)
            return {}
    elif guest_id:
        url = f"http://localhost:8070/api/guest-carts/{guest_id}/items"
        headers = {
            "Content-Type": "application/json"
        }
        body = {
            "productId": product_id,
            "quantity": quantity,
            "color": color
        }
        logger.info("Add items to cart information guest user.")
        try:
            response = requests.post(url, headers=headers, json=body)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error add items to cart guest user: %s", e)
            return {}
    else:
        return {}
    
def update_item_in_cart(product_id: str, quantity: int, color:int, tool_context: ToolContext) -> dict:
    """
    Cập nhật số lượng hoặc thuộc tính của một sản phẩm trong giỏ hàng.

    Args:
        token (str): Mã token xác thực của khách hàng.
        product_id (str): Mã sản phẩm cần cập nhật.
        quantity (int): Số lượng mới của sản phẩm.
        color (int): Màu sắc mới của sản phẩm.

    Returns:
        dict: Một dictionary chứa thông tin giỏ hàng sau khi cập nhật.

    Example:
        >>> update_item_in_cart(token='your_token', product_id='soil-123', quantity=2, color=1)
        {'items': [{'product_id': 'soil-123', 'name': 'Standard Potting Soil', 'quantity': 2}], 'subtotal': 51.96}
    """
    print('>'*50)
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    guest_id = tool_context.state.get("guest_id", None)
    if accessToken:
        url = f"http://localhost:8070/api/carts/items/{product_id}"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }
        params = {
            "quantity": quantity,
            "color": color
        }

        logger.info("Update item in cart using token.")
        try:
            response = requests.put(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Không thể cập nhật item trong giỏ hàng: %s", e)
            return {"error": str(e)}
    elif guest_id:
        url = f"http://localhost:8070/api/guest-carts/{guest_id}/items/{product_id}"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "quantity": quantity,
            "color": color
        }
        logger.info("Update item in cart information guest user.")
        try:
            response = requests.put(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error update item in cart guest user: %s", e)
            return {}
    else:
        return {}
        
    
def remove_item_from_cart(product_id: str, color: str, tool_context: ToolContext) -> dict:
    """
    Xóa một sản phẩm khỏi giỏ hàng của khách hàng.

    Args:
        token (str): Mã token xác thực của khách hàng.
        product_id (str): Mã sản phẩm cần xóa khỏi giỏ hàng.
        color (str): Màu sắc của sản phẩm cần xóa.

    Returns:
        dict: Một dictionary chứa thông tin giỏ hàng sau khi xóa sản phẩm.

    Example:
        >>> remove_item_from_cart(token='your_token', product_id='soil-123', color='red')
        {'items': [], 'subtotal': 0.00}
    """
    print('>'*50)
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    guest_id = tool_context.state.get("guest_id", None)
    if accessToken:
        url = f"http://localhost:8070/api/carts/items/{product_id}"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }
    
        params = {
            "color": color
        }

        logger.info("Removing item %s from cart", product_id)

        try:
            response = requests.delete(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error removing item from cart: %s", e)
            return {}
    elif guest_id:
        url = f"http://localhost:8070/api/guest-carts/{guest_id}/items/{product_id}"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "color": color
        }
        logger.info("Removing item %s from cart information guest user.", product_id)
        try:
            response = requests.delete(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error removing item from cart guest user: %s", e)
            return {}
    else:
        return {}
    
def checkout_cart(shipping_address: str, payment_method: str, tool_context: ToolContext, selected_items: List[dict] = []) -> dict:
    """
    Kiểm tra giỏ hàng và tạo đơn hàng.

    Args:
        tool_context (ToolContext): Automatically provided by Agent Development Kit.
        shipping_address (str, optional): Địa chỉ giao hàng.
        payment_method (str, optional): Phương thức thanh toán (CREDIT_CARD, DEBIT_CARD, QR_CODE, TRANSFER_BANKING).
        selected_items (List[dict], optional): Danh sách sản phẩm muốn thanh toán (mỗi item là dict với productId và color).
          Nếu là danh sách rỗng, tất cả sản phẩm trong giỏ hàng sẽ được thanh toán.

    Returns:
        dict: Một dictionary chứa thông tin đơn hàng.

    Example:
        >>> checkout_cart(tool_context=context, shipping_address='123 Main St, Anytown, USA', payment_method='CREDIT_CARD', selected_items=[{'productId': '123', 'color': 'red'}])
        >>> checkout_cart(tool_context=context, shipping_address='123 Main St', payment_method='CREDIT_CARD') # Thanh toán tất cả sản phẩm
    """
    
    # Convert string parameters to appropriate types
    
    access_token = tool_context.state.get("access_token")
    print('access_token...', access_token)
    if access_token:
        logger.info("Found cached access token")
        try:
            userId = tool_context.state.get("user_id")
            payment_method_enum = PaymentMethod(payment_method)
            
            # Handle selected_items if provided
            cart_identities = []
            if selected_items:
                cart_identities = [CartIdentity(productId=item.get('productId'), color=item.get('color')) 
                                for item in selected_items]
            
            # Create CheckoutRequest object
            checkout_request = CheckoutRequest(
                userId=userId,
                shipping_address=shipping_address,
                payment_method=payment_method_enum,
                selected_items=cart_identities
            )
        except ValueError as e:
            return {
                "success": False,
                "error": f"Invalid parameter: {str(e)}",
                "type": "validation_error"
            }
        return _call_checkout_api(access_token, checkout_request)

    # Bước 2: Kiểm tra phản hồi xác thực từ client
    auth_response = None
    try:
        # Kiểm tra auth_config có tồn tại không
        if auth_config is None:
            logger.error("auth_config is None, cannot proceed with authentication")
            # Không return ở đây, tiếp tục thực hiện request_credential
        else:
            print('auth_config type:', type(auth_config))
            auth_response = tool_context.get_auth_response(auth_config)
            print('auth_response...', auth_response)
    except Exception as e:
        # Log lỗi nhưng không return, tiếp tục xử lý để yêu cầu xác thực
        logger.error(f"Error getting auth response: {e}")
        # Không return ở đây
        
    if auth_response:
        logger.info("Received new auth credentials from client")
        # Bước 5: Lưu token mới vào cache
        new_token = auth_response.http.credentials.token  # Giả sử token nằm trong trường access_token
        tool_context.state["access_token"] = new_token
        try:
            userId = tool_context.state.get("user_id")
            payment_method_enum = PaymentMethod(payment_method)
            
            # Handle selected_items if provided
            cart_identities = []
            if selected_items:
                cart_identities = [CartIdentity(productId=item.get('productId'), color=item.get('color')) 
                                for item in selected_items]
            
            # Create CheckoutRequest object
            checkout_request = CheckoutRequest(
                userId=userId,
                shipping_address=shipping_address,
                payment_method=payment_method_enum,
                selected_items=cart_identities
            )
        except ValueError as e:
            return {
                "success": False,
                "error": f"Invalid parameter: {str(e)}",
                "type": "validation_error"
            }
        return _call_checkout_api(new_token, checkout_request)

    # Bước 3: Yêu cầu xác thực nếu không có token hợp lệ hoặc auth_response là None
    logger.info("No valid credentials found, initiating auth flow")
    try:
        if auth_config is None:
            logger.error("auth_config is None, cannot request credential")
            return {
                "success": False,
                "error": "Authentication configuration is missing",
                "type": "auth_error"
            }
        
        print("Requesting credentials with auth_config:", auth_config)    
        tool_context.request_credential(auth_config)
        print("--> Authentication required by agent.")
        return {
            'pending': True,
            'message': 'Authentication required for checkout',
            'auth_config': auth_config  # Giúp client nhận diện loại xác thực
        }
    except Exception as e:
        logger.error(f"Error requesting credential: {e}")
        return {
            "success": False,
            "error": f"Authentication request failed: {str(e)}",
            "type": "auth_error"
        }
    
def _call_checkout_api(access_token: str, checkout_request: CheckoutRequest) -> dict:
    """Hàm helper để gọi API checkout với token đã xác thực."""
    url = "http://localhost:8070/api/carts/checkout"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    checkout_body = {
        "checkoutRequest": {
            "userId": checkout_request.userId,
            "shippingAddress": checkout_request.shipping_address,
            "paymentMethod": checkout_request.payment_method
        },
        "selectedItems": [item.model_dump() for item in checkout_request.selected_items]
    }
    logger.info(f"Checkout body to send: {checkout_body}")

    try:
        logger.info("Calling checkout API")
        response = requests.post(url, headers=headers, json=checkout_body, timeout=10)
        response.raise_for_status()
        
        return {
            "success": True,
            "transactionId": response.json().get("transactionId")
        }
            
    except requests.RequestException as e:
        logger.error("Request failed: %s", e)
        return {
            "success": False,
            "error": str(e),
            "type": "connection_error"
        }

