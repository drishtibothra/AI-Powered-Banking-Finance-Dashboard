from fastapi import FastAPI
from app.routers import auth

from app.core.dependencies import get_current_user
from app.models.user import User
from fastapi import Depends

app = FastAPI(title="AI-Powered Banking & Finance Dashboard")
 
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "API is running"}


@app.get("/auth/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}