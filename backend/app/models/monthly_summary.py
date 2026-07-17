# Monthly_summaries model (table):

from app.core.database import Base
from sqlalchemy import Column, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship


class MonthlySummary(Base):
    __tablename__ = "monthly_summaries"
    __table_args__ = (
        UniqueConstraint("user_id", "month", "year", name="uq_user_month_year"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    total_income = Column(Numeric(12, 2), default=0)
    total_expense = Column(Numeric(12, 2), default=0)
    total_savings = Column(Numeric(12, 2), default=0)
    net_free_balance = Column(Numeric(12, 2), default=0)

    user = relationship("User", back_populates="monthly_summaries")
