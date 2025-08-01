from pydantic import BaseModel
from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole
    name: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: UserRole
    name: str

    class Config:
        from_attributes = True