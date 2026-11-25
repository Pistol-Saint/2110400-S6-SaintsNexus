
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from database import supabase
from schemas.course import CourseCreate, CourseUpdate

from routers.auth import router as auth_router
from routers.auth import get_current_admin
from routers.profile import router as profile_router
from routers.admin import router as admin_router
from routers.groups import router as groups_router


app = FastAPI(title="Saints Nexus API")


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://2110400-saintsnexus-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Application Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(admin_router)
app.include_router(groups_router)


# Health Check
@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# Hello Endpoint
@app.get("/api/hello")
def hello(name: str = "World"):
    return {"message": f"Hello, {name}!"}


# ==========================================
# COURSE MANAGEMENT
# ==========================================

# Only administrators can create courses
@app.post("/api/courses")
def create_course(
    course: CourseCreate,
    admin: dict = Depends(get_current_admin),
):
    result = supabase.table("courses").insert(
        course.model_dump()
    ).execute()

    return result.data[0]


# All users can view courses
@app.get("/api/courses")
def get_courses():
    result = (
        supabase.table("courses")
        .select("*")
        .order("id", desc=True)
        .execute()
    )

    return result.data


# View individual course
@app.get("/api/courses/{course_id}")
def get_course(course_id: int):
    result = (
        supabase.table("courses")
        .select("*")
        .eq("id", course_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return result.data[0]


# Only administrators can update courses
@app.put("/api/courses/{course_id}")
def update_course(
    course_id: int,
    course: CourseUpdate,
    admin: dict = Depends(get_current_admin),
):
    updates = course.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    result = (
        supabase.table("courses")
        .update(updates)
        .eq("id", course_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return result.data[0]


# Only administrators can delete courses
# Only administrators can delete courses
@app.delete("/api/courses/{course_id}")
def delete_course(
    course_id: int,
    admin: dict = Depends(get_current_admin),
):
    result = (
        supabase.table("courses")
        .delete()
        .eq("id", course_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return {
        "message": "Course deleted successfully",
        "course": result.data[0],
    }
