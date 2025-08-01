from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .question import QuestionResponse

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class TestResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    questions: Optional[List[QuestionResponse]] = None

    class Config:
        from_attributes = True