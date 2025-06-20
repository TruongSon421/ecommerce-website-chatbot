import json
import logging
from typing import List, Dict, Optional
from google.adk.tools import ToolContext

logger = logging.getLogger(__name__)


def enforce_cart_requirement(
    tool_context: ToolContext,
    requested_products: str,
    cart_items: str
) -> dict:
    """
    Kiểm tra bắt buộc: Tất cả sản phẩm muốn đặt hàng phải có trong giỏ hàng
    
    Args:
        requested_products: JSON string danh sách sản phẩm người dùng muốn đặt hàng
        cart_items: JSON string danh sách sản phẩm hiện có trong giỏ hàng
    
    Returns:
        Dict chứa kết quả kiểm tra và hướng dẫn tiếp theo
    """
    try:
        # Parse JSON strings to lists with error handling
        if isinstance(requested_products, str):
            try:
                requested_products_list = json.loads(requested_products)
            except json.JSONDecodeError as e:
                return {
                    "status": "error",
                    "message": f"Lỗi parse requested_products JSON: {str(e)}"
                }
        else:
            requested_products_list = requested_products
            
        if isinstance(cart_items, str):
            try:
                cart_items_list = json.loads(cart_items)
            except json.JSONDecodeError as e:
                return {
                    "status": "error",
                    "message": f"Lỗi parse cart_items JSON: {str(e)}"
                }
        else:
            cart_items_list = cart_items
        
        if not requested_products_list:
            return {
                "status": "error",
                "message": "Không có sản phẩm nào được yêu cầu đặt hàng"
            }
        
        cart_product_keys = set()
        for item in cart_items_list:
            product_key = f"{item.get('productId')}-{item.get('color', '')}"
            cart_product_keys.add(product_key)
            cart_product_keys.add(item.get('productId'))  # Cũng thêm chỉ productId
        
        products_in_cart = []
        products_missing = []
        
        for product in requested_products_list:
            product_id = product.get('productId')
            color = product.get('color', '')
            product_key = f"{product_id}-{color}" if color else product_id
            
            # Kiểm tra xem sản phẩm có trong giỏ hàng không
            if (product_id in cart_product_keys or 
                product_key in cart_product_keys or
                any(item.get('productId') == product_id and 
                    (not color or item.get('color') == color) for item in cart_items_list)):
                products_in_cart.append(product)
            else:
                products_missing.append(product)
        
        if products_missing:
            return {
                "status": "missing_products",
                "products_in_cart": products_in_cart,
                "products_missing": products_missing,
                "message": f"❌ KHÔNG THỂ ĐẶT HÀNG: {len(products_missing)} sản phẩm chưa có trong giỏ hàng",
                "action_required": "Phải thêm các sản phẩm sau vào giỏ hàng trước khi đặt hàng:",
                "missing_details": [f"- {p.get('productName', 'Tên không xác định')} ({p.get('color', 'Màu không xác định')})" 
                                  for p in products_missing],
                "instruction": "Sử dụng SmartAddItemToOrder để thêm các sản phẩm này vào giỏ hàng trước khi đặt hàng"
            }
        
        return {
            "status": "success",
            "products_in_cart": products_in_cart,
            "products_missing": [],
            "message": f"TẤT CẢ SẢN PHẨM ĐÃ CÓ TRONG GIỎ HÀNG: {len(products_in_cart)} sản phẩm sẵn sàng đặt hàng",
            "can_proceed": True,
            "instruction": "Có thể tiến hành đặt hàng từ giỏ hàng"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi khi kiểm tra yêu cầu giỏ hàng: {str(e)}"
        }


