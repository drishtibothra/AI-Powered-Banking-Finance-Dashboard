from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.ai_conversation import AIConversation
from app.models.ai_message import AIMessage
from app.models.enums import MessageRole
from app.schemas.ai_chat import ChatRequest, ChatResponse, ConversationHistoryResponse, MessageResponse
from app.services.agent_service import run_agent_chat

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = run_agent_chat(db, current_user.id, payload.message, payload.conversation_id)
    return ChatResponse(**result)


@router.get("/conversations/{conversation_id}", response_model=ConversationHistoryResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = db.query(AIConversation).filter(
        AIConversation.id == conversation_id, AIConversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(AIMessage).filter(
        AIMessage.conversation_id == conversation.id, AIMessage.role != MessageRole.tool
    ).order_by(AIMessage.created_at.asc()).all()

    return ConversationHistoryResponse(
        conversation_id=conversation.id,
        messages=[MessageResponse(role=m.role.value, content=m.content, created_at=m.created_at) for m in messages],
    )