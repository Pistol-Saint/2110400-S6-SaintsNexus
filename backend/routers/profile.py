from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.routers.auth import get_current_user
from backend.schemas.profile import (
    ProfileUpdateRequest,
    PasswordChangeRequest
)
from backend.services.profile_service import (
    update_profile,
    change_password
)
from backend.security.tokens import decode_access_token

router = APIRouter(prefix="/api/profile", tags=["Profile"])
security = HTTPBearer()


@router.get("")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "username": current_user["username"],
        "role": current_user["role"]
    }


@router.put("")
def edit_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    return update_profile(
        current_user["id"],
        request.username
    )


@router.post("/change-password")
def edit_password(
    request: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token_payload = decode_access_token(credentials.credentials)

    return change_password(
        current_user["id"],
        request.current_password,
        request.new_password,
        token_payload["session_id"]
    )