def select_items_from_cart(
    tool_context: ToolContext,
    cart_items: str,
    selected_product_ids: str = "",
    select_all: bool = False
) -> dict:
    """
    Chọn sản phẩm từ giỏ hàng để đặt hàng
    
    Args:
        cart_items: JSON string danh sách sản phẩm trong giỏ hàng
        selected_product_ids: JSON string danh sách productId được chọn (có thể bao gồm color)
        select_all: Chọn tất cả sản phẩm trong giỏ hàng
    
    Returns:
        Dict chứa các sản phẩm đã chọn để đặt hàng
    """
    try:
        # Parse JSON strings to lists with better error handling
        if isinstance(cart_items, str):
            try:
                # Log for debugging
                logger.info(f"Parsing cart_items: length={len(cart_items)}, first 200 chars: {cart_items[:200]}")
                cart_items_list = json.loads(cart_items)
                logger.info(f"Successfully parsed {len(cart_items_list)} cart items")
            except json.JSONDecodeError as e:
                # Try to handle double-escaped JSON
                try:
                    logger.info("Trying to handle double-escaped JSON...")
                    unescaped = cart_items.replace('\\"', '"').replace('\\\\', '\\')
                    cart_items_list = json.loads(unescaped)
                    logger.info(f"Successfully parsed double-escaped JSON with {len(cart_items_list)} cart items")
                except Exception as e2:
                    logger.error(f"Both normal and double-escaped parsing failed: {str(e)}, {str(e2)}")
                    return {
                        "status": "error",
                        "message": f"Lỗi parse cart_items JSON tại vị trí {getattr(e, 'pos', 'unknown')}: {str(e)}. Dữ liệu gần vị trí lỗi: {cart_items[max(0, getattr(e, 'pos', 75)-50):getattr(e, 'pos', 75)+50] if hasattr(e, 'pos') else cart_items[:100]}"
                    }
        else:
            cart_items_list = cart_items
        
        # Parse selected_product_ids safely
        if selected_product_ids and isinstance(selected_product_ids, str):
            try:
                selected_product_ids_list = json.loads(selected_product_ids)
            except json.JSONDecodeError:
                # If not valid JSON, treat as a single ID or comma-separated string
                selected_product_ids_list = [id.strip() for id in selected_product_ids.split(',') if id.strip()]
        else:
            selected_product_ids_list = selected_product_ids if selected_product_ids else []
        
        if not cart_items_list:
            return {
                "status": "error",
                "message": "Giỏ hàng trống, không có sản phẩm để chọn"
            }
        
        selected_items = []
        
        if select_all:
            # Chọn tất cả sản phẩm trong giỏ hàng
            selected_items = cart_items_list.copy()
        elif selected_product_ids_list:
            # Chọn sản phẩm theo danh sách productId
            for cart_item in cart_items_list:
                item_key = f"{cart_item.get('productId')}-{cart_item.get('color', '')}"
                product_id = cart_item.get('productId')
                
                # Kiểm tra nếu productId hoặc productId-color được chọn
                if (product_id in selected_product_ids_list or 
                    item_key in selected_product_ids_list or
                    any(pid.startswith(product_id) for pid in selected_product_ids_list)):
                    selected_items.append(cart_item)
        else:
            return {
                "status": "error",
                "message": "Vui lòng chọn sản phẩm hoặc chọn tất cả"
            }
        
        if not selected_items:
            return {
                "status": "error",
                "message": "Không tìm thấy sản phẩm nào được chọn trong giỏ hàng"
            }
        
        # Tính tổng tiền cho các sản phẩm đã chọn
        total_amount = sum(item.get("price", 0) * item.get("quantity", 1) for item in selected_items)
        total_quantity = sum(item.get("quantity", 1) for item in selected_items)
        
        return {
            "status": "success",
            "selected_items": selected_items,
            "total_items": len(selected_items),
            "total_quantity": total_quantity,
            "total_amount": total_amount,
            "message": f"Đã chọn {len(selected_items)} sản phẩm để đặt hàng. Tổng tiền: {total_amount:,} ₫"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi khi chọn sản phẩm từ giỏ hàng: {str(e)}"
        }


