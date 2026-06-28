from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.copilot import CopilotAgent
from app.database import DatabaseManager

router = APIRouter(prefix="/copilot", tags=["copilot"])

class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = "default"

@router.post("/query")
async def ask_copilot(req: QuestionRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return await CopilotAgent.ask_question(req.question, req.session_id)

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    return DatabaseManager.get_chat_history(session_id)
