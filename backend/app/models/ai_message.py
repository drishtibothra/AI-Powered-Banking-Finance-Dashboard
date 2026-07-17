# AI_messages model (table):

from app.core.database import Base
from app.models.enums import MessageRole
from sqlalchemy import (JSON, Column, DateTime, Enum, ForeignKey, Integer,
                        String)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)

    role = Column(Enum(MessageRole), nullable=False)
    content = Column(String, nullable=False)
    tool_calls = Column(JSON, nullable=True)  # stores tool call name + args + result

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("AIConversation", back_populates="messages")
