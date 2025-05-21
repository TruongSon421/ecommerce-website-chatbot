from fastapi import FastAPI, WebSocket, WebSocketDisconnect, FastAPI
from google.adk.runners import Runner
from google.adk.agents.run_config import RunConfig
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.memory.in_memory_memory_service import InMemoryMemoryService
from google.adk.events import Event, EventActions
import json
import asyncio
import traceback
from dotenv import load_dotenv
from google.genai.types import Part, Content, FunctionResponse
from agent.agent import root_agent
from helper.auth import is_pending_auth_event, get_function_call_id, get_function_call_auth_config, get_user_input

load_dotenv("agent/.env")
APP_NAME = "NEXUS Assistant Virtual Agent"
session_service = InMemorySessionService()
artifacts_service = InMemoryArtifactService()
memory_service = InMemoryMemoryService()
active_connections = {}

def start_agent_session(user_id: str, session_id: str):
    """Khởi tạo session với cả user_id và session_id"""
    print(f"Starting agent session for user: {user_id}, session: {session_id}")
    is_guest = user_id.startswith("guest-")
    try:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,  # Sử dụng user_id được truyền vào
            session_id=session_id,
            state={
                "current_group_ids": [],
                "access_token": None,
                "guest_id": user_id,
                "is_guest": is_guest  # Đánh dấu session này của guest hay user đã xác thực
            },
        )
        runner = Runner(
            app_name=APP_NAME,
            agent=root_agent,
            session_service=session_service,
            artifact_service=artifacts_service,
            memory_service=memory_service,
        )
        return session, runner
    except Exception as e:
        print(f"Error in start_agent_session: {e}")
        raise

async def process_events(websocket: WebSocket, live_events, user_id: str, session_id: str):
    auth_request_event_id, auth_config = None, None
    session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    try:
        async with asyncio.timeout(30.0):  # Timeout 30 giây
            async for event in live_events:
                print(f"==== EVENT RECEIVED ====")
                print(f"Event Type: {type(event)}")
                print(f"Event Content: {event.__dict__}")
                
                if hasattr(event, 'content') and event.content:
                    print(f"Content Parts: {event.content.parts}")
                    if event.content.parts:
                        for i, part in enumerate(event.content.parts):
                            print(f"Part {i} Type: {type(part)}")
                            print(f"Part {i} Content: {part.__dict__}")
                
                print(f"==== END EVENT RECEIVED ====")
                
                groupids = session.state["current_group_ids"]
                if is_pending_auth_event(event):
                    print("==== AUTHENTICATION EVENT DETECTED ====")
                    auth_request_event_id = get_function_call_id(event)
                    auth_config = get_function_call_auth_config(event)
                    
                    # Xem chi tiết nội dung function call
                    function_call_info = None
                    if hasattr(event, 'content') and event.content and event.content.parts:
                        for part in event.content.parts:
                            if hasattr(part, 'function_call') and part.function_call:
                                function_call_info = part.function_call.__dict__
                    
                    print(f"Function Call Details: {function_call_info}")
                    print(f"Auth Request ID: {auth_request_event_id}")
                    print(f"Auth Config: {auth_config}")
                    print("==== END AUTHENTICATION EVENT ====")
                    
                    # Thông báo cho frontend rằng cần token để xác thực
                    await websocket.send_text(json.dumps({
                        "auth_required": True,
                        "auth_request_id": auth_request_event_id,
                        "message": "Bạn cần đăng nhập để thực hiện hành động này"
                    }))
                    
                    # Lưu thông tin yêu cầu xác thực vào session bằng EventActions.state_delta
                    state_delta = {
                        "auth_request_event_id": auth_request_event_id,
                        "auth_config": auth_config.model_dump() if auth_config and hasattr(auth_config, "model_dump") else auth_config,
                        "pending_function_call": function_call_info
                    }
                    
                    # Tạo một Event mới với state_delta và append vào session
                    state_update_event = Event(
                        author="system",
                        actions=EventActions(state_delta=state_delta)
                    )
                    session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
                    session_service.append_event(
                        session=session,
                        event=state_update_event
                    )
                    
                    # Lưu toàn bộ event gốc vào session để có thể khôi phục sau khi xác thực
                    orig_event_store = Event(
                        author="system",
                        actions=EventActions(state_delta={"original_auth_event": event.__dict__})
                    )
                    session_service.append_event(
                        session=session,
                        event=orig_event_store
                    )
                    
                    print(f"Auth event and function call saved to session state for later retrieval")
                    break

                print(f"Event received: {event.__dict__}")
                if event.is_final_response():
                    text = None
                    if event.content and event.content.parts and event.content.parts[0].text:
                        text = event.content.parts[0].text
                    elif event.actions and event.actions.escalate:
                        text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                    if text:
                        await websocket.send_text(json.dumps({"message": text, "groupids": groupids}))
                        print(f"[AGENT TO CLIENT]: {text}, groupids={groupids}")
                        await websocket.send_text(json.dumps({"turn_complete": True, "groupids": groupids}))
                        print(f"[FINAL RESPONSE], groupids={groupids}")
                        
                        # Lưu cuộc hội thoại này vào memory service sau khi hoàn thành
                        try:
                            # Lấy session hiện tại với tất cả các events mới nhất
                            session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
                            
                            # Thêm session này vào memory service
                            print(f"Adding session {session_id} to memory service")
                            memory_service.add_session_to_memory(
                                session=session
                            )
                        except Exception as e:
                            print(f"Error adding session to memory: {e}")
                    break  # Thoát sau khi nhận final response

                if event.interrupted:
                    groupids = session.state.get("current_group_ids", [])
                    await websocket.send_text(json.dumps({"interrupted": True, "groupids": groupids}))
    except asyncio.TimeoutError:
        print(f"Timeout processing events for session_id: {session_id}")
        await websocket.send_text(json.dumps({"error": "Agent response timeout"}))
    except Exception as e:
        print(f"Error processing events: {e}")
        await websocket.send_text(json.dumps({"error": str(e)}))