def prepare_checkout_data(
    tool_context: ToolContext,
    selected_products: str,
    quantities: str = ""
) -> dict:
    """
    Chuẩn bị dữ liệu cho trang checkout với danh sách sản phẩm đã chọn
    
    Args:
        selected_products: JSON string danh sách sản phẩm với thông tin {productId, color, productName, price}
        quantities: JSON string danh sách số lượng tương ứng với mỗi sản phẩm (mặc định là 1)
    
    Returns:
        Dict chứa selectedItems và checkout_url để redirect
    """
    try:
        # Parse JSON strings with error handling
        if isinstance(selected_products, str):
            try:
                selected_products_list = json.loads(selected_products)
            except json.JSONDecodeError as e:
                return {
                    "status": "error",
                    "message": f"Lỗi parse selected_products JSON: {str(e)}"
                }
        else:
            selected_products_list = selected_products
            
        if quantities and isinstance(quantities, str):
            try:
                quantities_list = json.loads(quantities)
            except json.JSONDecodeError:
                quantities_list = []
        else:
            quantities_list = quantities if quantities else []
        
        if not selected_products_list:
            return {
                "status": "error",
                "message": "Không có sản phẩm nào được chọn"
            }
        
        # Nếu không có quantities, mặc định mỗi sản phẩm có số lượng 1
        if not quantities_list:
            quantities_list = [1] * len(selected_products_list)
        elif len(quantities_list) != len(selected_products_list):
            quantities_list = [1] * len(selected_products_list)
        
        # Tạo selectedItems với format phù hợp cho CheckoutPage
        selected_items = []
        for i, product in enumerate(selected_products_list):
            selected_items.append({
                "productId": product.get("productId"),
                "color": product.get("color", "Không xác định"),
                "productName": product.get("productName"),
                "price": product.get("price", 0),
                "quantity": quantities_list[i]
            })
        
        # Tính tổng tiền
        total_amount = sum(item["price"] * item["quantity"] for item in selected_items)
        
        return {
            "status": "success",
            "selectedItems": selected_items,
            "totalAmount": total_amount,
            "checkout_url": "/checkout",
            "message": f"Đã chuẩn bị {len(selected_items)} sản phẩm cho thanh toán. Tổng tiền: {total_amount:,} ₫",
            "redirect_instruction": "Chuyển hướng đến trang thanh toán với selectedItems trong location.state"
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Lỗi khi chuẩn bị dữ liệu checkout: {str(e)}"
        }


def create_direct_order_summary(
    tool_context: ToolContext,
    products_info: str,
    user_preferences: str = ""
) -> dict:
    """
    Tạo summary cho đơn hàng trực tiếp trước khi checkout
    
    Args:
        products_info: JSON string thông tin chi tiết các sản phẩm
        user_preferences: JSON string tuỳ chọn của người dùng (quantities, colors, variants)
    
    Returns:
        Dict chứa summary đơn hàng
    """
    try:
        # Parse JSON strings with error handling
        if isinstance(products_info, str):
            try:
                products_info_list = json.loads(products_info)
            except json.JSONDecodeError as e:
                return {
                    "status": "error",
                    "message": f"Lỗi parse products_info JSON: {str(e)}"
                }
        else:
            products_info_list = products_info
            
        if user_preferences and isinstance(user_preferences, str):
            try:
                user_preferences_dict = json.loads(user_preferences)
            except json.JSONDecodeError:
                user_preferences_dict = {}
        else:
            user_preferences_dict = user_preferences if user_preferences else {}
        
        if not products_info_list:
            return {
                "status": "error",
                "message": "Không có thông tin sản phẩm"
            }
        
        summary = {
            "status": "success",
            "order_summary": {
                "products": [],
                "total_items": 0,
                "total_amount": 0
            }
        }
        
        for i, product in enumerate(products_info_list):
            quantity = 1
            if user_preferences_dict and "quantities" in user_preferences_dict:
                quantity = user_preferences_dict["quantities"][i] if i < len(user_preferences_dict["quantities"]) else 1
            
            product_summary = {
                "name": product.get("productName"),
                "productId": product.get("productId"),
                "color": product.get("color", "Không xác định"),
                "price": product.get("price", 0),
                "quantity": quantity,
                "subtotal": product.get("price", 0) * quantity
            }
            
            summary["order_summary"]["products"].append(product_summary)
            summary["order_summary"]["total_items"] += quantity
            summary["order_summary"]["total_amount"] += product_summary["subtotal"]
        
        return summary
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi khi tạo summary đơn hàng: {str(e)}"
        }


