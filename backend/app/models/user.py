# Users model (table):

from app.core.database import Base
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    oauth_provider = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    categories = relationship("Category", back_populates="user")
    entries = relationship("Entry", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    monthly_summaries = relationship("MonthlySummary", back_populates="user")
    ai_conversations = relationship("AIConversation", back_populates="user")