async def process_token_auth(websocket: WebSocket, token: str, user_id: str, session_id: str):
    """Xử lý xác thực khi nhận được token từ client"""
    try:
        # Lấy session hiện tại
        session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
        runner = Runner(
            app_name=APP_NAME,
            agent=root_agent,
            session_service=session_service,
            artifact_service=artifacts_service,
        )
        
        # Lấy thông tin yêu cầu xác thực từ session
        auth_request_event_id = session.state.get("auth_request_event_id")
        auth_config = session.state.get("auth_config")
        pending_function_call = session.state.get("pending_function_call")
        previous_user_id = session.state.get("previous_user_id") # Lấy từ message frontend nếu có
        
        print(f"==== AUTH DEBUG INFO ====")
        print(f"user_id: {user_id}")
        print(f"previous_user_id: {previous_user_id}")
        print(f"session_id: {session_id}")
        print(f"auth_request_event_id: {auth_request_event_id}")
        print(f"auth_config: {auth_config}")
        print(f"pending_function_call: {pending_function_call}")
        print(f"==== END AUTH DEBUG INFO ====")
        
        if not auth_request_event_id:
            print("Không tìm thấy yêu cầu xác thực đang chờ xử lý, kiểm tra lịch sử session")
            
            # Nếu có previous_user_id, kiểm tra đầu tiên
            old_session = None
            if previous_user_id:
                try:
                    print(f"Tìm kiếm session cũ với previous_user_id={previous_user_id}")
                    old_session = session_service.get_session(app_name=APP_NAME, user_id=previous_user_id, session_id=session_id)
                    print(f"Tìm thấy session cũ với previous_user_id={previous_user_id}")
                except Exception as e:
                    print(f"Không tìm thấy session với previous_user_id={previous_user_id}: {e}")
            
            # Nếu không tìm thấy với previous_user_id, tìm tất cả sessions
            if old_session is None:
                # Thử tìm kiếm các session có cùng session_id nhưng khác user_id
                all_sessions = session_service.list_sessions(app_name=APP_NAME)
                old_user_id = None
                
                print(f"Đang tìm kiếm trong {len(all_sessions)} sessions...")
                for s in all_sessions:
                    if s.session_id == session_id and s.user_id != user_id:
                        print(f"Tìm thấy session cũ: user_id={s.user_id}, session_id={s.session_id}")
                        old_user_id = s.user_id
                        old_session = s
                        break
                    
            if old_session:
                old_user_id = old_session.user_id
                print(f"Sao chép thông tin xác thực từ session cũ (user_id={old_user_id}) sang session mới (user_id={user_id})")
                # Lấy thông tin xác thực từ session cũ
                auth_request_event_id = old_session.state.get("auth_request_event_id")
                auth_config = old_session.state.get("auth_config")
                pending_function_call = old_session.state.get("pending_function_call")
                
                if not auth_request_event_id:
                    await websocket.send_text(json.dumps({"error": "Không tìm thấy yêu cầu xác thực trong session cũ"}))
                    return
                
                # Sao chép tất cả thông tin trạng thái từ session cũ sang session mới
                for key, value in old_session.state.items():
                    if key not in session.state and key != "user_id":
                        state_delta = {key: value}
                        state_update_event = Event(
                            author="system",
                            actions=EventActions(state_delta=state_delta)
                        )
                        session_service.append_event(
                            session=session,
                            event=state_update_event
                        )
                        print(f"Đã sao chép trạng thái {key} từ session cũ")
                
                # Sao chép thông tin event từ session cũ sang session mới
                for event in old_session.events:
                    session_service.append_event(
                        session=session,
                        event=event
                    )
                
                print(f"Đã sao chép {len(old_session.events)} events từ session cũ sang session mới")
            else:
                await websocket.send_text(json.dumps({"error": "Không tìm thấy yêu cầu xác thực nào đang chờ xử lý"}))
                return
        
        # Lưu token vào session bằng EventActions.state_delta
        state_delta = {
            "access_token": token,
            "is_guest": False,
        }
        
        # Tạo một Event mới với state_delta và append vào session
        state_update_event = Event(
            author="system",
            actions=EventActions(state_delta=state_delta)
        )
        session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
        session_service.append_event(
            session=session,
            event=state_update_event
        )
        
        # Tạo response cho yêu cầu xác thực
        auth_response = {
            "token_type": "Bearer",
            "access_token": token
        }
        
        # Tạo FunctionResponse để gửi lại cho agent
        auth_content = Content(
            role='user',
            parts=[
                Part(
                    function_response=FunctionResponse(
                        id=auth_request_event_id,
                        name='adk_request_credential',
                        response=auth_response,
                    )
                )
            ],
        )
        
        # Gửi thông tin xác thực đến agent và tiếp tục xử lý
        run_config = RunConfig(response_modalities=["TEXT"])
        # Sử dụng user_id hiện tại (đã cập nhật) để xác thực
        live_events = runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=auth_content,
            run_config=run_config,
        )
        
        print(f"==== RESUMING AGENT ====")
        print(f"User: {user_id}")
        print(f"Session: {session_id}")
        print(f"Auth token applied, continuing authentication flow")
        print(f"==== END RESUMING AGENT ====")
        
        await process_events(websocket, live_events, user_id, session_id)
        
    except Exception as e:
        print(f"Error processing token auth: {e}")
        print(f"Full exception details: {traceback.format_exc()}")
        await websocket.send_text(json.dumps({"error": str(e)}))


