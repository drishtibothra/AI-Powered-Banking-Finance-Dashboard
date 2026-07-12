from datetime import date
from app.core.database import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.entry import Entry
from app.models.enums import EntryType, Frequency

db = SessionLocal()

# Creating user
test_user = User(email="test@example.com", hashed_password="fakehashedpassword123")
db.add(test_user)
db.commit()
db.refresh(test_user)
print(f"Created user: {test_user.id} - {test_user.email}")

# Creating categories:
food = Category(user_id=test_user.id, name="Food", entry_type=EntryType.expense)
rent = Category(user_id=test_user.id, name="Rent", entry_type=EntryType.expense)
salary = Category(user_id=test_user.id, name="Salary", entry_type=EntryType.income)
savings = Category(user_id=test_user.id, name="Bank Savings", entry_type=EntryType.savings)

db.add_all([food, rent, salary, savings])
db.commit()
for cat in [food, rent, salary, savings]:
    db.refresh(cat)
print(f"Created categories: {[c.name for c in [food, rent, salary, savings]]}")

# Creating entries:
entries = [
    Entry(user_id=test_user.id, category_id=food.id, amount=5000, entry_type=EntryType.expense,
          description="Groceries", date=date(2026, 7, 1), frequency=Frequency.one_time),
    Entry(user_id=test_user.id, category_id=rent.id, amount=25000, entry_type=EntryType.expense,
          description="Monthly rent", date=date(2026, 7, 1), frequency=Frequency.recurring_monthly, recurrence_day=1),
    Entry(user_id=test_user.id, category_id=salary.id, amount=80000, entry_type=EntryType.income,
          description="Monthly salary", date=date(2026, 7, 1), frequency=Frequency.recurring_monthly, recurrence_day=1),
    Entry(user_id=test_user.id, category_id=savings.id, amount=50000, entry_type=EntryType.savings,
          description="Savings deposit", date=date(2026, 7, 1), frequency=Frequency.recurring_monthly, recurrence_day=1),
]

db.add_all(entries)
db.commit()
print(f"Created {len(entries)} entries")

# Verification:
all_entries = db.query(Entry).filter(Entry.user_id == test_user.id).all()
print("\n--- Verification ---")
for e in all_entries:
    print(f"{e.category.name}: ₹{e.amount} ({e.entry_type.value}, {e.frequency.value})")

db.close()