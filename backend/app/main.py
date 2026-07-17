from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi import Depends
from app.core.dependencies import get_current_user
from app.models.user import User
from fastapi.middleware.cors import CORSMiddleware
import os

# Authorization:
from app.routers import auth
# Categories:
from app.routers import categories
# Entries:
from app.routers import entries
# Budgets:
from app.routers import budgets
# Analytics:
from app.routers import analytics
# AI Chat:
from app.routers import ai_chat

app = FastAPI(title="AI-Powered Banking & Finance Dashboard")

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(entries.router)
app.include_router(budgets.router)
app.include_router(analytics.router)
app.include_router(ai_chat.router)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/auth/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}