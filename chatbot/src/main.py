import asyncio
import logging
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS  # Add CORS import
from google.adk.sessions import DatabaseSessionService
from google.adk.tools import ToolContext
from google.adk.events import Event, EventActions
import time
from google.adk.runners import Runner
from agents.coordinator import coordinator
from db.mysql import init_mysql, create_flask_app
from google.genai.types import Content, Part
from asgiref.wsgi import WsgiToAsgi
import os
from dotenv import load_dotenv
from share_data import current_group_ids, filter_params, selected_item_keys
from filter.preprocess import Filter  # Import Filter class

# Import RAG functions
from rag.rag_app import (
    remove_detail_link, 
    handle_empty_value, 
    merge_product_configs, 
    create_document,
    es  
)

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
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Thêm PUT, DELETE
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
    },
    1: {
        "vie": "Xin lỗi, tôi chỉ hỗ trợ tiếng Việt và tiếng Anh. Vui lòng sử dụng một trong hai ngôn ngữ này.",
    },
    2: {
        "vie": "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn mua sắm và trả lời các câu hỏi về cửa hàng. Bạn cần hỗ trợ gì hôm nay?",
    }
}

def get_default_language_response(filter_code: int) -> str:
    """Get default response when language detection fails"""
    responses = FILTER_RESPONSES.get(filter_code, {})
    return responses.get("vie", "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.")


    

async def call_agent_async(user_id: str, session_id: str, access_token: str, query: str, detected_lang: str = "vie"):
    """Gọi agent với user_id, session_id, query và detected_lang từ request."""
    print(f"\n>>> User Query: user_id={user_id}, session_id={session_id}, query={query}, language={detected_lang}")

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
                "user_id": user_id,
                "detected_language": detected_lang,
            },
        )
    else:
        # Cập nhật detected_language vào session state sử dụng EventActions.state_delta
        
        
        current_time = time.time()
        state_changes = {
            "detected_language": detected_lang
        }
        
        actions_with_update = EventActions(state_delta=state_changes)
        
        system_event = Event(
            invocation_id=f"lang_update_{int(current_time)}",
            author="system",
            actions=actions_with_update,
            timestamp=current_time
        )
        
        session_service.append_event(session, system_event)
        print(f"Updated detected_language to: {detected_lang}")
        
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
            print(event)
            function_responses = event.get_function_responses()
            if function_responses:
                for func_resp in function_responses:
                    if func_resp.name == "redirect_to_checkout":
                        tool_output = func_resp.response
                        if tool_output.get("action") == "checkout_redirect" and tool_output.get("status") == "success":
                            selected_item_keys.extend(tool_output.get("selected_item_keys", []))
                            final_response_text = tool_output.get("message", "Đang chuyển hướng đến trang thanh toán...")
                            return final_response_text
               
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_response_text = event.content.parts[0].text
                elif event.actions and event.actions.escalate:
                    final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                break
            

    return final_response_text

# ===== MAIN CHATBOT ENDPOINTS =====
chatbot_bp = Blueprint('api', __name__, url_prefix='/api/chatbot')

@chatbot_bp.route('/')
def root():
    """Root endpoint"""
    return jsonify({
        "message": "E-commerce Chatbot API with integrated RAG",
        "version": "1.0.0",
        "services": ["chatbot", "rag"]
    })

@chatbot_bp.route('/health')
def health():
    """Health check endpoint"""
    try:
        # Check Elasticsearch connection
        es_status = "connected" if es.ping() else "disconnected"
    except:
        es_status = "error"
    
    return jsonify({
        "status": "healthy",
        "services": ["chatbot", "rag"],
        "elasticsearch": es_status,
        "port": 5500
    })

def preprocess_query(query):
   """
   Tiền xử lý query trước khi đưa vào filter
   
   Args:
       query (str): Query gốc từ người dùng
       
   Returns:
       str: Query đã được tiền xử lý
   """
   if not query or not isinstance(query, str):
       return ""
   
   # 1. Loại bỏ khoảng trắng đầu và cuối
   processed_query = query.strip()
   
   # 2. Chuẩn hóa khoảng trắng giữa các từ (multiple spaces → single space)
   processed_query = ' '.join(processed_query.split())
   
   # 3. Loại bỏ các ký tự điều khiển và ký tự ẩn
   processed_query = ''.join(char for char in processed_query if ord(char) >= 32)
   
   # 4. Giới hạn độ dài query tối đa (tùy chọn)
   max_length = 1000  # Có thể điều chỉnh
   if len(processed_query) > max_length:
       processed_query = processed_query[:max_length].strip()
   
   return processed_query
   
