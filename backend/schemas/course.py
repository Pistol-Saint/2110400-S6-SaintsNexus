from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    title: str = Field(min_length=1)
    description: str | None = None
    price: float = Field(default=0, ge=0)


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)