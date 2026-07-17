from decimal import Decimal

from pydantic import BaseModel, field_validator


class BudgetCreate(BaseModel):
    category_id: int
    limit_amount: Decimal
    month: int
    year: int

    @field_validator("limit_amount")
    @classmethod
    def limit_must_be_positive(cls, value):
        if value <= 0:
            raise ValueError("Limit amount must be greater than 0")
        return value

    @field_validator("month")
    @classmethod
    def month_must_be_valid(cls, value):
        if not (1 <= value <= 12):
            raise ValueError("Month must be between 1 and 12")
        return value


class BudgetUpdate(BaseModel):
    limit_amount: Decimal | None = None

    @field_validator("limit_amount")
    @classmethod
    def limit_must_be_positive(cls, value):
        if value is not None and value <= 0:
            raise ValueError("Limit amount must be greater than 0")
        return value


class BudgetResponse(BaseModel):
    id: int
    category_id: int
    limit_amount: Decimal
    month: int
    year: int

    class Config:
        from_attributes = True
