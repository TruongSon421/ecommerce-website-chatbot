import pandas as pd
import mysql.connector
from elasticsearch import Elasticsearch
from google.adk.tools import ToolContext
import json
import logging
from typing import Optional, List, Dict
import requests
from models.cart import CheckoutRequest, PaymentMethod, CartIdentity
from share_data import current_group_ids, filter_params

logger = logging.getLogger(__name__)

es_host: str = "http://elasticsearch:9200"
es = Elasticsearch([es_host])

def search_product_name(
    product_name: str,
    size: int = 1,
    
) -> dict:
    """
    Tìm kiếm thông tin sản phẩm với tên sản phẩm ở Elasticsearch.

    Args:
        product_name: tên của sản phẩm.

    Returns:
        dict: Kết quả thông tin tìm kiếm từ Elasticsearch.
    """
    # Khởi tạo client Elasticsearch
    

    # Xây dựng body truy vấn
    body = {
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": product_name,
                            "fields": ["name^2"],  # Tìm trong document và ưu tiên name
                            "fuzziness": "AUTO"  # Cho phép tìm kiếm gần đúng
                        }
                    }
                ]
            }
        },
        "size": size,
    }
    try:
        # Thực hiện tìm kiếm
        response = es.search(index="products", body=body)
        if "error" not in response:
            hits = response["hits"]["hits"]
            if hits:
                # Chọn trường cần thiết từ kết quả
                results = {
                       "name": hits[0]['_source']['name'],
                       "group_id": hits[0]['_source']['group_id'],
                       "document": hits[0]['_source']['document']
                    }
                return results
            else:
                return "Không tìm thấy kết quả nào phù hợp."
        else:
            return {f"Error: {response['error']}"}
    except Exception as e:
        return {"error": str(e)}

# Tool mới để tìm kiếm sản phẩm từ Elasticsearch
def search_products_elasticsearch(tool_context, query: str, limit: int = 6) -> dict:
    """
    Tìm kiếm sản phẩm từ Elasticsearch dựa trên query của người dùng
    Args:
        query: Từ khóa tìm kiếm (tên sản phẩm)
        limit: Số lượng kết quả tối đa
    Returns:
        Dict chứa danh sách sản phẩm tìm được
    """
    current_group_ids.clear()
    try:
        # URL của Elasticsearch endpoint
        
        # Query để tìm kiếm sản phẩm
        search_body = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["name^2", "type"],
                    "fuzziness": "AUTO"
                }
            },
            "size": limit,
            "_source": ["name", "type", "group_id"]
        }
        
        response = es.search(index="products", body=search_body)
        if "error" not in response:
            hits = response["hits"]["hits"]
            products = []
            for hit in hits:
                source = hit['_source']
                products.append({
                    "name": source.get('name'),
                    "type": source.get('type'),
                    "group_id": source.get('group_id'),
                    "score": hit['_score']
                })
                current_group_ids.append(source.get('group_id'))
            return {"status": "success", "products": products}
        else:
            return {"status": "error", "message": "Elasticsearch search failed"}
    except Exception as e:
        return {"status": "error", "message": f"Search error: {str(e)}"}


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

def find_cart_item(tool_context, product_name: str, color: str, variant: str) -> dict:
    """
    Tìm sản phẩm cụ thể trong giỏ hàng dựa trên các thông tin có sẵn
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
            
            # Kiểm tra màu sắc
            if color:
                if color.lower() not in item["color"].lower():
                    match = False
            
            # Kiểm tra variant (từ productName)
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
    if accessToken!='undefined':
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
    print('add_item')
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get('user_id',None)
    if accessToken!='undefined':
        url = "http://api-gateway:8070/api/carts/items"
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
    elif user_id:
        url = f"http://api-gateway:8070/api/guest-carts/{user_id}/items"
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
    print('update_item')
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get("user_id", None)
    if accessToken!='undefined':
        url = f"http://api-gateway:8070/api/carts/items/{product_id}"
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
    elif user_id:
        url = f"http://api-gateway:8070/api/guest-carts/{user_id}/items/{product_id}"
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
    print('remove_item')
    state = tool_context.state
    print('state...', tool_context.state.to_dict())
    accessToken = tool_context.state.get("access_token", None)
    user_id = tool_context.state.get("user_id", None)
    if accessToken!='undefined':
        url = f"http://api-gateway:8070/api/carts/items/{product_id}"
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
    elif user_id:
        url = f"http://api-gateway:8070/api/guest-carts/{user_id}/items/{product_id}"
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

def find_product(name: str, variant: str, color: str) -> str:
    try:
        conn = mysql.connector.connect(
            host='api-gateway',
            port=3307,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor(dictionary=True)  # dùng dictionary để dễ xử lý

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

    except mysql.connector.Error as e:
        return f"Lỗi kết nối CSDL: {str(e)}"
    finally:
        if conn.is_connected():
            conn.close()


