from .auth import router as auth_router
from .teachers import router as teachers_router
from .students import router as students_router

__all__ = ["auth_router", "teachers_router", "students_router"]