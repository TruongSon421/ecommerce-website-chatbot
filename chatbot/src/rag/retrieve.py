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
        response = es_client.search(index="products", body=body)
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
        response = es_client.search(index="products", body=body)
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
        response = es_client.search(index="products", body=body)
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

# Truy vấn Qdrant
def search_qdrant(query, vector_size=1536, size=10):
    query_vector = get_openai_embedding(query)
    search_result = qdrant_client.search(
        collection_name="products",
        query_vector=query_vector,
        limit=size,
        with_payload=True
    )
    results = []
    for point in search_result:
        results.append({
            "id": point.id,
            "score": point.score,
            "document": point.payload["document"],
            "product_name": point.payload["product_name"],
            "brand": point.payload["brand"]
        })
    return results

# Tổng hợp kết quả từ Elasticsearch và Qdrant
def combine_results(query, semantic_weight=0.1, elastic_weight=0.9, size=6):
    es_results = search_elasticsearch(query, size)
    qdrant_results = search_qdrant(query, size=size)

    # Chuẩn hóa điểm số và kết hợp
    combined_scores = {}
    
    # Xử lý kết quả từ Elasticsearch
    max_es_score = max([r["score"] for r in es_results], default=1) or 1  # Tránh chia cho 0
    for result in es_results:
        normalized_score = result["score"] / max_es_score  # Chuẩn hóa về [0, 1]
        combined_scores[result["id"]] = {
            "elastic_score": normalized_score,
            "semantic_score": 0,
            "document": result["document"],
            "product_name": result["product_name"],
            "brand": result["brand"]
        }

    # Xử lý kết quả từ Qdrant
    max_qdrant_score = max([r["score"] for r in qdrant_results], default=1) or 1
    for result in qdrant_results:
        normalized_score = result["score"] / max_qdrant_score  # Chuẩn hóa về [0, 1]
        if result["id"] in combined_scores:
            combined_scores[result["id"]]["semantic_score"] = normalized_score
        else:
            combined_scores[result["id"]] = {
                "elastic_score": 0,
                "semantic_score": normalized_score,
                "document": result["document"],
                "product_name": result["product_name"],
                "product_type": result["product_type"],
                "brand": result["brand"]
            }

    # Tính điểm tổng hợp dựa trên trọng số
    final_results = []
    for doc_id, scores in combined_scores.items():
        combined_score = (semantic_weight * scores["semantic_score"]) + (elastic_weight * scores["elastic_score"])
        final_results.append({
            "id": doc_id,
            "combined_score": combined_score,
            "elastic_score": scores["elastic_score"],
            "semantic_score": scores["semantic_score"],
            "document": scores["document"],
            "product_name": scores["product_name"],
            "product_type": scores["product_type"],
            "brand": scores["brand"]
        })

    # Sắp xếp theo điểm tổng hợp giảm dần
    final_results.sort(key=lambda x: x["combined_score"], reverse=True)
    return final_results[:size]

