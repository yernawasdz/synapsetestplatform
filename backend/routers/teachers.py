from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from database import get_db
from models.user import User, UserRole
from models.category import Category
from models.test import Test
from models.question import Question
from models.student_answer import StudentAnswer
from models.test_result import TestResult
from schemas.user import UserCreate, UserResponse
from schemas.category import CategoryCreate, CategoryResponse
from schemas.test import TestCreate, TestResponse, TestUpdate
from schemas.question import QuestionCreate, QuestionResponse, QuestionUpdate
from schemas.test_result import TestResultResponse
from dependencies.auth_dependencies import require_teacher
from auth.password import hash_password

router = APIRouter(prefix="/teacher", tags=["teachers"])

# User Management
@router.post("/users/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Convert role string to proper enum value to ensure consistency
    from models.user import UserRole
    if isinstance(user.role, str):
        role_value = UserRole.STUDENT if user.role.lower() == 'student' else UserRole.TEACHER
    else:
        role_value = user.role
    
    db_user = User(
        username=user.username,
        password_hash=hash_password(user.password),
        role=role_value,  # Use the proper enum value
        name=user.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    users = db.query(User).all()
    return users

# Category Management
@router.post("/categories/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories/", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    categories = db.query(Category).all()
    return categories

@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_category.name = category.name
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}

# Test Management
@router.post("/tests/", response_model=TestResponse)
def create_test(
    test: TestCreate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_test = Test(
        title=test.title,
        description=test.description,
        created_by=current_teacher.id
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

@router.get("/tests/", response_model=List[TestResponse])
def get_tests(
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    tests = db.query(Test).all()
    return tests

@router.get("/tests/{test_id}", response_model=TestResponse)
def get_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.put("/tests/{test_id}", response_model=TestResponse)
def update_test(
    test_id: int,
    test_update: TestUpdate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_test = db.query(Test).filter(Test.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    if test_update.title is not None:
        db_test.title = test_update.title
    if test_update.description is not None:
        db_test.description = test_update.description
    
    db.commit()
    db.refresh(db_test)
    return db_test

@router.delete("/tests/{test_id}")
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_test = db.query(Test).filter(Test.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    db.delete(db_test)
    db.commit()
    return {"message": "Test deleted successfully"}

# Question Management
@router.post("/questions/", response_model=QuestionResponse)
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_question = Question(
        test_id=question.test_id,
        category_id=question.category_id,
        text=question.text,
        image_url=question.image_url,
        table_data=question.table_data,
        options=question.options,
        correct_answer=question.correct_answer
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/questions/", response_model=List[QuestionResponse])
def get_questions(
    test_id: int = None,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    query = db.query(Question)
    if test_id:
        query = query.filter(Question.test_id == test_id)
    questions = query.all()
    return questions

@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    question_update: QuestionUpdate,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    update_data = question_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_question, field, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(db_question)
    db.commit()
    return {"message": "Question deleted successfully"}

# Student Review
@router.get("/student/{user_id}/test/{test_id}")
def get_student_test_answers(
    user_id: int,
    test_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    student = db.query(User).filter(User.id == user_id, User.role == UserRole.STUDENT).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get all questions for this test
    questions = db.query(Question).filter(Question.test_id == test_id).all()
    
    # Get student's answers
    answers = db.query(StudentAnswer).filter(
        StudentAnswer.user_id == user_id,
        StudentAnswer.question_id.in_([q.id for q in questions])
    ).all()
    
    # Get test result
    test_result = db.query(TestResult).filter(
        TestResult.user_id == user_id,
        TestResult.test_id == test_id
    ).first()
    
    return {
        "student": student,
        "test": test,
        "questions": questions,
        "answers": answers,
        "result": test_result
    }

@router.get("/student/{user_id}/results")
def get_student_results(
    user_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    # Get student
    student = db.query(User).filter(User.id == user_id, User.role == UserRole.STUDENT).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get all test results for this student
    results = db.query(TestResult).filter(TestResult.user_id == user_id).all()
    
    # Get test details for each result
    results_with_tests = []
    for result in results:
        test = db.query(Test).filter(Test.id == result.test_id).first()
        results_with_tests.append({
            "id": result.id,
            "test_id": result.test_id,
            "test_title": test.title if test else f"Test {result.test_id}",
            "score": result.score,
            "timestamp": result.timestamp
        })
    
    return {
        "student": student,
        "results": results_with_tests
    }

@router.put("/test-result/{result_id}/recommendation")
def update_recommendation(
    result_id: int,
    recommendation: str,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    test_result = db.query(TestResult).filter(TestResult.id == result_id).first()
    if not test_result:
        raise HTTPException(status_code=404, detail="Test result not found")
    
    test_result.recommendation = recommendation
    db.commit()
    db.refresh(test_result)
    return test_result

# Export test results to CSV
@router.get("/tests/{test_id}/export-results")
def export_test_results(
    test_id: int,
    db: Session = Depends(get_db),
    current_teacher: User = Depends(require_teacher)
):
    # Get test details
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get all test results for this test
    test_results = db.query(TestResult).filter(TestResult.test_id == test_id).all()
    
    if not test_results:
        raise HTTPException(status_code=404, detail="No results found for this test")
    
    # Get all categories used in this test to determine columns
    questions = db.query(Question).filter(Question.test_id == test_id).all()
    category_ids = list(set([q.category_id for q in questions if q.category_id]))
    categories = db.query(Category).filter(Category.id.in_(category_ids)).all() if category_ids else []
    category_names = [cat.name for cat in categories]
    
    # Create CSV data
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    header = ["Name", "Username", "Overall Score (%)"] + [f"{cat_name} Score (%)" for cat_name in category_names]
    writer.writerow(header)
    
    # Write data rows
    for result in test_results:
        user = result.user
        row = [
            user.name,
            user.username,
            f"{result.score:.1f}"
        ]
        
        # Add category scores
        category_breakdown = result.category_breakdown or {}
        for cat_name in category_names:
            # Find category score in breakdown
            category_score = ""
            if category_breakdown and cat_name in category_breakdown:
                score_data = category_breakdown[cat_name]
                if isinstance(score_data, dict) and 'percentage' in score_data:
                    category_score = f"{score_data['percentage']:.1f}"
                elif isinstance(score_data, (int, float)):
                    category_score = f"{score_data:.1f}"
                else:
                    category_score = str(score_data) if score_data else ""
            row.append(category_score)
        
        writer.writerow(row)
    
    # Prepare response
    output.seek(0)
    
    # Create filename with test title
    safe_title = "".join(c for c in test.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
    filename = f"{safe_title}_results.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )