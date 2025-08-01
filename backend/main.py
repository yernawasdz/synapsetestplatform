from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from database import engine, get_db, Base
from models import User, Category, Test, Question, StudentAnswer, TestResult
from models.user import UserRole
from routers import auth_router, teachers_router, students_router
from routers.upload import router as upload_router
from auth.password import hash_password

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Biology Testing Platform API",
    description="API for biology testing platform with teacher and student roles",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
uploads_dir = "uploads"
os.makedirs(uploads_dir, exist_ok=True)

# Mount static files for uploaded images
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(auth_router)
app.include_router(teachers_router)
app.include_router(students_router)
app.include_router(upload_router)

@app.get("/")
def root():
    return {"message": "Biology Testing Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Utility function to fix database enum issues
def fix_database_enum_values(db):
    """Fix any lowercase enum values in the database"""
    try:
        # Fix user roles - convert any lowercase to uppercase
        result = db.execute("UPDATE users SET role = 'STUDENT' WHERE role = 'student'")
        student_fixes = result.rowcount
        
        result = db.execute("UPDATE users SET role = 'TEACHER' WHERE role = 'teacher'")  
        teacher_fixes = result.rowcount
        
        if student_fixes > 0 or teacher_fixes > 0:
            db.commit()
            print(f"🔧 Fixed {student_fixes + teacher_fixes} role enum values in database")
            
    except Exception as e:
        print(f"⚠️  Could not fix enum values: {e}")
        db.rollback()

# Initialize first teacher account and fix database issues
@app.on_event("startup")
def create_initial_teacher():
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        # First, fix any existing database enum issues
        fix_database_enum_values(db)
        
        # Check if any teacher exists
        existing_teacher = db.query(User).filter(User.role == UserRole.TEACHER).first()
        
        if not existing_teacher:
            # Create initial teacher
            initial_teacher = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role=UserRole.TEACHER,
                name="Administrator"
            )
            db.add(initial_teacher)
            db.commit()
            print("✅ Initial teacher account created:")
            print("   Username: admin")
            print("   Password: admin123")
            print("   ⚠️  Please change the password after first login!")
        
        # Create some default categories if none exist
        existing_categories = db.query(Category).first()
        if not existing_categories:
            default_categories = [
                Category(name="Genetics"),
                Category(name="Molecular Biology"),
                Category(name="Cell Biology"),
                Category(name="Ecology"),
                Category(name="Evolution"),
                Category(name="Biochemistry")
            ]
            
            for category in default_categories:
                db.add(category)
            
            db.commit()
            print("✅ Default categories created")
    
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)