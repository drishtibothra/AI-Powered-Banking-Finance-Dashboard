# Entries model (table):

from app.core.database import Base
from app.models.enums import EntryType, Frequency
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    amount = Column(Numeric(12, 2), nullable=False)
    entry_type = Column(Enum(EntryType), nullable=False)
    description = Column(String, nullable=True)
    date = Column(Date, nullable=False)

    frequency = Column(Enum(Frequency), nullable=False, default=Frequency.one_time)
    recurrence_day = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="entries")
    category = relationship("Category", back_populates="entries")

    embedding = Column(Vector(3072), nullable=True)
