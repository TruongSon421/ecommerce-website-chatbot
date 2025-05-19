import pandas as pd
from sqlalchemy import create_engine, text
from typing import Optional, List, Dict, Any
import requests
import os
import numpy as np
import json 
from rag.retrieve import combine_results,search_elasticsearch,search_name
from dotenv import load_dotenv
from models import PhoneRequirements,LaptopRequirements
from llama_index.llms.google_genai import GoogleGenAI
from prompts import *
from duckduckgo_search import DDGS
import sys
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..')))
from db.mysql import mysql
from llama_index.core.workflow import Context
from shared_data import CURRENT_REQUEST_GROUP_IDS,CURRENT_FILTERS_PARAMS

ctx = Context
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
base_path = os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "filtered_products2")

load_dotenv()
llm = GoogleGenAI(
    model="gemini-2.0-flash",
    api_key=os.getenv('GOOGLE_API_KEY')
)
def product_consultation_tool(device: str, query: str, top_k: int = 5) -> str:
    CURRENT_REQUEST_GROUP_IDS.clear()
    CURRENT_FILTERS_PARAMS.clear()  # Reset filters
    
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        
        # Process device type
        if device == "phone":
            reqs = llm.structured_predict(PhoneRequirements, PHONE_CONSULTATION_TEMPLATE, query=query)
            tag_prefix = "phone_"
            device_type = "PHONE"
        elif device == "laptop":
            reqs = llm.structured_predict(LaptopRequirements, LAPTOP_CONSULTATION_TEMPLATE, query=query)
            tag_prefix = "laptop_"
            device_type = "LAPTOP"
        else:
            cursor.close()
            conn.close()
            return "Loại sản phẩm này hiện tại chưa có tại cửa hàng chúng tôi."

        # Lưu các tham số filter vào CURRENT_FILTERS_PARAMS
        CURRENT_FILTERS_PARAMS.update({
            "type": device_type,
        })

        # Xử lý ngân sách
        if reqs.min_budget:
            CURRENT_FILTERS_PARAMS["minPrice"] = reqs.min_budget
        if reqs.max_budget:
            CURRENT_FILTERS_PARAMS["maxPrice"] = reqs.max_budget

        # Xử lý brand preference
        if reqs.brand_preference and reqs.brand_preference != "không xác định":
            CURRENT_FILTERS_PARAMS["brand"] = reqs.brand_preference

        # Xử lý các tags
        active_tags = []
        for field, value in reqs.dict().items():
            if field.startswith(tag_prefix) and value:
                tag_name = field.replace(tag_prefix, "")
                active_tags.append(f"{device}_{tag_name}")
        
        if active_tags:
            CURRENT_FILTERS_PARAMS["tags"] = ",".join(active_tags)

        # Xử lý specific requirements (tìm kiếm full-text)
        if reqs.specific_requirements:
            CURRENT_FILTERS_PARAMS["search"] = reqs.specific_requirements

        # Phần còn lại của hàm giữ nguyên...
        brand = reqs.brand_preference or "không xác định"
        min_budget = reqs.min_budget
        max_budget = reqs.max_budget
        print(reqs)
        # Kiểm tra nếu chỉ có thông tin giá mà không có yêu cầu khác
        only_price = (min_budget or max_budget) and not any(
            field for field in reqs.__dict__.keys() 
            if field.startswith(tag_prefix) and getattr(reqs, field)
        )
        if only_price:
            # Trường hợp chỉ có thông tin giá
            price_sql = """
                SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                FROM group_product gp
                JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                GROUP BY gp.group_id, gp.group_name
            """
            cursor.execute(price_sql)
            result = cursor.fetchall()
            combined_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])
            
            # Lọc theo giá
            if min_budget:
                combined_df = combined_df[combined_df["price"] >= min_budget]
            if max_budget and max_budget != 0:
                combined_df = combined_df[combined_df["price"] <= max_budget]
                
            # Sắp xếp theo giá từ CAO NHẤT đến THẤP NHẤT (thay đổi ascending=False)
            combined_df = combined_df.sort_values(by="price", ascending=False).head(top_k)
            
            if combined_df.empty:
                cursor.close()
                conn.close()
                return f"Không tìm thấy {device} phù hợp với khoảng giá bạn yêu cầu."
            
            # Build response
            response = f"Dưới đây là top {top_k} {device} phù hợp với khoảng giá bạn yêu cầu (từ cao đến thấp):\n"
            for _, product in combined_df.iterrows():
                product_info = f"- {product['group_name']} (ID: {product['group_id']}, giá: {int(product['price']):,} đồng)"
                response += product_info + "\n"
            
            cursor.close()
            conn.close()
            return response

        # Nếu có yêu cầu khác ngoài giá, xử lý như bình thường
        # Active requirements
        req_fields = [field for field in reqs.__dict__.keys() if field.startswith(tag_prefix) and getattr(reqs, field)]

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
            return f"Tôi đề xuất {device} từ {brand} dựa trên sở thích thương hiệu của bạn."

        # Merge DataFrames
        combined_df = tables_to_merge[0]
        for df in tables_to_merge[1:]:
            combined_df = pd.merge(combined_df, df, on=["group_id", "group_name"], how="outer")

        # Fill NaN ranks
        max_rank = max([len(df) for df in tables_to_merge]) + 1
        for col in combined_df.columns:
            if col.endswith("_rank"):
                combined_df[col] = combined_df[col].fillna(max_rank)

        # Trong phần xử lý specific_requirements
        if hasattr(reqs, 'specific_requirements') and reqs.specific_requirements and reqs.specific_requirements != '':
            print("reqs.specific_requirements", reqs.specific_requirements)
            
            # Lấy danh sách group_id từ combined_df (đảm bảo là string)
            group_ids = combined_df['group_id'].astype(str).tolist()
            
            # Tìm kiếm chính xác cụm từ (không dùng slop)
            search_results = search_elasticsearch({
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match_phrase": {
                                    "document": reqs.specific_requirements  # Không có slop
                                }
                            },
                            {
                                "terms": {"group_id": group_ids}
                            }
                        ]
                    }
                },
                "size": len(group_ids)
            })
            print('search_results', search_results)
            
            # Chỉ giữ lại các sản phẩm có trong kết quả tìm kiếm
            if search_results and search_results.get('hits', {}).get('hits'):
                matched_group_ids = [int(hit['_source']['group_id']) for hit in search_results['hits']['hits']]
                combined_df = combined_df[combined_df['group_id'].isin(matched_group_ids)]
                
                # Nếu không còn sản phẩm nào phù hợp
                if combined_df.empty:
                    cursor.close()
                    conn.close()
                    return f"Không tìm thấy {device} có tính năng '{reqs.specific_requirements}'"
            else:
                cursor.close()
                conn.close()
                return f"Không tìm thấy {device} có tính năng '{reqs.specific_requirements}'"

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
        CURRENT_REQUEST_GROUP_IDS.append(top_k_products['group_id'].tolist())
        if top_k_products.empty:
            cursor.close()
            conn.close()
            return f"Không tìm thấy {device} phù hợp với yêu cầu của bạn."

        # Build response
        response = f"Dưới đây là top {top_k} {device} phù hợp với yêu cầu của bạn:\n"
        for _, product in top_k_products.iterrows():
            product_info = f"- {product['group_name']} (ID: {product['group_id']}, rank: {int(product['combined_rank'])}"
            if "price" in product and not pd.isna(product["price"]):
                product_info += f", giá: {int(product['price']):,} đồng"
            product_info += ")"
            response += product_info + "\n"
        cursor.close()
        conn.close()
        return response

    except Exception as e:
        try:
            cursor.close()
            conn.close()
        except:
            pass
        return f"Lỗi: {e}"
    

