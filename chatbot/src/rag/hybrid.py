import torch
import torch.nn.functional as F
from torch import Tensor
from transformers import AutoTokenizer, AutoModel
from elasticsearch import Elasticsearch
from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Dict, Optional, Tuple
import numpy as np


class E5EmbeddingModel:
    def __init__(self, model_name: str = 'intfloat/multilingual-e5-large'):
        """
        Khởi tạo E5 model để tạo query embeddings
        """
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()
        
    def average_pool(self, last_hidden_states: Tensor, attention_mask: Tensor) -> Tensor:
        """Average pooling cho hidden states"""
        last_hidden = last_hidden_states.masked_fill(~attention_mask[..., None].bool(), 0.0)
        return last_hidden.sum(dim=1) / attention_mask.sum(dim=1)[..., None]
    
    def encode(self, texts: List[str], prefix: str = "query: ") -> List[List[float]]:
        """
        Tạo embeddings cho texts
        
        Args:
            texts: Danh sách text cần embedding
            prefix: Prefix cho text ("query: " hoặc "passage: ")
            
        Returns:
            List embeddings
        """
        prefixed_texts = [f"{prefix}{text}" for text in texts]
        
        batch_dict = self.tokenizer(
            prefixed_texts, 
            max_length=512, 
            padding=True, 
            truncation=True, 
            return_tensors='pt'
        )
        
        with torch.no_grad():
            outputs = self.model(**batch_dict)
            embeddings = self.average_pool(outputs.last_hidden_state, batch_dict['attention_mask'])
            embeddings = F.normalize(embeddings, p=2, dim=1)
        
        return embeddings.tolist()


