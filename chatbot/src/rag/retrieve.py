from elasticsearch import Elasticsearch
import hashlib
import os
from dotenv import load_dotenv
load_dotenv()
# Cấu hình kết nối

es_client = Elasticsearch("http://elasticsearch:9200")


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
        response = es_client.search(index="products_new", body=body)
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

# Truy vấn Elasticsearch
def search_elasticsearch(query, ids=None, size=5):
    body = {
        "query": {
            "bool": {
                "must": {
                    "multi_match": {
                        "query": query,
                        "fields": ['document','review']
                    }
                }
            }
        },
        "size": size
    }
    if ids:
        body["query"]["bool"]["filter"] = {
            "terms": {
                "group_id": ids
            }
        }
    # if device:
    #     body["query"]['bool']['filter'] = {
    #         "term":{
    #             "type":map_type[device]
    #         }
    #     }
    try:
        response = es_client.search(index="products_new", body=body)
    except Exception as e:
        print("Elasticsearch error:", str(e))
        return []
    results = []
    for hit in response["hits"]["hits"]:
        results.append({
            "id": hit["_id"],
            "score": hit["_score"],
            "name": hit["_source"]["name"],
            "group_id": hit["_source"]["group_id"],

        })
    return results

def search_name(query, ids=None, size=5):
    body = {
        "query": {
            "bool": {
                "must": {
                    "multi_match": {
                        "query": query,
                        "fields": ["name"]
                    }
                }
            }
        },
        "size": size
    }
    if ids:
        body["query"]["bool"]["filter"] = {
            "terms": {
                "group_id": ids
            }
        }
    # if device:
    #     body["query"]['bool']['filter'] = {
    #         "term":{
    #             "type":map_type[device]
    #         }
    #     }
    try:
        response = es_client.search(index="products_new", body=body)
    except Exception as e:
        print("Elasticsearch error:", str(e))
        return []
    results = []
    for hit in response["hits"]["hits"]:
        results.append({
            "id": hit["_id"],
            "document": hit["_source"]["document"],
            "score": hit["_score"],
            "name": hit["_source"]["name"],
            "group_id": hit["_source"]["group_id"],

        })
    return results

