from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models.user import User
from models.test import Test
from models.question import Question
from models.student_answer import StudentAnswer
from models.test_result import TestResult
from models.category import Category
from schemas.test import TestResponse
from schemas.question import QuestionResponse
from schemas.test_result import TestSubmission, TestResultResponse
from schemas.student_answer import StudentAnswerResponse
from dependencies.auth_dependencies import require_student, get_current_user

router = APIRouter(prefix="/student", tags=["students"])

@router.get("/available-tests/", response_model=List[TestResponse])
def get_available_tests(
    db: Session = Depends(get_db),
    current_student: User = Depends(require_student)
):
    tests = db.query(Test).all()
    return tests

@router.get("/test/{test_id}/questions", response_model=List[QuestionResponse])
def get_test_questions(
    test_id: int,
    db: Session = Depends(get_db),
    current_student: User = Depends(require_student)
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    questions = db.query(Question).filter(Question.test_id == test_id).all()
    
    # Hide correct answers from students during test and add "Не знаю" option
    for question in questions:
        question.correct_answer = None
        # Add "Не знаю" option if it's not already present
        if "Не знаю" not in question.options:
            question.options.append("Не знаю")
    
    return questions

@router.post("/submit-test/", response_model=TestResultResponse)
def submit_test(
    submission: TestSubmission,
    db: Session = Depends(get_db),
    current_student: User = Depends(require_student)
):
    # Check if test exists
    test = db.query(Test).filter(Test.id == submission.test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Check if student has already submitted this test
    existing_result = db.query(TestResult).filter(
        TestResult.user_id == current_student.id,
        TestResult.test_id == submission.test_id
    ).first()
    
    if existing_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Test already submitted"
        )
    
    # Get all questions for this test
    questions = db.query(Question).filter(Question.test_id == submission.test_id).all()
    questions_dict = {q.id: q for q in questions}
    
    # Process answers and calculate score
    correct_answers = 0
    total_questions = len(questions)
    category_scores = {}
    
    for answer in submission.answers:
        question = questions_dict.get(answer.question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid question ID: {answer.question_id}"
            )
        
        is_correct = answer.answer == question.correct_answer
        if is_correct:
            correct_answers += 1
        
        # Track category performance
        category = db.query(Category).filter(Category.id == question.category_id).first()
        if category:
            if category.name not in category_scores:
                category_scores[category.name] = {"correct": 0, "total": 0}
            category_scores[category.name]["total"] += 1
            if is_correct:
                category_scores[category.name]["correct"] += 1
        
        # Save student answer
        student_answer = StudentAnswer(
            user_id=current_student.id,
            question_id=answer.question_id,
            answer=answer.answer,
            is_correct=is_correct
        )
        db.add(student_answer)
    
    # Calculate overall score
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    # Calculate category breakdown
    category_breakdown = {}
    for category_name, scores in category_scores.items():
        percentage = (scores["correct"] / scores["total"]) * 100 if scores["total"] > 0 else 0
        category_breakdown[category_name] = {
            "correct": scores["correct"],
            "total": scores["total"],
            "percentage": percentage
        }
    
    # Save test result
    test_result = TestResult(
        user_id=current_student.id,
        test_id=submission.test_id,
        score=score,
        category_breakdown=category_breakdown
    )
    db.add(test_result)
    db.commit()
    db.refresh(test_result)
    
    return test_result

@router.get("/results/{test_id}", response_model=TestResultResponse)
def get_test_result(
    test_id: int,
    db: Session = Depends(get_db),
    current_student: User = Depends(require_student)
):
    test_result = db.query(TestResult).filter(
        TestResult.user_id == current_student.id,
        TestResult.test_id == test_id
    ).first()
    
    if not test_result:
        raise HTTPException(status_code=404, detail="Test result not found")
    
    return test_result

@router.get("/results/{test_id}/detailed")
def get_detailed_result(
    test_id: int,
    db: Session = Depends(get_db),
    current_student: User = Depends(require_student)
):
    # Get test result
    test_result = db.query(TestResult).filter(
        TestResult.user_id == current_student.id,
        TestResult.test_id == test_id
    ).first()
    
    if not test_result:
        raise HTTPException(status_code=404, detail="Test result not found")
    
    # Get test
    test = db.query(Test).filter(Test.id == test_id).first()
    
    # Get questions and answers
    questions = db.query(Question).filter(Question.test_id == test_id).all()
    answers = db.query(StudentAnswer).filter(
        StudentAnswer.user_id == current_student.id,
        StudentAnswer.question_id.in_([q.id for q in questions])
    ).all()
    
    # Create answers lookup
    answers_dict = {a.question_id: a for a in answers}
    
    # Build detailed response
    detailed_questions = []
    for question in questions:
        student_answer = answers_dict.get(question.id)
        detailed_questions.append({
            "question": question,
            "student_answer": student_answer.answer if student_answer else None,
            "correct_answer": question.correct_answer,
            "is_correct": student_answer.is_correct if student_answer else False
        })
    
    return {
        "test": test,
        "result": test_result,
        "questions": detailed_questions
    }

@router.get("/my-results/", response_model=List[TestResultResponse])
def get_my_results(
    db: Session = Depends(get_db),
    current_student: User = Depends(require_student)
):
    results = db.query(TestResult).filter(TestResult.user_id == current_student.id).all()
    return results