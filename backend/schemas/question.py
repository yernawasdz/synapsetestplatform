from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class QuestionCreate(BaseModel):
    test_id: int
    category_id: int
    text: str
    image_url: Optional[str] = None
    table_data: Optional[Dict[str, Any]] = None
    options: List[str]
    correct_answer: str

class QuestionUpdate(BaseModel):
    category_id: Optional[int] = None
    text: Optional[str] = None
    image_url: Optional[str] = None
    table_data: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None

class QuestionResponse(BaseModel):
    id: int
    test_id: int
    category_id: int
    text: str
    image_url: Optional[str]
    table_data: Optional[Dict[str, Any]]
    options: List[str]
    correct_answer: Optional[str] = None  # Hidden for students during test

    class Config:
        from_attributes = True