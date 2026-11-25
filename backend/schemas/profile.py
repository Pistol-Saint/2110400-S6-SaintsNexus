from pydantic import BaseModel, Field


class ProfileUpdateRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)