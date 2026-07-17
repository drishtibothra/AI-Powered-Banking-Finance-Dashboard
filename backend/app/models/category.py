# Categories model (table):

from app.core.database import Base
from app.models.enums import EntryType
from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    entry_type = Column(Enum(EntryType), nullable=False)

    user = relationship("User", back_populates="categories")
    entries = relationship("Entry", back_populates="category")
    budgets = relationship("Budget", back_populates="category")
