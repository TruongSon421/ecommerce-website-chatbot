# app.py

from flask import Flask, request, jsonify
from concurrent.futures import ThreadPoolExecutor
from agents.llama_agent import process_chat
from filter.preprocess import Filter
from dotenv import load_dotenv
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.llms import ChatMessage
from flaskext.mysql import MySQL
from db import init_mysql
import os
from flask_cors import CORS
from shared_data import CURRENT_REQUEST_GROUP_IDS

load_dotenv()
app = Flask(__name__)
CORS(app)
executor = ThreadPoolExecutor()
init_mysql(app)
memory_buffers = {}

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    query = data.get("message", "")
    thread_id = data.get("thread_id", "1")

    # Kiểm tra filter
    filter_result = Filter.filter_query(query=query)
    if filter_result == 0:
        return jsonify({
            "role": "assistant",
            "content": "Trong input có chứa từ nhạy cảm"
        })
    elif filter_result == 1:
        return jsonify({
            "role": "assistant",
            "content": "Chỉ hỗ trợ ngôn ngữ Tiếng Việt và Tiếng Anh"
        })
    elif filter_result == 2:
        return jsonify({
            "role": "assistant",
            "content": "Xin chào tôi là NextUS, trợ lý ảo thông minh với các tính năng ..."
        })
    
    if not query:
        return jsonify({"error": "Missing query parameter"}), 400

    # Initialize or get ChatMemoryBuffer for the thread_id
    if thread_id not in memory_buffers:
        memory_buffers[thread_id] = ChatMemoryBuffer.from_defaults(token_limit=40000)
    
    memory = memory_buffers[thread_id]

    # Get current chat history
    chat_history = memory.get_all()

    # Xử lý chat sử dụng LlamaIndex agent trong thread riêng
    future = executor.submit(process_chat_sync, query, chat_history, filter_result[1])
    response = future.result()
    
    # Update memory with new messages
    memory.put(ChatMessage(role="user", content=query))
    memory.put(ChatMessage(role="assistant", content=str(response)))
    temp = CURRENT_REQUEST_GROUP_IDS.copy()
    CURRENT_REQUEST_GROUP_IDS.clear()
    # Prepare response with groupids
    response_data = {
        "role": "assistant",
        "content": str(response),
        "groupids": temp  
    }    
    
    return jsonify(response_data)

def process_chat_sync(query, history, language):
    """Synchronous wrapper for the async process_chat function"""
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(process_chat(query, history, language))
    loop.close()
    return result

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)