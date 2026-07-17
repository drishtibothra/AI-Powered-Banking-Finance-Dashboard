# Pre-defining some of the IMPORTANT values using ENUM:

import enum


class EntryType(str, enum.Enum):
    income = "income"
    expense = "expense"
    savings = "savings"


class Frequency(str, enum.Enum):
    one_time = "one_time"
    recurring_monthly = "recurring_monthly"


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    tool = "tool"
