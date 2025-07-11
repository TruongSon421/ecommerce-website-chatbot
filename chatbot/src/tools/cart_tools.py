import pandas as pd
from google.adk.tools import ToolContext
import json
import logging
from typing import Optional, List, Dict
import requests
from models.cart import CheckoutRequest, PaymentMethod, CartIdentity
from share_data import current_group_ids, filter_params
import mysql.connector
logger = logging.getLogger(__name__)
from rag.retrieve import search_product_name



# Tool để lấy thông tin chi tiết sản phẩm (variants và colors)
def get_product_details(tool_context, group_id: int) -> dict:
    """
    Lấy thông tin chi tiết về các phiên bản và màu sắc của sản phẩm
    Args:
        group_id: ID nhóm sản phẩm
    Returns:
        Dict chứa thông tin variants và colors
    """
    try:
        # Query để lấy thông tin từ group_product_junction
        variants_query = """
        SELECT DISTINCT variant, product_id, product_name 
        FROM group_product_junction 
        WHERE group_id = %s 
        ORDER BY order_number
        """
        
        # Query để lấy thông tin màu sắc từ product_inventory
        colors_query = """
        SELECT DISTINCT pi.color, pi.product_id, pi.product_name
        FROM product_inventory pi
        INNER JOIN group_product_junction gpj ON pi.product_id = gpj.product_id
        WHERE gpj.group_id = %s AND pi.quantity > 0
        ORDER BY pi.color
        """
        
        # Thực hiện query (cần implement database connection)
        # Ở đây tôi giả sử bạn có hàm execute_query
        variants = execute_query(variants_query, (group_id,))
        colors = execute_query(colors_query, (group_id,))
        
        return {
            "status": "success",
            "group_id": group_id,
            "variants": variants,
            "colors": colors
        }
    except Exception as e:
        return {"status": "error", "message": f"Database error: {str(e)}"}

def find_cart_item(tool_context, product_name: str, color: Optional[str] = None, variant: Optional[str] = None) -> dict:
    """
    Tìm sản phẩm cụ thể trong giỏ hàng dựa trên các thông tin có sẵn
    
    Args:
        tool_context: Tool context
        product_name (str): Tên sản phẩm cần tìm
        color (str, optional): Màu sắc sản phẩm. Defaults to None.
        variant (str, optional): Variant/phân loại sản phẩm. Defaults to None.
        
    Returns:
        dict: Kết quả tìm kiếm với matching_items và total_matches
    """
    try:
        # Lấy thông tin giỏ hàng hiện tại
        cart_info = access_cart_information(tool_context)
        
        if cart_info.get("status") != "success":
            return cart_info
        
        cart_items = cart_info.get("items", [])
        matching_items = []
        
        for item in cart_items:
            match = True
            
            # Kiểm tra tên sản phẩm (fuzzy matching)
            if product_name:
                if product_name.lower() not in item["productName"].lower():
                    match = False
            
            # Kiểm tra màu sắc (chỉ khi có giá trị)
            if color:
                if color.lower() not in item["color"].lower():
                    match = False
            
            # Kiểm tra variant (từ productName, chỉ khi có giá trị)
            if variant:
                if variant.lower() not in item["productName"].lower():
                    match = False
            
            if match:
                matching_items.append(item)
        
        return {
            "status": "success",
            "matching_items": matching_items,
            "total_matches": len(matching_items)
        }
    
    except Exception as e:
        return {"status": "error", "message": f"Error finding cart item: {str(e)}"}



    
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
    print('access_cart')
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get('user_id',None)
    if accessToken!='undefined' and accessToken != None:
        url = "http://api-gateway:8070/api/carts"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }

        logger.info("Accessing cart information using token.")
        try:
            response = requests.get(url, headers=headers)
            print(response)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error accessing cart: %s", e)
            return {}
    elif user_id:
        url = f"http://api-gateway:8070/api/guest-carts/{user_id}"
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
        