class HybridSearchEngine:
    def __init__(self, es_url: str = "http://localhost:9200", 
                 qdrant_url: str = "http://localhost:6333",
                 collection_name: str = "products"):
        """
        Khởi tạo Hybrid Search Engine
        
        Args:
            es_url: URL của Elasticsearch
            qdrant_url: URL của Qdrant
            collection_name: Tên collection trong Qdrant
        """
        self.es_client = Elasticsearch(es_url)
        self.qdrant_client = QdrantClient(qdrant_url)
        self.collection_name = collection_name
        self.embedding_model = E5EmbeddingModel()
        
        print(f"✅ Initialized Hybrid Search Engine")
        print(f"  🔍 Elasticsearch: {es_url}")
        print(f"  🎯 Qdrant: {qdrant_url} (collection: {collection_name})")
    
    def search_elasticsearch(self, query: str, ids: List[int] = None, size: int = 5) -> List[Dict]:
        """
        Search trong Elasticsearch
        
        Args:
            query: Query string
            ids: List group_ids để filter (optional)
            size: Số kết quả trả về
            
        Returns:
            List[Dict]: Elasticsearch results
        """
        body = {
            "query": {
                "bool": {
                    "must": {
                        "multi_match": {
                            "query": query,
                            "fields": ['document']
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
       
        try:
            response = self.es_client.search(index="products_new", body=body)
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
                "source": "elasticsearch"
            })
        return results
    
    def search_qdrant(self, query: str, group_ids: List[int] = None, size: int = 5) -> List[Dict]:
        """
        Search trong Qdrant với semantic similarity
        
        Args:
            query: Query string
            group_ids: List group_ids để filter (optional)
            size: Số kết quả trả về
            
        Returns:
            List[Dict]: Qdrant results
        """
        try:
            # Tạo query embedding
            query_embedding = self.embedding_model.encode([query], prefix="query: ")[0]
            
            # Tạo filter nếu có group_ids
            query_filter = None
            if group_ids:
                query_filter = models.Filter(
                    must=[
                        models.FieldCondition(
                            key="group_id",
                            match=models.MatchAny(any=group_ids)
                        )
                    ]
                )
            
            # Search trong Qdrant
            search_results = self.qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=query_filter,
                limit=size,
                with_payload=True
            )
            
            results = []
            for result in search_results:
                results.append({
                    "id": result.id,
                    "score": result.score,
                    "group_id": result.payload.get("group_id"),
                    "text_preview": result.payload.get("text_preview", ""),
                    "source": "qdrant"
                })
            
            return results
            
        except Exception as e:
            print(f"Qdrant error: {str(e)}")
            return []
    
    def normalize_scores(self, results: List[Dict], score_key: str = "score") -> List[Dict]:
        """
        Normalize scores về range [0, 1]
        
        Args:
            results: List results với scores
            score_key: Key chứa score
            
        Returns:
            List[Dict]: Results với normalized scores
        """
        if not results:
            return results
        
        scores = [r[score_key] for r in results]
        max_score = max(scores) if scores else 1
        min_score = min(scores) if scores else 0
        
        # Tránh division by zero
        if max_score == min_score:
            for result in results:
                result[f"normalized_{score_key}"] = 1.0
        else:
            for result in results:
                normalized = (result[score_key] - min_score) / (max_score - min_score)
                result[f"normalized_{score_key}"] = normalized
        
        return results
    
    def hybrid_search(self, query: str, 
                     es_weight: float = 0.6, 
                     qdrant_weight: float = 0.4,
                     size: int = 10,
                     group_id_filter: List[int] = None) -> List[Dict]:
        """
        Hybrid search kết hợp Elasticsearch và Qdrant
        
        Args:
            query: Query string
            es_weight: Trọng số cho Elasticsearch (keyword search)
            qdrant_weight: Trọng số cho Qdrant (semantic search)
            size: Số kết quả cuối cùng
            group_id_filter: List group_ids để filter (optional)
            
        Returns:
            List[Dict]: Combined và ranked results theo group_id
        """
        print(f"Hybrid search for: '{query}'")
        if group_id_filter:
            print(f"   Filtering by group_ids: {group_id_filter}")
        
        # 1. Search từ cả hai sources
        es_results = self.search_elasticsearch(query, group_id_filter, size * 2)
        qdrant_results = self.search_qdrant(query, group_id_filter, size * 2)
        
        print(f"   Elasticsearch: {len(es_results)} results")
        print(f"   Qdrant: {len(qdrant_results)} results")
        
        # 2. Normalize scores
        es_results = self.normalize_scores(es_results, "score")
        qdrant_results = self.normalize_scores(qdrant_results, "score")
        
        # 3. Combine results theo group_id
        combined_scores = {}
        
        # Process Elasticsearch results
        for result in es_results:
            group_id = result["group_id"]
            if group_id not in combined_scores:
                combined_scores[group_id] = {
                    "group_id": group_id,
                    "es_score": 0,
                    "qdrant_score": 0,
                    "es_result": None,
                    "qdrant_result": None,
                    "es_normalized": 0,
                    "qdrant_normalized": 0
                }
            
            # Chỉ lấy result tốt nhất cho mỗi group_id từ ES
            if result["normalized_score"] > combined_scores[group_id]["es_normalized"]:
                combined_scores[group_id]["es_score"] = result["score"]
                combined_scores[group_id]["es_normalized"] = result["normalized_score"]
                combined_scores[group_id]["es_result"] = result
        
        # Process Qdrant results
        for result in qdrant_results:
            group_id = result["group_id"]
            if group_id not in combined_scores:
                combined_scores[group_id] = {
                    "group_id": group_id,
                    "es_score": 0,
                    "qdrant_score": 0,
                    "es_result": None,
                    "qdrant_result": None,
                    "es_normalized": 0,
                    "qdrant_normalized": 0
                }
            
            # Chỉ lấy result tốt nhất cho mỗi group_id từ Qdrant
            if result["normalized_score"] > combined_scores[group_id]["qdrant_normalized"]:
                combined_scores[group_id]["qdrant_score"] = result["score"]
                combined_scores[group_id]["qdrant_normalized"] = result["normalized_score"]
                combined_scores[group_id]["qdrant_result"] = result
        
        # 4. Tính combined score và tạo final results
        final_results = []
        for group_id, scores in combined_scores.items():
            # Combined score = weighted sum of normalized scores
            combined_score = (
                es_weight * scores["es_normalized"] + 
                qdrant_weight * scores["qdrant_normalized"]
            )
            
            # Lấy thông tin chính từ ES result (vì có đầy đủ product info)
            if scores["es_result"]:
                name = scores["es_result"]["name"]
                es_id = scores["es_result"]["id"]
            else:
                name = "Unknown Product"
                es_id = None
            
            final_result = {
                "group_id": group_id,
                "name": name,
                "es_id": es_id,
                "combined_score": combined_score,
                "es_score": scores["es_score"],
                "qdrant_score": scores["qdrant_score"],
                "es_normalized": scores["es_normalized"],
                "qdrant_normalized": scores["qdrant_normalized"],
                "es_weight": es_weight,
                "qdrant_weight": qdrant_weight,
                "has_es_match": scores["es_result"] is not None,
                "has_qdrant_match": scores["qdrant_result"] is not None
            }
            
            final_results.append(final_result)
        
        # 5. Sort theo combined score
        final_results.sort(key=lambda x: x["combined_score"], reverse=True)
        
        print(f"   Combined: {len(final_results)} unique groups")
        
        return final_results[:size]
    
    
    def explain_search(self, query: str, top_result: Dict) -> None:
        """
        Explain tại sao result này có score cao
        
        Args:
            query: Query đã search
            top_result: Result cần explain
        """
        print(f"\nExplaining search result for query: '{query}'")
        print(f"Group ID: {top_result['group_id']}")
        print(f"Product: {top_result['name']}")
        print(f"Combined Score: {top_result['combined_score']:.3f}")
        print(f"   ES Score: {top_result['es_score']:.3f} (normalized: {top_result['es_normalized']:.3f})")
        print(f"   Qdrant Score: {top_result['qdrant_score']:.3f} (normalized: {top_result['qdrant_normalized']:.3f})")
        print(f"   Weights: ES={top_result['es_weight']}, Qdrant={top_result['qdrant_weight']}")
        print(f"   Sources: ES={top_result['has_es_match']}, Qdrant={top_result['has_qdrant_match']}")


# ==================== USAGE EXAMPLES ====================

def main():
    """
    Example usage của Hybrid Search
    """
    # Khởi tạo search engine
    search_engine = HybridSearchEngine(
        es_url="http://localhost:9200",
        qdrant_url="http://localhost:6333",
        collection_name="products"
    )
    
    # Test queries
    test_queries = [
        "điện thoại pin trâu nhất",
        "laptop gaming mạnh",
        "camera chụp ảnh đẹp",
        "smartphone cao cấp"
    ]
    
    print("Testing Hybrid Search...")
    
    for query in test_queries:
        print(f"\n" + "="*60)
        
        # Hybrid search
        results = search_engine.hybrid_search(
            query=query,
            es_weight=0.6,      # Ưu tiên keyword search hơn một chút
            qdrant_weight=0.4,  # Semantic search
            size=5
        )
        
        print(f"Top 5 results:")
        for i, result in enumerate(results, 1):
            print(f"  {i}. Group {result['group_id']}: {result['name'][:50]}...")
            print(f"     Combined: {result['combined_score']:.3f} | ES: {result['es_normalized']:.3f} | Qdrant: {result['qdrant_normalized']:.3f}")
        
        # Explain top result
        if results:
            search_engine.explain_search(query, results[0])


def hybrid_search(query: str,group_id_filter:List[int], es_weight: float = 0.6, qdrant_weight: float = 0.4, 
                       size: int = 5) -> List[Dict]:
    """
    Quick function cho hybrid search
    
    Args:
        query: Query string
        es_weight: Trọng số Elasticsearch
        qdrant_weight: Trọng số Qdrant
        size: Số kết quả
        
    Returns:
        List[Dict]: Search results
    """
    search_engine = HybridSearchEngine()
    
    return search_engine.hybrid_search(
        query=query,
        es_weight=es_weight,
        qdrant_weight=qdrant_weight,
        group_id_filter = group_id_filter,
        size=size,
    )

def test_hybrid_search():
    """Test hybrid search riêng biệt"""
    try:
        print("Testing hybrid search...")
        search_engine = HybridSearchEngine()
        results = search_engine.hybrid_search(
            query="cáp sạc",
            group_id_filter=[797, 798, 799],
            size=3
        )
        print(f"Test results: {results}")
        return True
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
if __name__ == "__main__":
    test_hybrid_search()
    # main()


# ==================== USAGE EXAMPLES ====================

# Example 1: Basic hybrid search
# results = quick_hybrid_search("điện thoại camera tốt", size=5)

# Example 2: Adjust weights
# results = quick_hybrid_search("laptop gaming", es_weight=0.7, qdrant_weight=0.3)

# Example 3: Search specific group_ids với quick function
# results = quick_hybrid_search("pin trâu", group_id_filter=[797, 798, 799], size=5)

# Example 4: Search specific group_ids với search engine
# search_engine = HybridSearchEngine()
# results = search_engine.search_by_group_ids([797, 798, 799], "pin trâu")

# Example 5: Filter by group_ids
# results = search_engine.hybrid_search("smartphone", group_id_filter=[797, 800, 805])