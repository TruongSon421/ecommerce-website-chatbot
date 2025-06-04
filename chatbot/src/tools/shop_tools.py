def shop_information_tool(query: str) -> str:
    with open('/home/kltn2025/ecommerce-website-chatbot/chatbot/src/rag/shop_document.txt','r',encoding='utf-8') as f:
        shop_doc = f.read()


    return f"Dựa vào tài liệu sau về thông tin của cửa hàng để trả lời cho người dùng: {shop_doc}"