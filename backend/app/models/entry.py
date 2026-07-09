# Entries model (table):

from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, Enum, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.enums import EntryType, Frequency

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