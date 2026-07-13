from pydantic import BaseModel, field_validator
from app.models.enums import EntryType


class CategoryCreate(BaseModel):
    name: str
    entry_type: EntryType

    @field_validator("entry_type", mode="before")
    @classmethod
    def normalize_entry_type(cls, value):
        if isinstance(value, str):
            return value.lower().strip()
        return value


class CategoryUpdate(BaseModel):
    name: str | None = None
    entry_type: EntryType | None = None

    @field_validator("entry_type", mode="before")
    @classmethod
    def normalize_entry_type(cls, value):
        if isinstance(value, str):
            return value.lower().strip()
        return value


class CategoryResponse(BaseModel):
    id: int
    name: str
    entry_type: EntryType
    user_id: int | None

    class Config:
        from_attributes = True