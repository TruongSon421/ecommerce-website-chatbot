import pandas as pd
from sqlalchemy import create_engine, text
from typing import Optional, List, Dict, Any
import requests
import os
import numpy as np
import json 
from rag.retrieve import combine_results,search_elasticsearch,search_name
from dotenv import load_dotenv
from models.requirements import PhoneRequirements,LaptopRequirements
from llama_index.llms.google_genai import GoogleGenAI
from prompts import *
import sys
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..')))
from db.mysql import mysql
from google.adk.tools import ToolContext
from share_data import current_group_ids,filter_params
load_dotenv()
llm = GoogleGenAI(
    model="gemini-2.0-flash",
    api_key=os.getenv('GOOGLE_API_KEY')
)
def product_consultation_tool(device: str, query: str, top_k: int = 5) -> str:

    """
    Công cụ tư vấn sản phẩm điện tử thông minh dựa trên nhu cầu của người dùng.
    
    Args:
        device (str): Loại thiết bị cần tư vấn (ví dụ: "điện thoại", "laptop", "tablet", "tai nghe", "smartwatch")
        query (str): Câu hỏi hoặc yêu cầu tư vấn gốc của người dùng (ví dụ: "tìm điện thoại chụp ảnh đẹp dưới 15 triệu", "laptop gaming trong tầm giá 20-30 triệu")
        top_k (int, optional): Top số lượng sản phẩm phù hợp nhất mà người dùng muốn hiển thị trong kết quả tư vấn. 
                               
    Returns:
        str: Kết quả tư vấn chi tiết bao gồm danh sách sản phẩm phù hợp    
    Examples:
        >>> # Tư vấn 3 điện thoại tốt nhất
        >>> product_consultation_tool("điện thoại", "chụp ảnh đẹp dưới 15 triệu", top_k=3)
        
        >>> # Xem 10 laptop gaming để có nhiều lựa chọn
        >>> product_consultation_tool("laptop", "gaming trong tầm 20-30 triệu", top_k=10)
        
    """
    current_group_ids.clear()
    filter_params.clear()
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        
        # Process device type
        if device == "phone":
            reqs = llm.structured_predict(PhoneRequirements, PHONE_CONSULTATION_TEMPLATE, query=query)
            tag_prefix = "phone_"
            device_type = "phone"
        elif device == "laptop":
            reqs = llm.structured_predict(LaptopRequirements, LAPTOP_CONSULTATION_TEMPLATE, query=query)
            tag_prefix = "laptop_"
            device_type = "laptop"
        else:
            cursor.close()
            conn.close()
            return "Loại sản phẩm này hiện tại chưa có tại cửa hàng chúng tôi."

        # Lưu các tham số filter vào filter_params
        filter_params.update({
            "type": device_type,
        })

        # Xử lý ngân sách
        if reqs.min_budget:
            filter_params["minPrice"] = reqs.min_budget
        if reqs.max_budget:
            filter_params["maxPrice"] = reqs.max_budget

        # Xử lý brand preference (string với dấu phẩy)
        if reqs.brand_preference and reqs.brand_preference.strip():
            filter_params["brand"] = reqs.brand_preference

        # Xử lý các tags
        active_tags = []
        for field, value in reqs.dict().items():
            if field.startswith(tag_prefix) and value:
                tag_name = field.replace(tag_prefix, "")
                active_tags.append(f"{device}_{tag_name}")
        
        if active_tags:
            filter_params["tags"] = ",".join(active_tags)

        # Xử lý specific requirements (tìm kiếm full-text)
        if reqs.specific_requirements:
            filter_params["search"] = reqs.specific_requirements

        # Parse brand_preference string thành list
        brand_list = []
        brand_display = ""
        if reqs.brand_preference and reqs.brand_preference.strip():
            # Split by comma và clean up
            brand_list = [brand.strip() for brand in reqs.brand_preference.split(',') if brand.strip() and brand.strip() != "không xác định"]
            if brand_list:
                brand_display = ", ".join(brand_list)
        
        min_budget = reqs.min_budget
        max_budget = reqs.max_budget
        print(reqs)
        
        # **XỬ LÝ BRAND FILTER CHO COMMA-SEPARATED STRING**
        brand_filtered_df = None
        if brand_list:
            # Create placeholders for IN clause
            brand_placeholders = ','.join(['%s'] * len(brand_list))
            brand_sql = f"""
                SELECT group_id, group_name, brand
                FROM group_product
                WHERE brand IN ({brand_placeholders}) AND type = %s
            """
            brand_params = brand_list + [device_type]
            cursor.execute(brand_sql, brand_params)
            brand_result = cursor.fetchall()
            
            if brand_result:
                brand_filtered_df = pd.DataFrame(brand_result, columns=["group_id", "group_name", "brand"])
                print(f"Found {len(brand_filtered_df)} products for brands {brand_list}")
            else:
                cursor.close()
                conn.close()
                if len(brand_list) == 1:
                    return f"Không tìm thấy {device} của thương hiệu {brand_list[0]} trong cửa hàng."
                else:
                    brands_str = " hoặc ".join(brand_list)
                    return f"Không tìm thấy {device} của thương hiệu {brands_str} trong cửa hàng."
        
        # Kiểm tra nếu chỉ có thông tin giá mà không có yêu cầu khác
        only_price = (min_budget or max_budget) and not any(
            field for field in reqs.__dict__.keys() 
            if field.startswith(tag_prefix) and getattr(reqs, field)
        )
        
        if only_price:
            # Trường hợp chỉ có thông tin giá
            if brand_filtered_df is not None:
                # Nếu có brand filter, chỉ lấy giá của các sản phẩm trong brand đó
                brand_group_ids = brand_filtered_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(brand_group_ids))
                price_sql = f"""
                    SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                    FROM group_product gp
                    JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                    WHERE gp.group_id IN ({placeholders})
                    GROUP BY gp.group_id, gp.group_name
                """
                cursor.execute(price_sql, brand_group_ids)
            else:
                # Không có brand filter, lấy tất cả
                price_sql = """
                    SELECT gp.group_id, gp.group_name, MIN(gpj.default_current_price) AS price
                    FROM group_product gp
                    JOIN group_product_junction gpj ON gp.group_id = gpj.group_id
                    WHERE gp.type = %s
                    GROUP BY gp.group_id, gp.group_name
                """
                cursor.execute(price_sql, (device_type,))
                
            result = cursor.fetchall()
            combined_df = pd.DataFrame(result, columns=["group_id", "group_name", "price"])
            
            # Lọc theo giá
            if min_budget:
                combined_df = combined_df[combined_df["price"] >= min_budget]
            if max_budget and max_budget != 0:
                combined_df = combined_df[combined_df["price"] <= max_budget]
                
            # Sắp xếp theo giá từ CAO NHẤT đến THẤP NHẤT
            combined_df = combined_df.sort_values(by="price", ascending=False).head(top_k)
            
            if combined_df.empty:
                cursor.close()
                conn.close()
                brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
                return f"Không tìm thấy {device}{brand_msg} phù hợp với khoảng giá bạn yêu cầu."
            
            # **FIX: THÊM CURRENT_GROUP_IDS CHO TRƯỜNG HỢP CHỈ CÓ GIÁ**
            current_group_ids.extend(combined_df['group_id'].tolist())
            
            # Build response
            brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
            response = f"Dưới đây là top {top_k} {device}{brand_msg} phù hợp với khoảng giá bạn yêu cầu (từ cao đến thấp):\n"
            for _, product in combined_df.iterrows():
                product_info = f"- {product['group_name']} (ID: {product['group_id']}, giá: {int(product['price']):,} đồng)"
                response += product_info + "\n"
            
            cursor.close()
            conn.close()
            return response

        # Nếu có yêu cầu khác ngoài giá, xử lý như bình thường
        # Active requirements
        req_fields = [field for field in reqs.__dict__.keys() if field.startswith(tag_prefix) and getattr(reqs, field)]

        # Query tags với brand filter
        tables_to_merge = []
        
        for req_key in req_fields:
            tag_name = req_key
            if brand_filtered_df is not None:
                # Nếu có brand filter, chỉ lấy tags của các sản phẩm trong brand đó
                brand_group_ids = brand_filtered_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(brand_group_ids))
                sql = f"""
                    SELECT gp.group_id, gp.group_name
                    FROM group_product gp
                    JOIN group_tags gt ON gp.group_id = gt.group_id
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE t.tag_name = %s AND gp.group_id IN ({placeholders})
                """
                params = [tag_name] + brand_group_ids
                cursor.execute(sql, params)
            else:
                # Không có brand filter
                sql = """
                    SELECT gp.group_id, gp.group_name
                    FROM group_product gp
                    JOIN group_tags gt ON gp.group_id = gt.group_id
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE t.tag_name = %s AND gp.type = %s
                """
                cursor.execute(sql, (tag_name, device_type))
                
            result = cursor.fetchall()
            if result:
                df = pd.DataFrame(result, columns=["group_id", "group_name"])
                df[f"{tag_name}_rank"] = df.index + 1
                tables_to_merge.append(df[["group_id", "group_name", f"{tag_name}_rank"]])

        # Xử lý trường hợp chỉ có brand preference không có tag
        if not tables_to_merge:
            if brand_filtered_df is not None:
                # Nếu chỉ có brand preference mà không có tag nào, sử dụng brand_filtered_df
                combined_df = brand_filtered_df.copy()
                # **FIX: THÊM CURRENT_GROUP_IDS CHO TRƯỜNG HỢP CHỈ CÓ BRAND**
                current_group_ids.extend(combined_df['group_id'].tolist())
            else:
                cursor.close()
                conn.close()
                return f"Tôi đề xuất {device} từ {brand_display} dựa trên sở thích thương hiệu của bạn." if brand_display else f"Tôi cần thêm thông tin để đề xuất {device} phù hợp."
        else:
            # Merge DataFrames
            combined_df = tables_to_merge[0]
            for df in tables_to_merge[1:]:
                combined_df = pd.merge(combined_df, df, on=["group_id", "group_name"], how="outer")

            # Fill NaN ranks
            max_rank = max([len(df) for df in tables_to_merge]) + 1
            for col in combined_df.columns:
                if col.endswith("_rank"):
                    combined_df[col] = combined_df[col].fillna(max_rank)

        # Xử lý specific_requirements
        if hasattr(reqs, 'specific_requirements') and reqs.specific_requirements and reqs.specific_requirements != '':
            print("reqs.specific_requirements", reqs.specific_requirements)
            
            # Lấy danh sách group_id từ combined_df
            group_ids = combined_df['group_id'].astype(str).tolist()
            
            # Tìm kiếm chính xác cụm từ
            search_results = search_elasticsearch(
                query=reqs.specific_requirements,
                ids=group_ids,
                size=len(group_ids)
            )
            print('search_results', search_results)
            
            # Tạo mapping điểm số từ kết quả search
            relevance_scores = {}
            if search_results:
                for hit in search_results:
                    group_id = int(hit['group_id'])
                    score = hit.get('_score', 0)  # Lấy điểm từ Elasticsearch
                    relevance_scores[group_id] = score
            
            # Thêm cột điểm relevance cho tất cả sản phẩm
            # Nếu group_id không có trong kết quả search thì được gán điểm 0
            combined_df['relevance_score'] = combined_df['group_id'].map(
                lambda x: relevance_scores.get(x, 0)
            )
            
            # Sắp xếp theo điểm relevance (cao nhất trước)
            combined_df = combined_df.sort_values('relevance_score', ascending=False)
            
            print(f"Reranked {len(combined_df)} products by specific requirements relevance")
        # Xử lý giá cả
        if min_budget or max_budget:
            if not combined_df.empty:
                group_ids_for_price = combined_df['group_id'].tolist()
                placeholders = ','.join(['%s'] * len(group_ids_for_price))
                price_sql = f"""
                    SELECT gpj.group_id, gp.group_name, gpj.default_current_price AS price
                    FROM group_product_junction gpj
                    JOIN group_product gp ON gpj.group_id = gp.group_id
                    WHERE gpj.group_id IN ({placeholders})
                    AND (gpj.group_id, gpj.default_current_price) IN (
                        SELECT group_id, MIN(default_current_price)
                        FROM group_product_junction
                        WHERE group_id IN ({placeholders})
                        GROUP BY group_id
                    )
                """
                params = group_ids_for_price + group_ids_for_price
                cursor.execute(price_sql, params)
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
            
        if rank_columns:
            combined_df["combined_rank"] = combined_df[rank_columns].sum(axis=1)
            top_k_products = combined_df.sort_values(by="combined_rank").head(top_k)
        else:
            # Nếu không có rank columns, lấy theo thứ tự
            top_k_products = combined_df.head(top_k)
        
        # **FIX: ĐẢM BẢO CURRENT_GROUP_IDS LUÔN ĐƯỢC CẬP NHẬT**
        if not top_k_products.empty:
            current_group_ids.extend(top_k_products['group_id'].tolist())
        
        if top_k_products.empty:
            cursor.close()
            conn.close()
            brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
            return f"Không tìm thấy {device}{brand_msg} phù hợp với yêu cầu của bạn."

        # Build response
        brand_msg = f" của thương hiệu {brand_display}" if brand_display else ""
        response = f"Dưới đây là top {top_k} {device}{brand_msg} phù hợp với yêu cầu của bạn:\n"
        for _, product in top_k_products.iterrows():
            product_info = f"- {product['group_name']} (ID: {product['group_id']}"
            if "combined_rank" in product and not pd.isna(product["combined_rank"]):
                product_info += f", rank: {int(product['combined_rank'])}"
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
    current_group_ids.clear()
        
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
                current_group_ids.append(group_id)
    print(current_group_ids)
    if len(output) == 0:
        return "Không tìm thấy thông tin phù hợp cho bất kỳ sản phẩm nào."
    return "\n".join(output)

def product_complain_tool(query: str) -> str:
    print(query)

    return "Vui lòng điền thông tin vào form, bạn sẽ được nhận được cuộc gọi tư vấn hỗ trợ trong vòng 48 giờ tiếp theo."