@chatbot_bp.route('/query', methods=['POST'])
async def handle_query():
    """Xử lý request POST chứa user_id, session_id, và query với preprocessing và filter."""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        session_id = data.get('session_id')
        query = data.get('query')
        access_token = data.get('access_token')
        
        if not all([user_id, session_id, query]):
            return jsonify({"error": "Missing user_id, session_id, or query"}), 400
        
        print(f"\n>>> Processing query: {query}")
        
        # BƯỚC 1: Tiền xử lý query
        try:
            preprocessed_query = preprocess_query(query)
            print(f">>> Preprocessed query: '{preprocessed_query}' (original: '{query}')")           
            
        except Exception as preprocess_error:
            print(f">>> Preprocessing error: {str(preprocess_error)}")
            # Nếu preprocessing lỗi, dùng query gốc
            preprocessed_query = query.strip()
        
        # BƯỚC 3: Thực hiện filter query đã được tiền xử lý
        try:
            filter_result = Filter.filter_query(preprocessed_query)
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
                        "selected_item_keys": [],
                        "filter_applied": True,
                        "filter_code": filter_code
                    })
            
            elif isinstance(filter_result, tuple) and len(filter_result) == 2:
                # Trường hợp filter trả về (3, userLang) - query hợp lệ
                filter_code, detected_lang = filter_result
                
                if filter_code == 3:
                    print(f">>> Query passed filter. Detected language: {detected_lang}")
                    
                    # Tiếp tục xử lý với agent (sử dụng query đã preprocessing)
                    response = await call_agent_async(user_id, session_id, access_token, preprocessed_query, detected_lang)
                    print(f"Final response text: {response}")
                    
                    # Lấy dữ liệu từ shared variables
                    temp1 = current_group_ids.copy()
                    temp2 = filter_params.copy()
                    temp3 = selected_item_keys.copy()
                    current_group_ids.clear()
                    filter_params.clear()
                    selected_item_keys.clear()
                    
                    print("group_ids:", temp1, "filter_params:", temp2)
                    
                    return jsonify({
                        "response": response,
                        "group_ids": temp1,
                        "filter_params": temp2,
                        "selected_item_keys": temp3,
                        "filter_applied": False,
                        "detected_language": detected_lang,
                        "filter_reason": "max_confidence_low" if max([prob for _, prob in Filter.check_lang(preprocessed_query)]) < 0.55 else "language_detected"
                    })
            
            # Trường hợp không xác định được kết quả filter
            print(">>> Unknown filter result, using default error response")
            return jsonify({
                "response": "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.",
                "group_ids": [],
                "filter_params": [],
                "selected_item_keys": [],
                "filter_applied": True,
                "filter_code": -1
            })
            
        except Exception as filter_error:
            print(f">>> Filter error: {str(filter_error)}")
            logging.error(f"Filter processing error: {str(filter_error)}")
            
            # Nếu filter bị lỗi, vẫn cho phép query đi qua (fallback)
            print(">>> Filter failed, proceeding with agent call")
            response = await call_agent_async(user_id, session_id, access_token, preprocessed_query, "vie")
            
            temp1 = current_group_ids.copy()
            temp2 = filter_params.copy()
            current_group_ids.clear()
            filter_params.clear()
            
            return jsonify({
                "response": response,
                "group_ids": temp1,
                "filter_params": temp2,
                "selected_item_keys": [],
                "filter_applied": False,
                "filter_error": str(filter_error)
            })
            
    except Exception as e:
        print(f">>> General error: {str(e)}")
        logging.error(f"General processing error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500





@chatbot_bp.route('/test', methods=['GET'])
async def test():
    """Test endpoint to verify server is running."""
    logging.info("Test endpoint accessed")
    return jsonify({"message": "hello"})

@chatbot_bp.route('/test-filter', methods=['POST'])
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

# ===== RAG ENDPOINTS =====
rag_bp = Blueprint('rag', __name__, url_prefix='/api/chatbot/rag')

@rag_bp.route('/add-to-elasticsearch', methods=['POST'])
def add_to_elasticsearch():
    """Thêm document vào Elasticsearch"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        document, group_id, group_name, product_type = create_document(data)
        
        es_doc = {
            "document": document,
            "group_id": group_id,
            "name": group_name,
            "type": product_type
        }
        
        response = es.index(index="products_new", body=es_doc)
        
        return jsonify({
            "message": "Document added to Elasticsearch successfully",
            "id": response["_id"],
            "document": document
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/delete-from-elasticsearch/<doc_id>', methods=['DELETE'])
def delete_from_elasticsearch(doc_id):
    """Xóa document khỏi Elasticsearch theo ID"""
    try:
        if not es.exists(index="products_new", id=doc_id):
            return jsonify({"error": "Document not found"}), 404
        
        response = es.delete(index="products_new", id=doc_id)
        
        return jsonify({
            "message": "Document deleted successfully",
            "id": doc_id,
            "result": response["result"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/delete-by-group-id/<group_id>', methods=['DELETE'])
def delete_by_group_id(group_id):
    """Xóa documents theo group_id"""
    try:
        search_query = {
            "query": {
                "term": {
                    "group_id": group_id
                }
            }
        }
        
        response = es.delete_by_query(index="products_new", body=search_query)
        
        if response["deleted"] == 0:
            return jsonify({"error": "No documents found with the given group_id"}), 404
        
        return jsonify({
            "message": f"Deleted {response['deleted']} document(s) successfully",
            "group_id": group_id,
            "deleted_count": response["deleted"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/update-elasticsearch/<doc_id>', methods=['PUT'])
def update_elasticsearch(doc_id):
    """Cập nhật document theo ID"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        if not es.exists(index="products_new", id=doc_id):
            return jsonify({"error": "Document not found"}), 404
        
        document, group_id, group_name, product_type = create_document(data)
        
        es_doc = {
            "document": document,
            "group_id": group_id,
            "name": group_name,
            "type": product_type
        }
        
        response = es.update(index="products_new", id=doc_id, body={"doc": es_doc})
        
        return jsonify({
            "message": "Document updated successfully",
            "id": doc_id,
            "document": document,
            "result": response["result"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/update-by-group-id/<group_id>', methods=['PUT'])
def update_by_group_id(group_id):
    """Cập nhật documents theo group_id"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        search_query = {
            "query": {
                "term": {
                    "group_id": group_id
                }
            }
        }
        
        search_response = es.search(index="products_new", body=search_query)
        
        if search_response["hits"]["total"]["value"] == 0:
            return jsonify({"error": "No documents found with the given group_id"}), 404
        
        document, new_group_id, group_name, product_type = create_document(data)
        
        es_doc = {
            "document": document,
            "group_id": new_group_id,
            "name": group_name,
            "type": product_type
        }
        
        update_query = {
            "script": {
                "source": """
                    ctx._source.document = params.document;
                    ctx._source.group_id = params.group_id;
                    ctx._source.name = params.name;
                    ctx._source.type = params.type;
                """,
                "params": es_doc
            },
            "query": {
                "term": {
                    "group_id": group_id
                }
            }
        }
        
        response = es.update_by_query(index="products_new", body=update_query)
        
        return jsonify({
            "message": f"Updated {response['updated']} document(s) successfully",
            "group_id": group_id,
            "updated_count": response["updated"],
            "document": document
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/get-document/<doc_id>', methods=['GET'])
def get_document(doc_id):
    """Lấy document theo ID"""
    try:
        if not es.exists(index="products_new", id=doc_id):
            return jsonify({"error": "Document not found"}), 404
        
        response = es.get(index="products_new", id=doc_id)
        
        return jsonify({
            "id": doc_id,
            "document": response["_source"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/search-documents', methods=['GET'])
def search_documents():
    """Tìm kiếm documents"""
    try:
        query = request.args.get('q', '')
        size = int(request.args.get('size', 10))
        from_param = int(request.args.get('from', 0))
        
        if not query:
            search_body = {
                "query": {"match_all": {}},
                "size": size,
                "from": from_param
            }
        else:
            search_body = {
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["document", "name", "type"]
                    }
                },
                "size": size,
                "from": from_param
            }
        
        response = es.search(index="products_new", body=search_body)
        
        results = []
        for hit in response["hits"]["hits"]:
            results.append({
                "id": hit["_id"],
                "score": hit["_score"],
                "source": hit["_source"]
            })
        
        return jsonify({
            "total": response["hits"]["total"]["value"],
            "results": results
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route('/health', methods=['GET'])
def rag_health():
    """Health check cho RAG service"""
    try:
        if es.ping():
            return jsonify({
                "status": "healthy", 
                "service": "rag", 
                "elasticsearch": "connected"
            }), 200
        else:
            return jsonify({
                "status": "unhealthy", 
                "service": "rag", 
                "elasticsearch": "disconnected"
            }), 503
    except Exception as e:
        return jsonify({
            "status": "error", 
            "service": "rag", 
            "error": str(e)
        }), 503

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
                    await call_agent_async(user_id, session_id, "", query, filter_result[1] if len(filter_result) > 1 else "vie")
            else:
                print(f"Query blocked by filter with code: {filter_result}")
        except Exception as e:
            print(f"Filter error: {e}")

app.register_blueprint(chatbot_bp)
app.register_blueprint(rag_bp)

# Chuyển đổi Flask app sang ASGI
asgi_app = WsgiToAsgi(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:asgi_app", host="0.0.0.0", port=5500, reload=True)