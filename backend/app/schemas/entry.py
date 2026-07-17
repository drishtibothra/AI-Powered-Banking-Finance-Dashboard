from datetime import date as Date
from decimal import Decimal

from app.models.enums import EntryType, Frequency
from pydantic import BaseModel, field_validator


class EntryCreate(BaseModel):
    category_id: int
    amount: Decimal
    entry_type: EntryType
    description: str | None = None
    date: Date
    frequency: Frequency = Frequency.one_time
    recurrence_day: int | None = None

    @field_validator("entry_type", "frequency", mode="before")
    @classmethod
    def normalize_enums(cls, value):
        if isinstance(value, str):
            return value.lower().strip()
        return value

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, value):
        if value <= 0:
            raise ValueError("Amount must be greater than 0")
        return value


class EntryUpdate(BaseModel):
    category_id: int | None = None
    amount: Decimal | None = None
    entry_type: EntryType | None = None
    description: str | None = None
    date: Date | None = None
    frequency: Frequency | None = None
    recurrence_day: int | None = None

    @field_validator("entry_type", "frequency", mode="before")
    @classmethod
    def normalize_enums(cls, value):
        if isinstance(value, str):
            return value.lower().strip()
        return value


class EntryResponse(BaseModel):
    id: int
    category_id: int
    amount: Decimal
    entry_type: EntryType
    description: str | None
    date: Date
    frequency: Frequency
    recurrence_day: int | None

    class Config:
        from_attributes = True