def add_item_to_cart(product_id: str, tool_context: ToolContext, color: Optional[str] = None, quantity: int = 1) -> dict:
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
    print('add_item')
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get('user_id',None)
    if accessToken!='undefined' and accessToken!=None:
        url = "http://api-gateway:8070/api/carts/items"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }

        logger.info("Adding item to cart using token.")
        if color:
            product_body = {
                "productId": product_id,
                "quantity": quantity,
                "color": color
            }
        else:
            product_body = {
                "productId": product_id,
                "quantity": quantity,
                "color": "default"
            }

        try:
            response = requests.post(url, headers=headers, json=product_body)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error adding item to cart: %s", e)
            return {}
    elif user_id:
        url = f"http://api-gateway:8070/api/guest-carts/{user_id}/items"
        headers = {
            "Content-Type": "application/json"
        }
        if color:
            body = {
                "productId": product_id,
                "quantity": quantity,
                "color": color
            }
        else:
            body = {
                "productId": product_id,
                "quantity": quantity,
                "color": "default"
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
    
def update_item_in_cart(product_id: str, quantity: int, tool_context: ToolContext, color: Optional[str] = None) -> dict:
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
    print('update_item')
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get("user_id", None)
    if accessToken!='undefined' and accessToken!=None:
        url = f"http://api-gateway:8070/api/carts/items/{product_id}"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }
        if color:
            params = {
                "quantity": quantity,
                "color": color
            }
        else:
            params = {
                "quantity": quantity,
                "color": "default"
            }

        logger.info("Update item in cart using token.")
        try:
            response = requests.put(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Không thể cập nhật item trong giỏ hàng: %s", e)
            return {"error": str(e)}
    elif user_id:
        url = f"http://api-gateway:8070/api/guest-carts/{user_id}/items/{product_id}"
        headers = {
            "Content-Type": "application/json"
        }
        if color:
            params = {
                "quantity": quantity,
                "color": color
            }
        else:
            params = {
                "quantity": quantity,
                "color": "default"
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
        
    
def remove_item_from_cart(product_id: str, tool_context: ToolContext, color: Optional[str] = None) -> dict:
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
    print('remove_item')
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get("user_id", None)
    if accessToken!='undefined' and accessToken!=None:
        url = f"http://api-gateway:8070/api/carts/items/{product_id}"
        headers = {
            "Authorization": f"Bearer {accessToken}",
            "Content-Type": "application/json"
        }
    
        if color:
            params = {
                "color": color
            }
        else:
            params = {
                "color": "default"
            }

        logger.info("Removing item %s from cart", product_id)

        try:
            response = requests.delete(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error("Error removing item from cart: %s", e)
            return {}
    elif user_id:
        url = f"http://api-gateway:8070/api/guest-carts/{user_id}/items/{product_id}"
        headers = {
            "Content-Type": "application/json"
        }
        if color:
            params = {
                "color": color
            }
        else:
            params = {
                "color": "default"
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

def find_product(name: str, variant: str, color: str) -> str:
    try:
        conn = mysql.connector.connect(
            host='mysql',
            port=3306,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor(dictionary=True)

        # Tìm kiếm trong Elasticsearch
        search_result = search_product_name(name)
        if "error" in search_result:
            return f"Lỗi tìm kiếm: {search_result['error']}"

        group_id = search_result.get("group_id")
        if not group_id:
            return "Không tìm thấy group_id cho sản phẩm này."

        # Bước 1: Tìm product_id theo group_id và variant
        query_product_id = """
            SELECT product_id
            FROM group_product_junction
            WHERE group_id = %s AND variant = %s
        """
        cursor.execute(query_product_id, (group_id, variant))
        row = cursor.fetchone()

        if not row:
            return f"Không tìm thấy sản phẩm {group_id} với variant: {variant}"

        product_id = row['product_id']

        # Bước 2: Kiểm tra xem product_id có color yêu cầu không
        query_color_check = """
            SELECT 1
            FROM product_inventory
            WHERE product_id = %s AND color = %s
        """
        cursor.execute(query_color_check, (product_id, color))
        color_check = cursor.fetchone()

        if color_check:
            return product_id  
        else:
            return f"Sản phẩm {product_id} không có màu '{color}'"

    except Exception as e:
        return f"Lỗi kết nối CSDL: {str(e)}"
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def find_product_id_by_group_and_color(group_id: int, color: Optional[str] = None, variant: Optional[str] = None) -> dict:
    """
    Tìm product_id từ group_id và color (nếu có) trong MySQL database
    
    Args:
        group_id (int): ID của nhóm sản phẩm
        color (str, optional): Màu sắc của sản phẩm
        variant (str, optional): Phiên bản của sản phẩm
        
    Returns:
        dict: Dictionary chứa danh sách product_id phù hợp hoặc thông báo lỗi
        
    Example:
        >>> find_product_id_by_group_and_color(123, "red")
        {"status": "success", "products": [{"product_id": "prod-123", "variant": "Size M", "color": "red"}]}
    """
    try:
        # Kết nối database
        conn = mysql.connector.connect(
            host='mysql',
            port=3306,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor(dictionary=True)

        if color and variant:
            # Tìm theo cả group_id, color và variant
            query = """
                SELECT DISTINCT gpj.product_id, gpj.variant, pi.color, gpj.product_name, gpj.order_number
                FROM group_product_junction gpj
                INNER JOIN product_inventory pi ON gpj.product_id = pi.product_id
                WHERE gpj.group_id = %s AND pi.color = %s AND gpj.variant = %s
                ORDER BY gpj.order_number
            """
            cursor.execute(query, (group_id, color, variant))
        elif color:
            # Tìm theo group_id và color
            query = """
                SELECT DISTINCT gpj.product_id, gpj.variant, pi.color, gpj.product_name, gpj.order_number
                FROM group_product_junction gpj
                INNER JOIN product_inventory pi ON gpj.product_id = pi.product_id
                WHERE gpj.group_id = %s AND pi.color = %s
                ORDER BY gpj.order_number
            """
            cursor.execute(query, (group_id, color))
        elif variant:
            # Tìm theo group_id và variant
            query = """
                SELECT DISTINCT gpj.product_id, gpj.variant, pi.color, gpj.product_name, gpj.order_number
                FROM group_product_junction gpj
                LEFT JOIN product_inventory pi ON gpj.product_id = pi.product_id
                WHERE gpj.group_id = %s AND gpj.variant = %s
                ORDER BY gpj.order_number
            """
            cursor.execute(query, (group_id, variant))
        else:
            # Chỉ tìm theo group_id
            query = """
                SELECT DISTINCT gpj.product_id, gpj.variant, pi.color, gpj.product_name, gpj.order_number
                FROM group_product_junction gpj
                LEFT JOIN product_inventory pi ON gpj.product_id = pi.product_id
                WHERE gpj.group_id = %s
                ORDER BY gpj.order_number
            """
            cursor.execute(query, (group_id,))
        
        results = cursor.fetchall()
        
        if results:
            products = []
            for row in results:
                products.append({
                    "product_id": row['product_id'],
                    "product_name": row['product_name'],
                    "variant": row['variant'],
                    "color": row['color'] if row['color'] else None
                })
            
            return {
                "status": "success",
                "group_id": group_id,
                "total_found": len(products),
                "products": products
            }
        else:
            return {
                "status": "not_found",
                "message": f"Không tìm thấy sản phẩm với group_id={group_id}" + 
                          (f", color={color}" if color else "") + 
                          (f", variant={variant}" if variant else "")
            }
            
    except Exception as e:
        logger.error("Database error in find_product_id_by_group_and_color: %s", str(e))
        return {
            "status": "error",
            "message": f"Lỗi kết nối database: {str(e)}"
        }
    finally:
        if 'conn' in locals() and conn:
            if 'cursor' in locals() and cursor:
                cursor.close()
            conn.close()

<<<<<<< HEAD
=======
def find_group_id_by_product_id(product_id: str) -> dict:
    """
    Tìm group_id từ product_id trong MySQL database
    
    Args:
        product_id (str): ID của sản phẩm cần tìm group
        
    Returns:
        dict: Dictionary chứa thông tin group_id và các thông tin liên quan
        
    Example:
        >>> find_group_id_by_product_id("prod-123")
        {
            "status": "success", 
            "product_id": "prod-123",
            "group_id": 456,
            "variant": "Size M",
            "product_name": "Áo thun cotton"
        }
    """
    try:
        # Kết nối database
        conn = mysql.connector.connect(
            host='mysql',
            port=3306,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor(dictionary=True)

        # Query để tìm group_id từ product_id
        query = """
            SELECT group_id, variant, product_name, order_number
            FROM group_product_junction
            WHERE product_id = %s
        """
        cursor.execute(query, (product_id,))
        result = cursor.fetchone()
        
        if result:
            return {
                "status": "success",
                "product_id": product_id,
                "group_id": result['group_id'],
                "variant": result['variant'],
                "product_name": result['product_name'],
                "order_number": result['order_number']
            }
        else:
            return {
                "status": "not_found",
                "message": f"Không tìm thấy group_id cho product_id: {product_id}"
            }
            
    except Exception as e:
        logger.error("Database error in find_group_id_by_product_id: %s", str(e))
        return {
            "status": "error",
            "message": f"Lỗi kết nối database: {str(e)}"
        }
    finally:
        if 'conn' in locals() and conn:
            if 'cursor' in locals() and cursor:
                cursor.close()
            conn.close()
>>>>>>> server

def execute_query(query: str, params: tuple = None) -> list:
    """
    Thực hiện truy vấn SQL và trả về kết quả
    
    Args:
        query (str): Câu truy vấn SQL
        params (tuple, optional): Tham số cho truy vấn
        
    Returns:
        list: Danh sách kết quả từ database
    """
    try:
        conn = mysql.connector.connect(
            host='mysql',
            port=3306,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor(dictionary=True)
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        results = cursor.fetchall()
        return results
        
    except Exception as e:
        logger.error("Database error in execute_query: %s", str(e))
        return []
    finally:
        if 'conn' in locals() and conn:
            if 'cursor' in locals() and cursor:
                cursor.close()
            conn.close()

def modify_cart(tool_context: ToolContext, items_to_add: list[dict] = None, items_to_remove: list[dict] = None) -> dict:
    """
    Thêm và xóa nhiều sản phẩm trong giỏ hàng cùng lúc.

    Args:
        tool_context (ToolContext): Context chứa thông tin xác thực
        items_to_add (list[dict], optional): Danh sách sản phẩm cần thêm vào giỏ hàng
            Mỗi dict có format: {"product_id": str, "color": str, "quantity": int}
        items_to_remove (list[dict], optional): Danh sách sản phẩm cần xóa khỏi giỏ hàng
            Mỗi dict có format: {"product_id": str, "color": str}

    Returns:
        dict: Kết quả thao tác với thông tin chi tiết về các thành công/thất bại

    Example:
        >>> modify_cart(
        ...     tool_context=context,
        ...     items_to_add=[
        ...         {"product_id": "soil-123", "color": "red", "quantity": 2},
        ...         {"product_id": "fert-456", "color": "blue", "quantity": 1}
        ...     ],
        ...     items_to_remove=[
        ...         {"product_id": "old-123", "color": "green"}
        ...     ]
        ... )
        {
            "status": "completed",
            "added_items": {...},
            "removed_items": {...},
            "errors": []
        }
    """
    print('modify_cart')
    print('state...', tool_context.state.to_dict())
    
    # Xác định loại user và validate
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get('user_id', None)
    
    if accessToken != 'undefined' and accessToken is not None:
        logger.info("Modifying cart for authenticated user")
        user_type = "authenticated"
    elif user_id:
        logger.info("Modifying cart for guest user")
        user_type = "guest"
    else:
        logger.error("No valid authentication found")
        return {
            "status": "error",
            "message": "Không tìm thấy thông tin xác thực. Cần access_token hoặc user_id.",
            "added_items": [],
            "removed_items": [],
            "errors": ["No authentication found"]
        }
    
    result = {
        "status": "completed",
        "user_type": user_type,
        "added_items": [],
        "removed_items": [],
        "errors": []
    }
    
    try:
        # Xử lý xóa sản phẩm trước
        if items_to_remove:
            logger.info(f"Removing {len(items_to_remove)} items from cart")
            for item in items_to_remove:
                try:
                    product_id = item.get("product_id")
                    color = item.get("color")
                    
                    if not product_id:
                        result["errors"].append(f"Missing product_id for remove item: {item}")
                        continue
                    
                    remove_result = remove_item_from_cart(
                        product_id=product_id,
                        tool_context=tool_context,
                        color=color
                    )
                    
                    if remove_result:
                        result["removed_items"].append({
                            "product_id": product_id,
                            "color": color,
                            "result": remove_result
                        })
                        logger.info(f"Successfully removed item {product_id} (color: {color})")
                    else:
                        result["errors"].append(f"Failed to remove item {product_id} (color: {color})")
                        
                except Exception as e:
                    error_msg = f"Error removing item {item}: {str(e)}"
                    result["errors"].append(error_msg)
                    logger.error(error_msg)

        # Xử lý thêm sản phẩm
        if items_to_add:
            logger.info(f"Adding {len(items_to_add)} items to cart")
            for item in items_to_add:
                try:
                    product_id = item.get("product_id")
                    color = item.get("color")
                    quantity = item.get("quantity", 1)
                    
                    if not product_id:
                        result["errors"].append(f"Missing product_id for add item: {item}")
                        continue
                    
                    # Validate quantity
                    if quantity <= 0:
                        result["errors"].append(f"Invalid quantity {quantity} for product {product_id}")
                        continue
                    
                    add_result = add_item_to_cart(
                        product_id=product_id,
                        tool_context=tool_context,
                        color=color,
                        quantity=quantity
                    )
                    
                    if add_result:
                        result["added_items"].append({
                            "product_id": product_id,
                            "color": color,
                            "quantity": quantity,
                            "result": add_result
                        })
                        logger.info(f"Successfully added {quantity} of item {product_id} (color: {color})")
                    else:
                        result["errors"].append(f"Failed to add item {product_id} (color: {color}, quantity: {quantity})")
                        
                except Exception as e:
                    error_msg = f"Error adding item {item}: {str(e)}"
                    result["errors"].append(error_msg)
                    logger.error(error_msg)

        # Đặt status dựa trên kết quả
        if result["errors"]:
            if result["added_items"] or result["removed_items"]:
                result["status"] = "partial_success"
            else:
                result["status"] = "failed"
        else:
            result["status"] = "success"
            
        # Lấy thông tin giỏ hàng cập nhật
        try:
            updated_cart = access_cart_information(tool_context)
            result["updated_cart"] = updated_cart
        except Exception as e:
            logger.warning(f"Could not fetch updated cart info: {str(e)}")
            result["cart_fetch_error"] = str(e)

        return result

    except Exception as e:
        logger.error(f"Unexpected error in modify_cart: {str(e)}")
        return {
            "status": "error",
            "message": f"Unexpected error: {str(e)}",
            "added_items": result.get("added_items", []),
            "removed_items": result.get("removed_items", []),
            "errors": result.get("errors", [])
        }


