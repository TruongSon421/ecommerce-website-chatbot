import asyncio
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS  # Add CORS import
from google.adk.sessions import DatabaseSessionService
from google.adk.runners import Runner
from agents.coordinator import coordinator
from db.mysql import init_mysql, create_flask_app
from google.genai.types import Content, Part
from asgiref.wsgi import WsgiToAsgi
import os
from dotenv import load_dotenv
from shared_data import CURRENT_FILTERS_PARAMS, CURRENT_REQUEST_GROUP_IDS

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
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})  # Enable CORS for /api/* endpoints

# Khởi tạo DatabaseSessionService với PostgreSQL
db_url = os.getenv("POSTGRES_DB_URL")
if not db_url:
    raise ValueError("POSTGRES_DB_URL not set in .env")
session_service = DatabaseSessionService(db_url=db_url)
app_name = "kltn_ecommerce"

async def call_agent_async(user_id: str, session_id: str, query: str):
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
            session_id=session_id
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
    
    print(f"<<< Agent Response: {final_response_text}")
    return final_response_text

@app.route('/api/query', methods=['POST'])
async def handle_query():
    """Xử lý request POST chứa user_id, session_id, và query."""
    data = request.get_json()
    user_id = data.get('user_id')
    session_id = data.get('session_id')
    query = data.get('query')
    
    if not all([user_id, session_id, query]):
        return jsonify({"error": "Missing user_id, session_id, or query"}), 400
    
    response = await call_agent_async(user_id, session_id, query)
    temp1 = CURRENT_REQUEST_GROUP_IDS.copy()
    temp2 = CURRENT_FILTERS_PARAMS.copy()

    # Dọn dẹp sau khi dùng
    CURRENT_REQUEST_GROUP_IDS.clear()
    CURRENT_FILTERS_PARAMS.clear()

    return jsonify({
        "response": response,
        "group_ids": temp1,
        "filter_params": temp2
    })

@app.route('/api/test_session', methods=['POST'])
async def test_session():
    """Kiểm tra hoặc tạo session với user_id và session_id."""
    data = request.get_json()
    user_id = data.get('user_id')
    session_id = data.get('session_id')
    
    if not all([user_id, session_id]):
        return jsonify({"error": "Missing user_id or session_id"}), 400
    
    try:
        with app.app_context():
            # Kiểm tra session
            session = session_service.get_session(
                app_name=app_name,
                user_id=user_id,
                session_id=session_id
            )
            if not session:
                logging.info(f"Creating new session for user_id={user_id}, session_id={session_id}")
                session = session_service.create_session(
                    app_name=app_name,
                    user_id=user_id,
                    session_id=session_id
                )
            
            # Trả về thông tin session
            session_info = {
                "app_name": app_name,
                "user_id": user_id,
                "session_id": session_id,
                "state": session.state,
                "create_time": str(session.create_time) if session.create_time else None,
                "update_time": str(session.update_time) if session.update_time else None
            }
            return jsonify({"status": "success", "session": session_info})
    
    except Exception as e:
        logging.error(f"Error in test_session: {str(e)}")
        return jsonify({"error": f"Failed to process session: {str(e)}"}), 500

@app.route('/test', methods=['GET'])
async def test():
    """Test endpoint to verify server is running."""
    logging.info("Test endpoint accessed")
    return jsonify({"message": "hello"})

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
        
        with app.app_context():
            await call_agent_async(user_id, session_id, query)

# Chuyển đổi Flask app sang ASGI
asgi_app = WsgiToAsgi(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(asgi_app, host="0.0.0.0", port=5000)