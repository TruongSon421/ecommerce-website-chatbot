import pandas as pd
import mysql.connector
from elasticsearch import Elasticsearch
from typing import List, Optional
import pandas as pd
import mysql.connector
from google.adk.tools import ToolContext
import json

def search_product_name_elasticsearch(
    query_name: str,
    size: int = 1,
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




def product_consultation_tool(device_type: str, parsed_requirements: str, tool_context: ToolContext, top_k: int = 5) -> str:
    current_group_ids = []
    try:
        conn = mysql.connector.connect(
            host='localhost',
            port=3307,
            user='tiendoan',
            password='tiendoan',
            database='ecommerce_inventory'
        )
        cursor = conn.cursor()
        
        # Try to parse JSON, handle invalid JSON gracefully
        try:
            reqs = json.loads(parsed_requirements)
        except json.JSONDecodeError as json_err:
            cursor.close()
            conn.close()
            return f"Lỗi: Yêu cầu không phải định dạng JSON hợp lệ - {str(json_err)}"

        # Ensure reqs is a dictionary
        if not isinstance(reqs, dict):
            cursor.close()
            conn.close()
            return "Lỗi: Yêu cầu JSON phải là một đối tượng (dictionary)"

        # Process device type
        if device_type == "phone":
            tag_prefix = "phone_"
        elif device_type == "laptop":
            tag_prefix = "laptop_"
        else:
            cursor.close()
            conn.close()
            return f"{device_type} không được hỗ trợ. Vui lòng cung cấp yêu cầu cho điện thoại hoặc laptop."

        # Requirements with default values
        brand = reqs.get('brand_preference', None)
        min_budget = reqs.get('min_budget', None)
        max_budget = reqs.get('max_budget', None)
        print(reqs)

        # Check if only price information is provided
        only_price = (min_budget or max_budget) and not any(
            key for key in reqs.keys() 
            if key.startswith(tag_prefix) and reqs[key]
        )
        if only_price:
            price_sql = """
                SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                FROM group_product gp
                JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                GROUP BY gp.group_id, gp.group_name
            """
            cursor.execute(price_sql)
            result = cursor.fetchall()
            combined_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])
            
            # Filter by price
            if min_budget:
                combined_df = combined_df[combined_df["price"] >= min_budget]
            if max_budget and max_budget != 0:
                combined_df = combined_df[combined_df["price"] <= max_budget]
                
            # Sort by price (highest to lowest)
            combined_df = combined_df.sort_values(by="price", ascending=False).head(top_k)
            
            if combined_df.empty:
                cursor.close()
                conn.close()
                return f"Không tìm thấy {device_type} phù hợp với khoảng giá bạn yêu cầu."
            
            # Build response
            response = f"Dưới đây là top {top_k} {device_type} phù hợp với khoảng giá bạn yêu cầu (từ cao đến thấp):\n"
            for _, product in combined_df.iterrows():
                product_info = f"- {product['group_name']} (ID: {product['group_id']}, giá: {int(product['price']):,} đồng)"
                response += product_info + "\n"
            
            cursor.close()
            conn.close()
            return response

        # Handle other requirements
        req_fields = [key for key in reqs.keys() if key.startswith(tag_prefix) and reqs[key]]

        # Query tags
        tables_to_merge = []
        for req_key in req_fields:
            tag_name = req_key
            sql = """
                SELECT gp.group_id, gp.group_name
                FROM group_product gp
                JOIN group_tags gt ON gp.group_id = gt.group_id
                JOIN tags t ON gt.tag_id = t.tag_id
                WHERE t.tag_name = %s
            """
            cursor.execute(sql, (tag_name,))
            result = cursor.fetchall()
            if result:
                df = pd.DataFrame(result, columns=["group_id", "group_name"])
                df[f"{tag_name}_rank"] = df.index + 1
                tables_to_merge.append(df[["group_id", "group_name", f"{tag_name}_rank"]])

        if not tables_to_merge:
            cursor.close()
            conn.close()
            return f"Tôi đề xuất {device_type} từ {brand} dựa trên sở thích thương hiệu của bạn."

        # Merge DataFrames
        combined_df = tables_to_merge[0]
        for df in tables_to_merge[1:]:
            combined_df = pd.merge(combined_df, df, on=["group_id", "group_name"], how="outer")

        # Fill NaN ranks
        max_rank = max([len(df) for df in tables_to_merge]) + 1
        for col in combined_df.columns:
            if col.endswith("_rank"):
                combined_df[col] = combined_df[col].fillna(max_rank)

        # Elasticsearch search if specific requirements exist
        if reqs.get('specific_requirements') is not None:
            print("reqs['specific_requirements']", reqs['specific_requirements'])
            group_ids = combined_df['group_id'].astype(str).tolist()
            print(type(group_ids))
            search_results = search_elasticsearch(
                query=str(reqs['specific_requirements']),
                ids=group_ids, 
                size=top_k,
            )
            
            if "error" not in search_results:
                hits = search_results["hits"]["hits"]
                if hits:
                    matched_group_ids = [int(hit['_source']['group_id']) for hit in hits]
                    combined_df = combined_df[combined_df['group_id'].isin(matched_group_ids)]
                # Nếu không còn sản phẩm nào phù hợp
                    if combined_df.empty:
                        cursor.close()
                        conn.close()
                        return f"Không tìm thấy {device_type} có tính năng '{reqs['specific_requirements']}'"
            else:
                cursor.close()
                conn.close()
                return f"Không tìm thấy {device_type} có tính năng '{reqs['specific_requirements']}'"

        # Prices
        if min_budget or max_budget:
            price_sql = """
                SELECT gpj.group_id, gp.group_name, gpj.default_current_price AS price
                FROM group_product_junction gpj
                JOIN group_product gp ON gpj.group_id = gp.group_id
                WHERE (gpj.group_id, gpj.default_current_price) IN (
                    SELECT group_id, MIN(default_current_price)
                    FROM group_product_junction
                    GROUP BY group_id
                )
            """
            cursor.execute(price_sql)
            result = cursor.fetchall()
            prices_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])

            if not prices_df.empty:
                combined_df = pd.merge(combined_df, prices_df, on=["group_id", "group_name"], how="inner")
                if min_budget:
                    combined_df = combined_df[combined_df["price"] >= min_budget]
                if max_budget and max_budget != 0:
                    combined_df = combined_df[combined_df["price"] <= max_budget]

        # Calculate ranks
        rank_columns = [col for col in combined_df.columns if col.endswith("_rank")]
        if "es_rank" in combined_df.columns:
            rank_columns.append("es_rank")
            
        combined_df["combined_rank"] = combined_df[rank_columns].sum(axis=1)

        # Top k
        top_k_products = combined_df.sort_values(by="combined_rank").head(top_k)
        if top_k_products.empty:
            cursor.close()
            conn.close()
            return f"Không tìm thấy {device_type} phù hợp với yêu cầu của bạn."

        # Build response
        response = f"Dưới đây là top {top_k} {device_type} phù hợp với yêu cầu của bạn:\n"
        for _, product in top_k_products.iterrows():
            product_info = f"- {product['group_name']} (ID: {product['group_id']}, rank: {int(product['combined_rank'])}"
            if "price" in product and not pd.isna(product["price"]):
                product_info += f", giá: {int(product['price']):,} đồng"
            product_info += ")"
            response += product_info + "\n"
            current_group_ids.append(product['group_id'])
        tool_context.state["current_group_ids"] = current_group_ids
        cursor.close()
        conn.close()
        return response

    except Exception as e:
        try:
            cursor.close()
            conn.close()
        except:
            pass
        return f"Lỗi: {str(e)}"
    
