
from elasticsearch import Elasticsearch
from typing import List, Optional, Dict

def search_documment_elasticsearch(
    product_name: str,
    size: int = 1,
    es_host: str = "http://localhost:9200"
) -> dict:
    """
    Tìm kiếm trong Elasticsearch với product_name liên quan và kích thước kết quả.

    Args:
        product_name (str): Chuỗi truy vấn tìm kiếm.
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
                            "query": product_name,
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
                       "document": hits[0]['_source']['document'],
                    }
                return results
            else:
                return "Không tìm thấy kết quả nào phù hợp."
        else:
            return {f"Error: {response['error']}"}
    except Exception as e:
        return {"error": str(e)}
    
def aggregate_documents(product_names: List[str], es_host: str = "http://localhost:9200") -> Dict[str, Dict]:
    """
    Tổng hợp tài liệu từ danh sách tên sản phẩm bằng cách sử dụng search_document_elasticsearch.

    Args:
        product_names (List[str]): Danh sách tên sản phẩm cần tìm kiếm.
        es_host (str): Địa chỉ host của Elasticsearch.

    Returns:
        Dict[str, Dict]: Từ điển với key là tên sản phẩm và value là kết quả tìm kiếm.
    """
    results = {}
    
    for product_name in product_names:
        # Gọi hàm tìm kiếm cho từng sản phẩm
        search_result = search_documment_elasticsearch(product_name, es_host=es_host)
        # Lưu kết quả vào từ điển
        results[product_name] = search_result
    
    return results