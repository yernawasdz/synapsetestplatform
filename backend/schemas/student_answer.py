from pydantic import BaseModel
from datetime import datetime

class StudentAnswerCreate(BaseModel):
    question_id: int
    answer: str

class StudentAnswerResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    answer: str
    is_correct: bool
    answered_at: datetime

    class Config:
        from_attributes = True