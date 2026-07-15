from datetime import datetime
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None

class ChatResponse(BaseModel):
    conversation_id: int
    response: str

class MessageResponse(BaseModel):
    role: str
    content: str
    created_at: datetime

class ConversationHistoryResponse(BaseModel):
    conversation_id: int
    messages: list[MessageResponse]