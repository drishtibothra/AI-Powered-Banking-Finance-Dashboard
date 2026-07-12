from app.core.database import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.entry import Entry

db = SessionLocal()
existing_user = db.query(User).filter(User.email == "test@example.com").first()
if existing_user:
    db.query(Entry).filter(Entry.user_id == existing_user.id).delete()
    db.query(Category).filter(Category.user_id == existing_user.id).delete()
    db.delete(existing_user)
    db.commit()
    print("Cleaned up.")
else:
    print("No existing test user found.")
db.close()