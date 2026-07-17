from decimal import Decimal

from pydantic import BaseModel


class SummaryResponse(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_expense: Decimal
    total_savings: Decimal
    net_free_balance: Decimal


class TrendPoint(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_expense: Decimal
    total_savings: Decimal


class CategoryBreakdownItem(BaseModel):
    category_id: int
    category_name: str
    total_amount: Decimal


class BurnRateResponse(BaseModel):
    current_balance: Decimal
    average_daily_spend: Decimal
    days_remaining: float | None
