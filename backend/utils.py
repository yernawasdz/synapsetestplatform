from typing import Dict, Any, List
from models.category import Category
from models.question import Question
from models.student_answer import StudentAnswer
from sqlalchemy.orm import Session

def calculate_category_breakdown(
    db: Session, 
    student_answers: List[StudentAnswer], 
    test_id: int
) -> Dict[str, Any]:
    """
    Calculate category-wise performance breakdown for a student's test submission.
    """
    category_scores = {}
    
    # Get all questions for this test with their categories
    questions = db.query(Question).filter(Question.test_id == test_id).all()
    
    for answer in student_answers:
        question = next((q for q in questions if q.id == answer.question_id), None)
        if not question:
            continue
            
        category = db.query(Category).filter(Category.id == question.category_id).first()
        if not category:
            continue
            
        category_name = category.name
        
        if category_name not in category_scores:
            category_scores[category_name] = {"correct": 0, "total": 0}
        
        category_scores[category_name]["total"] += 1
        if answer.is_correct:
            category_scores[category_name]["correct"] += 1
    
    # Calculate percentages
    category_breakdown = {}
    for category_name, scores in category_scores.items():
        percentage = (scores["correct"] / scores["total"]) * 100 if scores["total"] > 0 else 0
        category_breakdown[category_name] = {
            "correct": scores["correct"],
            "total": scores["total"],
            "percentage": round(percentage, 2)
        }
    
    return category_breakdown

def validate_test_submission(questions: List[Question], answers: List[Any]) -> bool:
    """
    Validate that all questions in the test have been answered.
    """
    question_ids = {q.id for q in questions}
    answer_question_ids = {a.question_id for a in answers}
    
    return question_ids == answer_question_ids