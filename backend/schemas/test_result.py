from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from .student_answer import StudentAnswerCreate

class TestSubmission(BaseModel):
    test_id: int
    answers: List[StudentAnswerCreate]

class TestResultResponse(BaseModel):
    id: int
    user_id: int
    test_id: int
    score: float
    category_breakdown: Optional[Dict[str, Any]]
    recommendation: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True