def product_information_tool(query: str) -> str:
    
    CURRENT_REQUEST_GROUP_IDS.clear()
    
    # Split and clean product names
    product_names = [name.strip() for name in query.split(',') if name.strip()]
    if not product_names:
        return "Vui lòng cung cấp tên sản phẩm cách nhau bằng dấu phẩy."

    output = []
    score_threshold_percent = 0.10  # 10% threshold

    for product_name in product_names:
        # Search for each product
        results = search_name(product_name)
        if not results:
            output.append(f"Không tìm thấy thông tin cho sản phẩm: {product_name}")
            continue

        # Sort results by score (descending)
        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        top_score = results[0].get('score', 0)
        min_score = top_score * (1 - score_threshold_percent)

        # Filter results within 10% of top score
        qualified_results = [r for r in results if r.get('score', 0) >= min_score]
        if not qualified_results:
            output.append(f"Không có kết quả đủ tốt cho sản phẩm: {product_name}")
            continue

        # Add product information to output
        output.append(f"\n=== Kết quả cho '{product_name}' ===")
        for i, r in enumerate(qualified_results, 1):
            output.append(f"\nSản phẩm {i}:")
            output.append(r.get('document', 'Thông tin không khả dụng'))
            output.append(f"Độ phù hợp: {r.get('score', 0):.2f} (Top score: {top_score:.2f})")
            
            if group_id := r.get('group_id'):
                CURRENT_REQUEST_GROUP_IDS.append(group_id)

    if len(output) == 0:
        return "Không tìm thấy thông tin phù hợp cho bất kỳ sản phẩm nào."

    return "\n".join(output)

def product_complain_tool(query: str) -> str:
    print(query)

    return "Vui lòng điền thông tin vào form, bạn sẽ được nhận được cuộc gọi tư vấn hỗ trợ trong vòng 48 giờ tiếp theo."



