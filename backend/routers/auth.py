
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.schemas.auth import (
    SignupRequest,
    LoginRequest,
    RefreshRequest,
    LogoutRequest,
)
from backend.services.auth_service import (
    signup_user,
    login_user,
    create_session,
    refresh_session,
    logout_session,
    list_user_sessions,
    revoke_user_session,
    build_auth_response,
)
from backend.database import supabase
from backend.security.tokens import decode_access_token


router = APIRouter(prefix="/api/auth", tags=["Authentication"])

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    try:
        payload = decode_access_token(credentials.credentials)

        user_id = payload["sub"]
        session_id = payload["session_id"]

        session_result = (
            supabase.table("sessions")
            .select("id")
            .eq("id", session_id)
            .eq("user_id", user_id)
            .is_("revoked_at", "null")
            .execute()
        )

        if not session_result.data:
            raise HTTPException(
                status_code=401,
                detail="Session is invalid or revoked"
            )

        user_result = (
            supabase.table("users")
            .select("*")
            .eq("id", user_id)
            .execute()
        )

        if not user_result.data:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        user = user_result.data[0]

        if user["is_banned"]:
            raise HTTPException(
                status_code=403,
                detail="Account is banned"
            )

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# Admin-only authorization dependency
def get_current_admin(
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator access required"
        )

    return current_user


@router.post("/signup")
def signup(data: SignupRequest, request: Request):
    ip_address = request.client.host if request.client else None

    user = signup_user(
        data.email,
        data.username,
        data.password,
        ip_address,
    )

    session_data = create_session(user["id"], ip_address)

    return build_auth_response(
        user,
        session_data["session"],
        session_data["refresh_token"],
    )


@router.post("/login")
def login(data: LoginRequest, request: Request):
    ip_address = request.client.host if request.client else None

    user = login_user(
        data.email,
        data.password,
        ip_address,
    )

    session_data = create_session(user["id"], ip_address)

    return build_auth_response(
        user,
        session_data["session"],
        session_data["refresh_token"],
    )


@router.post("/refresh")
def refresh(data: RefreshRequest, request: Request):
    ip_address = request.client.host if request.client else None

    result = refresh_session(
        data.refresh_token,
        ip_address,
    )

    return build_auth_response(
        result["user"],
        result["session"],
        result["refresh_token"],
    )


@router.post("/logout")
def logout(data: LogoutRequest):
    logout_session(data.refresh_token)

    return {"message": "Logged out successfully"}


@router.get("/sessions")
def get_sessions(user=Depends(get_current_user)):
    return list_user_sessions(str(user["id"]))


@router.delete("/sessions/{session_id}")
def revoke_session(
    session_id: str,
    user=Depends(get_current_user),
):
    return revoke_user_session(
        str(user["id"]),
        session_id,
    )


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "id": str(user["id"]),
        "email": user["email"],
        "username": user["username"],
        "role": user["role"],
    }
