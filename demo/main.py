from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from OpenAPI import Chat

load_dotenv("agent/.env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



Chat.register_websocket(app) 

@app.get("/")
async def root():
    return {"message": "Xin chào! Tôi là trợ lý ảo của NEXUS. Tôi có thể giúp gì cho bạn?"}


