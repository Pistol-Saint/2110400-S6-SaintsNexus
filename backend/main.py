import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client

# Load Supabase credentials from backend/.env
load_dotenv(Path(__file__).resolve().parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials are missing from backend/.env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Saints Nexus API")
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


# Course request models
class CourseCreate(BaseModel):
    title: str = Field(min_length=1)
    description: str | None = None
    price: float = Field(default=0, ge=0)


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)


# Existing health endpoint
@app.get("/api/health")
def health():
    return {"status": "ok"}


# Existing hello endpoint
@app.get("/api/hello")
def hello(name: str = "World"):
    return {"message": f"Hello, {name}!"}


# CREATE a course
@app.post("/api/courses")
def create_course(course: CourseCreate):
    try:
        result = supabase.table("courses").insert(
            course.model_dump()
        ).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# READ all courses
@app.get("/api/courses")
def get_courses():
    try:
        result = (
            supabase.table("courses")
            .select("*")
            .order("id", desc=True)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# READ one course
@app.get("/api/courses/{course_id}")
def get_course(course_id: int):
    try:
        result = (
            supabase.table("courses")
            .select("*")
            .eq("id", course_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Course not found")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# UPDATE a course
@app.put("/api/courses/{course_id}")
def update_course(course_id: int, course: CourseUpdate):
    try:
        updates = course.model_dump(exclude_unset=True)

        if not updates:
            raise HTTPException(status_code=400, detail="No update data provided")

        result = (
            supabase.table("courses")
            .update(updates)
            .eq("id", course_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Course not found")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# DELETE a course
@app.delete("/api/courses/{course_id}")
def delete_course(course_id: int):
    try:
        result = (
            supabase.table("courses")
            .delete()
            .eq("id", course_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Course not found")

        return {
            "message": "Course deleted successfully",
            "course": result.data[0],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





