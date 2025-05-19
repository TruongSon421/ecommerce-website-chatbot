from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig
from google.adk.sessions.in_memory_session_service import InMemorySessionService
import json
import asyncio
import os
from dotenv import load_dotenv
from google.genai.types import Part, Content
from fastapi.responses import StreamingResponse
from agent.agent import root_agent
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

load_dotenv("agent/.env")
APP_NAME = "ADK HTTP example"
session_service = InMemorySessionService()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for request and response
class MessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    message: str
    groupids: List[str] = []
    turn_complete: bool = False
    interrupted: bool = False
    error: Optional[str] = None

def start_agent_session(session_id: str):
    print(f"Starting agent session for session_id: {session_id}")
    try:
        session = session_service.create_session(
            app_name=APP_NAME,
            user_id=session_id,
            session_id=session_id,
            state={"current_group_ids": []},
        )
        runner = Runner(
            app_name=APP_NAME,
            agent=root_agent,
            session_service=session_service,
        )
        return session, runner
    except Exception as e:
        print(f"Error in start_agent_session: {e}")
        raise

async def process_agent_response(live_events, session_id: str):
    session = session_service.get_session(app_name=APP_NAME, user_id=session_id, session_id=session_id)
    try:
        async with asyncio.timeout(30.0):  # 30 second timeout
            async for event in live_events:
                print(f"Event received: {event.__dict__}")
                
                # For streaming intermediate responses if needed
                # Not implemented in this basic version
                
                if event.is_final_response():
                    text = None
                    if event.content and event.content.parts and event.content.parts[0].text:
                        text = event.content.parts[0].text
                    elif event.actions and event.actions.escalate:
                        text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                    
                    if text:
                        groupids = session.state["current_group_ids"]
                        print(f"[AGENT RESPONSE]: {text}, groupids={groupids}")
                        return {"message": text, "groupids": groupids, "turn_complete": True}
                    break

                if event.interrupted:
                    groupids = session.state.get("current_group_ids", [])
                    return {"interrupted": True, "groupids": groupids}
                    
    except asyncio.TimeoutError:
        print(f"Timeout processing events for session_id: {session_id}")
        return {"error": "Agent response timeout"}
    except Exception as e:
        print(f"Error processing events: {e}")
        return {"error": str(e)}
    
    return {"error": "No response generated"}

@app.post("/init_session/{session_id}")
async def init_session(session_id: str):
    try:
        session, runner = start_agent_session(session_id)
        return {"status": "success", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize session: {str(e)}")

@app.post("/chat/{session_id}", response_model=MessageResponse)
async def chat_endpoint(session_id: str, request: MessageRequest):
    try:
        # Get or create session and runner
        try:
            session = session_service.get_session(app_name=APP_NAME, user_id=session_id, session_id=session_id)
            runner = Runner(
                app_name=APP_NAME,
                agent=root_agent,
                session_service=session_service,
            )
        except:
            session, runner = start_agent_session(session_id)
        
        text = request.message
        content = Content(role="user", parts=[Part.from_text(text=text)])
        run_config = RunConfig(response_modalities=["TEXT"])
        
        try:
            print(f"[CLIENT TO AGENT]: {text}")
            live_events = runner.run_async(
                user_id=session_id,
                session_id=session_id,
                new_message=content,
                run_config=run_config,
            )
            
            # Process the agent's response
            response = await process_agent_response(live_events, session_id)
            return MessageResponse(**response)
            
        except Exception as e:
            print(f"Error in run_async: {e}")
            return MessageResponse(error=f"Failed to process message: {str(e)}")
            
    except Exception as e:
        print(f"Error in chat_endpoint: {e}")
        return MessageResponse(error=str(e))

# Optional streaming endpoint if needed
@app.post("/chat/{session_id}/stream")
async def stream_chat_endpoint(session_id: str, request: MessageRequest):
    async def event_generator():
        try:
            session = session_service.get_session(app_name=APP_NAME, user_id=session_id, session_id=session_id)
            runner = Runner(
                app_name=APP_NAME,
                agent=root_agent,
                session_service=session_service,
            )
            
            text = request.message
            content = Content(role="user", parts=[Part.from_text(text=text)])
            run_config = RunConfig(response_modalities=["TEXT"])
            
            live_events = runner.run_async(
                user_id=session_id,
                session_id=session_id,
                new_message=content,
                run_config=run_config,
            )
            
            async for event in live_events:
                if event.is_final_response():
                    text = None
                    if event.content and event.content.parts and event.content.parts[0].text:
                        text = event.content.parts[0].text
                    elif event.actions and event.actions.escalate:
                        text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                    
                    if text:
                        groupids = session.state["current_group_ids"]
                        yield f"data: {json.dumps({'message': text, 'groupids': groupids, 'turn_complete': True})}\n\n"
                    break
                
                # You could yield intermediate results here if needed
                
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream") 