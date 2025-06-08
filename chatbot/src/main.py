import asyncio
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS  # Add CORS import
from google.adk.sessions import DatabaseSessionService
from google.adk.tools import ToolContext

from google.adk.runners import Runner
from agents.coordinator import coordinator
from db.mysql import init_mysql, create_flask_app
from google.genai.types import Content, Part
from asgiref.wsgi import WsgiToAsgi
import os
from dotenv import load_dotenv
from share_data import current_group_ids, filter_params
from filter.preprocess import Filter  # Import Filter class

# Configure logging to avoid TypeError
logging.getLogger('').handlers = []
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8')
    ]
)
flask_logger = logging.getLogger('werkzeug')
flask_logger.handlers = []
flask_logger.setLevel(logging.INFO)
flask_logger.addHandler(logging.FileHandler('app.log', encoding='utf-8'))

load_dotenv()

# Khởi tạo Flask và MySQL
app = create_flask_app()
CORS(app, resources={
    r"/*": {  # Thay đổi từ r"/api/*" thành r"/*"
        "origins": [
            "http://localhost:5173",
            "http://localhost:8070",  # API Gateway
            "http://host.docker.internal:8070",  # API Gateway từ Docker perspective
            "https://dca8-42-116-6-46.ngrok-free.app",
            "https://*.ngrok-free.app"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Khởi tạo DatabaseSessionService với PostgreSQL
db_url = os.getenv("POSTGRES_DB_URL")
if not db_url:
    raise ValueError("POSTGRES_DB_URL not set in .env")
session_service = DatabaseSessionService(db_url=db_url)
app_name = "kltn_ecommerce"

# Predefined responses for different filter results
FILTER_RESPONSES = {
    0: {
        "vie": "Xin lỗi, tôi không thể xử lý nội dung chứa từ ngữ không phù hợp. Vui lòng sử dụng ngôn từ lịch sự.",
        "eng": "Sorry, I cannot process content with inappropriate language. Please use polite language."
    },
    1: {
        "vie": "Xin lỗi, tôi chỉ hỗ trợ tiếng Việt và tiếng Anh. Vui lòng sử dụng một trong hai ngôn ngữ này.",
        "eng": "Sorry, I only support Vietnamese and English. Please use one of these languages."
    },
    2: {
        "vie": "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn mua sắm và trả lời các câu hỏi về cửa hàng. Bạn cần hỗ trợ gì hôm nay?",
        "eng": "Hello! I'm your AI assistant. I can help you search for products, provide shopping advice, and answer questions about our store. What can I help you with today?"
    }
}

def get_default_language_response(filter_code: int) -> str:
    """Get default response when language detection fails"""
    responses = FILTER_RESPONSES.get(filter_code, {})
    return responses.get("vie", "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.")

async def call_agent_async(user_id: str, session_id: str, access_token: str, query: str):
    """Gọi agent với user_id, session_id, và query từ request."""
    print(f"\n>>> User Query: user_id={user_id}, session_id={session_id}, query={query}")

    # Kiểm tra hoặc tạo session
    session = session_service.get_session(
        app_name=app_name,
        user_id=user_id,
        session_id=session_id
    )
    if not session:
        print(f"Creating new session for user_id={user_id}, session_id={session_id}")
        session = session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state={
                "access_token": access_token,
                "user_id": user_id
            },
        )
    print(f"Session state: {session.state}")
    
    # Tạo runner
    runner = Runner(
        agent=coordinator,
        app_name=app_name,
        session_service=session_service
    )
    
    # Chuẩn bị nội dung
    content = Content(role='user', parts=[Part(text=query)])
    final_response_text = "Agent did not produce a final response."
    
    with app.app_context():  # Cần ngữ cảnh Flask cho flaskext.mysql
        async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_response_text = event.content.parts[0].text
                elif event.actions and event.actions.escalate:
                    final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                break

    return final_response_text

@app.route('/query', methods=['POST'])
async def handle_query():
    """Xử lý request POST chứa user_id, session_id, và query với filter."""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        session_id = data.get('session_id')
        query = data.get('query')
        access_token = data.get('access_token')
        
        if not all([user_id, session_id, query]):
            return jsonify({"error": "Missing user_id, session_id, or query"}), 400
        
        print(f"\n>>> Processing query: {query}")
        
        # Thực hiện filter query trước khi gửi đến agent
        try:
            filter_result = Filter.filter_query(query)
            print(f">>> Filter result: {filter_result}")
            
            # Xử lý kết quả filter
            if isinstance(filter_result, int):
                # Trường hợp filter trả về code lỗi (0, 1, 2)
                filter_code = filter_result
                detected_lang = "vie"  # Default language
                
                if filter_code in FILTER_RESPONSES:
                    response_text = get_default_language_response(filter_code)
                    print(f">>> Filtered query blocked with code {filter_code}")
                    
                    return jsonify({
                        "response": response_text,
                        "group_ids": [],
                        "filter_params": [],
                        "filter_applied": True,
                        "filter_code": filter_code
                    })
            
            elif isinstance(filter_result, tuple) and len(filter_result) == 2:
                # Trường hợp filter trả về (3, userLang) - query hợp lệ
                filter_code, detected_lang = filter_result
                
                if filter_code == 3:
                    print(f">>> Query passed filter. Detected language: {detected_lang}")
                    # Tiếp tục xử lý với agent
                    response = await call_agent_async(user_id, session_id, access_token, query)
                    
                    # Lấy dữ liệu từ shared variables
                    temp1 = current_group_ids.copy()
                    temp2 = filter_params.copy()
                    current_group_ids.clear()
                    filter_params.clear()
                    
                    print("group_ids:", temp1, "filter_params:", temp2)
                    
                    return jsonify({
                        "response": response,
                        "group_ids": temp1,
                        "filter_params": temp2,
                        "filter_applied": False,
                        "detected_language": detected_lang
                    })
            
            # Trường hợp không xác định được kết quả filter
            print(">>> Unknown filter result, using default error response")
            return jsonify({
                "response": "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.",
                "group_ids": [],
                "filter_params": [],
                "filter_applied": True,
                "filter_code": -1
            })
            
        except Exception as filter_error:
            print(f">>> Filter error: {str(filter_error)}")
            logging.error(f"Filter processing error: {str(filter_error)}")
            
            # Nếu filter bị lỗi, vẫn cho phép query đi qua (fallback)
            print(">>> Filter failed, proceeding with agent call")
            response = await call_agent_async(user_id, session_id, access_token, query)
            
            temp1 = current_group_ids.copy()
            temp2 = filter_params.copy()
            current_group_ids.clear()
            filter_params.clear()
            
            return jsonify({
                "response": response,
                "group_ids": temp1,
                "filter_params": temp2,
                "filter_applied": False,
                "filter_error": str(filter_error)
            })
            
    except Exception as e:
        print(f">>> General error: {str(e)}")
        logging.error(f"General processing error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/test', methods=['GET'])
async def test():
    """Test endpoint to verify server is running."""
    logging.info("Test endpoint accessed")
    return jsonify({"message": "hello"})

@app.route('/test-filter', methods=['POST'])
async def test_filter():
    """Test endpoint để kiểm tra filter functionality."""
    try:
        data = request.get_json()
        query = data.get('query')
        
        if not query:
            return jsonify({"error": "Missing query"}), 400
        
        # Test filter
        filter_result = Filter.filter_query(query)
        
        # Test individual components
        sensitive_check = Filter.check_sensitive_words(query)
        greeting_check = Filter.check_common_greetings(query)
        lang_check = Filter.check_lang(query)
        
        return jsonify({
            "query": query,
            "filter_result": filter_result,
            "sensitive_words": {
                "found": sensitive_check[0],
                "words": sensitive_check[1]
            },
            "is_greeting": {
                "found": greeting_check[0],
                "words": greeting_check[1]
            },
            "language_detection": lang_check
        })
        
    except Exception as e:
        return jsonify({"error": f"Filter test error: {str(e)}"}), 500

# Vòng lặp tương tác (cho mục đích kiểm tra)
async def main_loop():
    print("Nhập thông tin request (gõ 'exit' hoặc 'quit' để thoát):")
    while True:
        user_id = input(">>> User ID: ").strip()
        if user_id.lower() in ['exit', 'quit']:
            print("Đã thoát chương trình.")
            break
        session_id = input(">>> Session ID: ").strip()
        query = input(">>> Query: ").strip()
        
        # Test filter trước
        try:
            filter_result = Filter.filter_query(query)
            print(f"Filter result: {filter_result}")
            
            if isinstance(filter_result, tuple) and filter_result[0] == 3:
                print("Query passed filter, calling agent...")
                with app.app_context():
                    await call_agent_async(user_id, session_id, "", query)
            else:
                print(f"Query blocked by filter with code: {filter_result}")
        except Exception as e:
            print(f"Filter error: {e}")

# Chuyển đổi Flask app sang ASGI
asgi_app = WsgiToAsgi(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:asgi_app", host="localhost", port=5500, reload=True)