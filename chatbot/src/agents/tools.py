import pandas as pd
from sqlalchemy import create_engine, text
from typing import Optional, List, Dict, Any
import requests
import os
import numpy as np
import json 
from rag.retrieve import combine_results,search_elasticsearch
from dotenv import load_dotenv
from models import PhoneRequirements,LaptopRequirements
from llama_index.llms.google_genai import GoogleGenAI
from .prompts import *
from duckduckgo_search import DDGS
from db import mysql
from llama_index.core.workflow import Context
from shared_data import CURRENT_REQUEST_GROUP_IDS

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
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        
        # Process device type
        if device == "phone":
            reqs = llm.structured_predict(PhoneRequirements, PHONE_CONSULTATION_TEMPLATE, query=query)
            tag_prefix = "phone_"
        elif device == "laptop":
            reqs = llm.structured_predict(LaptopRequirements, LAPTOP_CONSULTATION_TEMPLATE, query=query)
            tag_prefix = "laptop_"
        else:
            cursor.close()
            conn.close()
            return "Loại sản phẩm này hiện tại chưa có tại cửa hàng chúng tôi."

        # Requirements
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

        # Tìm kiếm Elasticsearch nếu có yêu cầu cụ thể
        if hasattr(reqs, 'specific_requirements') and reqs.specific_requirements and reqs.specific_requirements != '':
            print("reqs.specific_requirements", reqs.specific_requirements)
            
            # Lấy danh sách group_id từ combined_df (đảm bảo là string)
            group_ids = combined_df['group_id'].astype(str).tolist()
            
            search_results = search_elasticsearch(
                reqs.specific_requirements, 
                ids=group_ids,
                size=top_k*2  # Lấy nhiều hơn để có kết quả phong phú
            )
            print('search_results', search_results)
            
            # Xử lý kết quả Elasticsearch
            if search_results:
                es_df = pd.DataFrame(search_results)
                
                # Chuẩn bị dữ liệu để merge
                es_df['group_id'] = es_df['group_id'].astype(int)  # Chuyển về cùng kiểu với MySQL
                
                # Thêm cột rank từ Elasticsearch
                es_df['es_rank'] = es_df.index + 1
                
                # Merge với combined_df
                combined_df = pd.merge(
                    combined_df,
                    es_df[['group_id', 'es_rank']],
                    on='group_id',
                    how='left'
                )
                
                # Điền giá trị mặc định cho các sản phẩm không có trong kết quả tìm kiếm
                combined_df['es_rank'] = combined_df['es_rank'].fillna(len(combined_df) + 1)
            else:
                combined_df['es_rank'] = len(combined_df) + 1

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
            return f"Không tìm thấy {device} phù hợp với yêu cầu của bạn."

        # Build response
        response = f"Dưới đây là top {top_k} {device} phù hợp với yêu cầu của bạn:\n"
        for _, product in top_k_products.iterrows():
            product_info = f"- {product['group_name']} (ID: {product['group_id']}, rank: {int(product['combined_rank'])}"
            if "price" in product and not pd.isna(product["price"]):
                product_info += f", giá: {int(product['price']):,} đồng"
            product_info += ")"
            response += product_info + "\n"
            CURRENT_REQUEST_GROUP_IDS.append(product['group_id'])
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
    

def web_search_tool(query: str) -> str:
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"thông tin cấu hình {query}", max_results=6)
            if not results:
                return f"Không tìm thấy thông tin cấu hình cho '{query}' trên web."
            config_info = ""
            for result in results:
                title = result.get("title", "")
                snippet = result.get("body", "")
                if "cấu hình" in title.lower() or "cấu hình" in snippet.lower():
                    config_info += f"- {title}: {snippet}\n"
            return f"Thông tin cấu hình tìm thấy trên web cho '{query}':\n{config_info}" if config_info else f"Không tìm thấy thông tin cấu hình chi tiết cho '{query}' trên web."
    except Exception as e:
        return f"Lỗi khi tìm kiếm web: {str(e)}. Không thể lấy thông tin cấu hình cho '{query}'."


# Ensure this import is at the top of the file where product_information_tool is defined
# Assuming search_elasticsearch function is defined elsewhere
# from elasticsearch_utils import search_elasticsearch

def product_information_tool(query: str) -> str:
    CURRENT_REQUEST_GROUP_IDS.clear()
    results = search_elasticsearch(query) # Replace with your actual search call
    doc = ''

    if not results:
        print("--- No results found in product_information_tool ---")
        return "Không tìm thấy thông tin sản phẩm nào khớp với truy vấn của bạn."

    for i, r in enumerate(results):
        doc += f'Sản phẩm thứ {i+1}:\n'
        # Use .get for safety, in case keys are missing
        doc += r.get('group_data', 'N/A')
        doc += '\n\n'
        group_id = r.get('group_id') # Verify 'group_id' is the correct key name

        if group_id:
            CURRENT_REQUEST_GROUP_IDS.append(group_id)

    return f"Tìm trong danh sách này có thể có tài liệu về sản phẩm mà người dùng đang nhắc tới:\n {doc}"

def product_complain_tool(query: str) -> str:
    print(query)

    return "Vui lòng điền thông tin vào form, bạn sẽ được nhận được cuộc gọi tư vấn hỗ trợ trong vòng 48 giờ tiếp theo."

def shop_information_tool(query: str) -> str:
    with open('E:/projects/KLTN/web/untitled/chatbot/src/rag/shop_document.txt','r',encoding='utf-8') as f:
        shop_doc = f.read()


    return f"Dựa vào tài liệu sau về thông tin của cửa hàng để trả lời cho người dùng: {shop_doc}"