def validate_order_data(
    tool_context: ToolContext,
    products: str
) -> dict:
    """
    Kiểm tra tính hợp lệ của dữ liệu đơn hàng trước khi checkout
    
    Args:
        products: JSON string danh sách sản phẩm cần kiểm tra
    
    Returns:
        Dict chứa kết quả validation
    """
    try:
        # Parse JSON string with error handling
        if isinstance(products, str):
            try:
                products_list = json.loads(products)
            except json.JSONDecodeError as e:
                return {
                    "status": "error",
                    "message": f"Lỗi parse products JSON: {str(e)}"
                }
        else:
            products_list = products
        
        if not products_list:
            return {
                "status": "error",
                "message": "Danh sách sản phẩm trống"
            }
        
        errors = []
        warnings = []
        
        for i, product in enumerate(products_list):
            # Kiểm tra các trường bắt buộc
            if not product.get("productId"):
                errors.append(f"Sản phẩm thứ {i+1}: Thiếu productId")
            
            if not product.get("productName"):
                errors.append(f"Sản phẩm thứ {i+1}: Thiếu tên sản phẩm")
            
            if not product.get("price") or product.get("price") <= 0:
                errors.append(f"Sản phẩm thứ {i+1}: Giá không hợp lệ")
            
            # Kiểm tra warnings
            if not product.get("color"):
                warnings.append(f"Sản phẩm thứ {i+1}: Chưa chọn màu sắc")
        
        if errors:
            return {
                "status": "error",
                "errors": errors,
                "warnings": warnings,
                "message": "Dữ liệu đơn hàng không hợp lệ"
            }
        
        return {
            "status": "success",
            "warnings": warnings,
            "message": "Dữ liệu đơn hàng hợp lệ",
            "validated_products": products_list
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi khi kiểm tra dữ liệu: {str(e)}"
        }


async def redirect_to_checkout(
    tool_context: ToolContext,
    selected_items: str,
    total_amount: int = 0
) -> dict:
    """
    Chuẩn bị dữ liệu để redirect đến trang checkout qua directCheckoutItems
    
    Args:
        selected_items: JSON string danh sách sản phẩm đã chọn
        total_amount: Tổng tiền đơn hàng
    
    Returns:
        Dict chứa action và selected_item_keys cho ChatbotWidget
    """
    try:
        # Parse selected_items with error handling
        if isinstance(selected_items, str):
            try:
                selected_items_list = json.loads(selected_items)
            except json.JSONDecodeError as e:
                return {
                    "status": "error",
                    "message": f"Lỗi parse selected_items JSON: {str(e)}"
                }
        else:
            selected_items_list = selected_items
        
        if not selected_items_list:
            return {
                "status": "error",
                "message": "Không có sản phẩm nào để redirect đến checkout"
            }
        
        # Tạo selected_item_keys cho directCheckoutItems (format: "productId-color")
        selected_item_keys = []
        for item in selected_items_list:
            product_id = item.get("productId", "")
            color = item.get("color", "")
            if product_id:
                key = f"{product_id}-{color}"
                selected_item_keys.append(key)
        
        # Tính tổng tiền nếu chưa có
        if total_amount == 0:
            total_amount = sum(item.get("price", 0) * item.get("quantity", 1) for item in selected_items_list)
        
        # Tạo thông tin chi tiết sản phẩm cho message
        product_details = []
        for item in selected_items_list:
            name = item.get("productName", "Sản phẩm")
            color = item.get("color", "")
            quantity = item.get("quantity", 1)
            price = item.get("price", 0)
            subtotal = price * quantity
            
            color_text = f" ({color})" if color and color != "Không xác định" else ""
            product_details.append(f"• {name}{color_text} - SL: {quantity} - {subtotal:,}₫")
        
        products_text = "\n".join(product_details)
        detailed_message = f"""🛒 THANH TOÁN ĐƠN HÀNG:

{products_text}

TỔNG TIỀN: {total_amount:,}₫

Đang chuyển hướng đến trang thanh toán..."""

        tool_context.actions.skip_summarization = True # Bỏ summary của tool
        return {
            "status": "success",
            "action": "checkout_redirect",
            "selected_item_keys": selected_item_keys,
            "selected_items": selected_items_list,
            "total_amount": total_amount,
            "message": detailed_message,
            "instruction": "ChatbotWidget sẽ setDirectCheckoutItems và navigate đến /checkout"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi khi chuẩn bị redirect đến checkout: {str(e)}"
        }


