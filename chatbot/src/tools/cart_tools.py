import pandas as pd
import mysql.connector
from elasticsearch import Elasticsearch
from google.adk.tools import ToolContext
import json
import logging
from typing import Optional, List, Dict
import requests
from models.cart import CheckoutRequest, PaymentMethod, CartIdentity
from src.share_data import current_group_ids, filter_params
logger = logging.getLogger(__name__)
es_host: str = "http://localhost:9200"
es = Elasticsearch([es_host])
def search_product_name_elasticsearch(
    query_name: str,
    size: int = 1,
    
) -> dict:
    """
    Tìm kiếm trong Elasticsearch với query, group_ids liên quan và kích thước kết quả.

    Args:
        query (str): Chuỗi truy vấn tìm kiếm.
        group_ids (Optional[List[str]]): Danh sách group_id để lọc kết quả (nếu có).
        size (int): Số lượng kết quả tối đa trả về (mặc định là 10).
        es_host (str): Địa chỉ host của Elasticsearch (mặc định là localhost:9200).

    Returns:
        dict: Kết quả tìm kiếm từ Elasticsearch.
    """
    # Khởi tạo client Elasticsearch
    

    # Xây dựng body truy vấn
    body = {
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": query_name,
                            "fields": ["name"],  # Tìm trong document và ưu tiên name
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
                       "group_name": hits[0]['_source']['name'],
                       "group_id": hits[0]['_source']['group_id'],
                    }
                return results
            else:
                return "Không tìm thấy kết quả nào phù hợp."
        else:
            return {f"Error: {response['error']}"}
    except Exception as e:
        return {"error": str(e)}
    
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
    elif user_id:
        url = f"http://localhost:8070/api/guest-carts/{user_id}"
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
    elif user_id:
        url = f"http://localhost:8070/api/guest-carts/{user_id}/items"
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
    elif user_id:
        url = f"http://localhost:8070/api/guest-carts/{user_id}/items/{product_id}"
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
    elif user_id:
        url = f"http://localhost:8070/api/guest-carts/{user_id}/items/{product_id}"
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
    

def find_variant_by_group_id(name: str) -> dict:
    """
    Find variant by group_id in mySQL database.
    Args:
        group_id (str): The group_id to search for.
    Returns:
        dict: A dictionary containing the variant information.
    """
    try:
        conn = mysql.connector.connect(
            host='localhost',
            port=3307,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor()
        # Tìm kiếm trong Elasticsearch
        search_result = search_product_name_elasticsearch(name)
        if "error" in search_result:
            return f"Lỗi tìm kiếm: {search_result['error']}"

        group_id = search_result.get("group_id")
        if not group_id:
            return "Không tìm thấy group_id cho sản phẩm này."
        sql_query = """SELECT product_id, product_name, variant
                        FROM group_product_junction
                        WHERE group_id = %s
                    """
        cursor.execute(sql_query, (group_id))
        result = cursor.fetchall()
        combined_df = pd.DataFrame(result, columns=["product_id", "product_name", "variant"])
        response = combined_df.to_dict(orient='records')

        return {
            "group_id": group_id,
            "products": response
        }
    except mysql.connector.Error as err:
        return {"error": f"Error: {err}"}
    
def find_color_by_product_id(name: str, variant: str) -> dict:
    """
    Find available colors by product_id in MySQL database.
    
    Args:
        product_id (str): The product_id to search for.

    Returns:
        dict: A dictionary with product_id and list of available colors.
              Example: { "product_id": "abc123", "color": ["Đen", "Trắng"] }
    """
    try:
        conn = mysql.connector.connect(
            host='localhost',
            port=3307,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor()
        # Tìm kiếm trong Elasticsearch
        search_result = search_product_name_elasticsearch(name)
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
        pr = cursor.fetchone()
        if not pr:
            return f"Không tìm thấy sản phẩm {group_id} với variant: {variant}"
        product_id = pr['product_id']

        sql_query = """
            SELECT DISTINCT color
            FROM product_inventory
            WHERE product_id = %s
        """
        cursor.execute(sql_query, (product_id,))
        result = cursor.fetchall()
        
        # result = list of tuples, convert to flat list of strings
        colors = [row[0] for row in result if row[0] is not None]
        
        return {
            "product_id": product_id,
            "color": colors
        }
    
    except mysql.connector.Error as err:
        return {"error": f"Error: {err}"}

def find_product(name: str, variant: str, color: str) -> str:
    try:
        conn = mysql.connector.connect(
            host='localhost',
            port=3307,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor(dictionary=True)  # dùng dictionary để dễ xử lý

        # Tìm kiếm trong Elasticsearch
        search_result = search_product_name_elasticsearch(name)
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



def search_elasticsearch(
    query: str,
    ids: Optional[List[str]] = None,
    size: int = 10,
    es_host: str = "http://localhost:9200"
) -> dict:
    """
    Tìm kiếm trong Elasticsearch với query, group_ids liên quan và kích thước kết quả.

    Args:
        query (str): Chuỗi truy vấn tìm kiếm.
        group_ids (Optional[List[str]]): Danh sách group_id để lọc kết quả (nếu có).
        size (int): Số lượng kết quả tối đa trả về (mặc định là 10).
        es_host (str): Địa chỉ host của Elasticsearch (mặc định là localhost:9200).

    Returns:
        dict: Kết quả tìm kiếm từ Elasticsearch.
    """
    # Khởi tạo client Elasticsearch
    es = Elasticsearch([es_host])

    # Xây dựng body truy vấn
    body = {
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": query,
                            "fields": ["document", "name^2"],  # Tìm trong document và ưu tiên name
                            "fuzziness": "AUTO"  # Cho phép tìm kiếm gần đúng
                        }
                    }
                ]
            }
        },
        "size": size
    }

    # Nếu có danh sách group_ids, thêm bộ lọc
    if ids:
        body["query"]["bool"]["filter"] = [
            {"terms": {"group_id": ids}}
        ]

    try:
        # Thực hiện tìm kiếm
        response = es.search(index="products", body=body)
        return response
    except Exception as e:
        return {"error": str(e)}