async def agent_to_client_messaging(websocket: WebSocket, event_queue: asyncio.Queue, user_id: str, session_id: str):
    while True:
        try:
            live_events = await event_queue.get()
            print(f"Processing new live_events for session_id: {session_id}")
            asyncio.create_task(process_events(websocket, live_events, user_id, session_id))
            event_queue.task_done()
        except WebSocketDisconnect:
            print(f"WebSocket disconnected in agent_to_client_messaging for session_id: {session_id}")
            break
        except Exception as e:
            print(f"Error in agent_to_client_messaging: {e}")
            await websocket.send_text(json.dumps({"error": str(e)}))
            break

async def client_to_agent_messaging(websocket: WebSocket, runner: Runner, user_id: str, session_id: str, event_queue: asyncio.Queue):
    while True:
        try:
            data = await websocket.receive_text()
            print(f"Received data: {data}")
            try:
                data = json.loads(data)
                
                # Cập nhật user_id từ message nếu có
                message_user_id = data.get("user_id")
                if message_user_id and message_user_id != user_id:
                    print(f"Updating user_id from {user_id} to {message_user_id}")
                    user_id = message_user_id
                    
                # Cập nhật token trong session nếu có trong message
                access_token = data.get("access_token")
                if access_token:
                    # Lấy message_user_id từ access_token (thường là từ frontend sau khi đăng nhập)
                    message_user_id = data.get("user_id")
                    session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
                    previous_token = session.state.get("access_token")
                    
                    # Kiểm tra xem đây có phải là lần đăng nhập mới không
                    is_new_login = previous_token is None or (message_user_id and message_user_id != user_id)
                    
                    if message_user_id and message_user_id != user_id:
                        print(f"User login detected: Updating user_id from {user_id} to {message_user_id} in session {session_id}")
                        # Cập nhật biến user_id trong hàm để sử dụng cho các tương tác tiếp theo
                        # Lưu ý: Session ID vẫn giữ nguyên, chỉ có user ID thay đổi
                        user_id = message_user_id
                    
                    # Cập nhật token và user_id vào session bằng EventActions.state_delta
                    state_delta = {
                        "access_token": access_token,
                        "user_id": message_user_id,
                        "is_guest": False,
                    }
                    
                    # Tạo một Event mới với state_delta và append vào session
                    state_update_event = Event(
                        author="system",
                        actions=EventActions(state_delta=state_delta)
                    )
                    session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
                    session_service.append_event(
                        session=session,
                        event=state_update_event
                    )
                    print(f"Updated access token for session {session_id} (user now: {user_id})")
                    
                    # Chỉ gửi thông báo đăng nhập thành công khi thực sự là đăng nhập mới
                    if is_new_login:
                        await websocket.send_text(json.dumps({
                            "message": "Đăng nhập thành công! Bạn có thể tiếp tục cuộc trò chuyện.",
                            "login_success": True,
                            "user_id": user_id,  # Gửi user_id đã cập nhật về client
                            "groupids": session.state.get("current_group_ids", [])
                        }))
                
                # Kiểm tra nếu đây là response đến yêu cầu xác thực
                if data.get("type") == "auth_response" and data.get("token"):
                    token = data.get("token")
                    
                    # Khi nhận token từ frontend sau khi đăng nhập,
                    # lưu thông tin previous_user_id vào session mới
                    if data.get("previous_user_id"):
                        previous_user_id = data.get("previous_user_id")
                        print(f"Nhận thông tin previous_user_id={previous_user_id} từ client")
                        
                        # Lưu previous_user_id để dùng trong process_token_auth
                        state_delta = {
                            "previous_user_id": previous_user_id
                        }
                        state_update_event = Event(
                            author="system",
                            actions=EventActions(state_delta=state_delta)
                        )
                        session = session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
                        session_service.append_event(
                            session=session,
                            event=state_update_event
                        )
                    
                    await process_token_auth(websocket, token, user_id, session_id)
                    continue
                
                # Xử lý tin nhắn chính
                text = data.get("message", "")
                if not text.strip():
                    # Nếu không có tin nhắn, chỉ cập nhật token/user_id
                    if access_token or message_user_id:
                        await websocket.send_text(json.dumps({"connection_status": "updated"}))
                    continue
                
            except json.JSONDecodeError:
                text = data
                await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
                continue
                
            content = Content(role="user", parts=[Part.from_text(text=text)])
            run_config = RunConfig(response_modalities=["TEXT"])
            try:
                # Sử dụng user_id đã cập nhật (có thể từ message) cho request tới agent
                live_events = runner.run_async(
                    user_id=user_id,
                    session_id=session_id,
                    new_message=content,
                    run_config=run_config,
                )
                print(f"[CLIENT TO AGENT]: {text} (user_id: {user_id})")
                await event_queue.put(live_events)
            except Exception as e:
                print(f"Error in run_async: {e}")
                await websocket.send_text(json.dumps({"error": f"Failed to process message: {str(e)}"}))
            await asyncio.sleep(0)
        except WebSocketDisconnect:
            print(f"WebSocket disconnected in client_to_agent_messaging for session_id: {session_id}")
            break
        except Exception as e:
            print(f"Error in client_to_agent_messaging: {e}")
            await websocket.send_text(json.dumps({"error": str(e)}))
            break
        
def register_websocket(app: FastAPI):
    @app.websocket("/chat/{user_id}/{session_id}")
    async def websocket_endpoint(websocket: WebSocket, user_id: str, session_id: str):
        print(f"Received WebSocket request for session_id: {session_id}, user_id: {user_id}")
        print(f"Headers: {websocket.headers}")
        try:
            await websocket.accept()
            active_connections[session_id] = websocket
            print(f"Client #{session_id} connected")
            
            session, runner = start_agent_session(user_id, session_id)
            
            event_queue = asyncio.Queue()
            client_to_agent_task = asyncio.create_task(
                client_to_agent_messaging(websocket, runner, user_id, session_id, event_queue)
            )
            agent_to_client_task = asyncio.create_task(
                agent_to_client_messaging(websocket, event_queue, user_id, session_id)
            )
            await asyncio.gather(client_to_agent_task, agent_to_client_task)
        except WebSocketDisconnect:
            print(f"WebSocket disconnected for session_id: {session_id}")
        except Exception as e:
            print(f"Error in websocket_endpoint: {e}")
            await websocket.send_text(json.dumps({"error": str(e)}))
        finally:
            print(f"Client #{session_id} disconnected")