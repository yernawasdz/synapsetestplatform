from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    text = Column(Text, nullable=False)
    image_url = Column(String)
    table_data = Column(JSON)  # Store table data as JSON
    options = Column(JSON, nullable=False)  # Array of answer options
    correct_answer = Column(String, nullable=False)

    # Relationships
    test = relationship("Test", back_populates="questions")
    category = relationship("Category", back_populates="questions")
    student_answers = relationship("StudentAnswer", back_populates="question")