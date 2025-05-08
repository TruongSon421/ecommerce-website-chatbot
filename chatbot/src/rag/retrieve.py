from elasticsearch import Elasticsearch
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI
import hashlib
import os
from dotenv import load_dotenv
load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
# Cấu hình kết nối

es_client = Elasticsearch("http://localhost:9200")
qdrant_client = QdrantClient("localhost", port=6333)
client = OpenAI(api_key=openai_key)  # Thay bằng API key của bạn

# Hàm tạo embedding từ OpenAI
def get_openai_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

# Hàm tạo ID duy nhất từ _id
def generate_id(object_id):
    return hashlib.md5(str(object_id).encode()).hexdigest()

# Truy vấn Elasticsearch
def search_elasticsearch(query, ids=None, size=5):
    map_type = {"phone":"PHONE","laptop":"LAPTOP"}
    body = {
        "query": {
            "bool": {
                "must": {
                    "multi_match": {
                        "query": query,
                        "fields": ["group_name",'group_data']
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
            "group_data": hit["_source"]["group_data"],
            "score": hit["_score"],
            "group_name": hit["_source"]["group_name"],
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
            "group_data": point.payload["group_data"],
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
            "group_data": result["group_data"],
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
                "group_data": result["group_data"],
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
            "content": scores["content"],
            "product_name": scores["product_name"],
            "product_type": scores["product_type"],
            "brand": scores["brand"]
        })

    # Sắp xếp theo điểm tổng hợp giảm dần
    final_results.sort(key=lambda x: x["combined_score"], reverse=True)
    return final_results[:size]