def select_items_from_cart_by_ids(
    tool_context: ToolContext,
    product_ids: str
) -> dict:
    """
    Chọn sản phẩm từ giỏ hàng chỉ bằng productIds, tránh JSON truncation
    Lấy cart từ session thay vì parameter để tránh giới hạn độ dài
    
    Args:
        product_ids: JSON string hoặc string comma-separated danh sách productId cần chọn
    
    Returns:
        Dict chứa các sản phẩm đã chọn từ giỏ hàng
    """
    try:
        # Parse product_ids safely  
        if isinstance(product_ids, str):
            try:
                # Try parsing as JSON first
                product_ids_list = json.loads(product_ids)
            except json.JSONDecodeError:
                # If not valid JSON, treat as comma-separated string
                product_ids_list = [id.strip() for id in product_ids.split(',') if id.strip()]
        else:
            product_ids_list = product_ids if product_ids else []
        
        if not product_ids_list:
            return {
                "status": "error",
                "message": "Không có productId nào được cung cấp"
            }
        
        # Get cart from session instead of parameter to avoid truncation
        session = tool_context.get_session()
        cart_data = session.get("cart", [])
        
        if not cart_data:
            return {
                "status": "error", 
                "message": "Giỏ hàng trống hoặc không tồn tại trong session"
            }
        
        selected_items = []
        found_ids = []
        missing_ids = []
        
        # Find matching products in cart
        for product_id in product_ids_list:
            found = False
            for cart_item in cart_data:
                if cart_item.get('productId') == product_id:
                    selected_items.append(cart_item.copy())
                    found_ids.append(product_id)
                    found = True
                    break
            
            if not found:
                missing_ids.append(product_id)
        
        if not selected_items:
            return {
                "status": "error",
                "message": f"Không tìm thấy sản phẩm nào với ID: {', '.join(product_ids_list)}"
            }
        
        # Calculate totals
        total_amount = sum(item.get("price", 0) * item.get("quantity", 1) for item in selected_items)
        total_quantity = sum(item.get("quantity", 1) for item in selected_items)
        
        result = {
            "status": "success",
            "selected_items": selected_items,
            "found_ids": found_ids,
            "total_items": len(selected_items),
            "total_quantity": total_quantity,
            "total_amount": total_amount,
            "message": f"✅ Đã chọn {len(selected_items)} sản phẩm từ giỏ hàng. Tổng tiền: {total_amount:,} ₫"
        }
        
        if missing_ids:
            result["missing_ids"] = missing_ids
            result["message"] += f" (Không tìm thấy: {', '.join(missing_ids)})"
        
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi khi chọn sản phẩm từ giỏ hàng bằng IDs: {str(e)}"
        }


