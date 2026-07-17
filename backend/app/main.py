from dotenv import load_dotenv

load_dotenv()

import os
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.dependencies import get_current_user
from app.models.user import User
from app.routers import ai_chat, analytics, auth, budgets, categories, entries

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
