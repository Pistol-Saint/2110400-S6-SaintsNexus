
from fastapi import HTTPException

from backend.database import supabase
from backend.security.passwords import hash_password, verify_password
from backend.services.auth_service import log_action, current_time


SAFE_PROFILE_FIELDS = "id, email, username, role"


def update_profile(user_id: str, username: str):
    username = username.strip()

    if len(username) < 3 or len(username) > 30:
        raise HTTPException(
            status_code=400,
            detail="Username must be 3-30 characters"
        )

    existing_user = (
        supabase.table("users")
        .select("id")
        .eq("username", username)
        .neq("id", user_id)
        .execute()
    )

    if existing_user.data:
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )

    result = (
        supabase.table("users")
        .update({
            "username": username,
            "updated_at": current_time().isoformat()
        })
        .eq("id", user_id)
        .select(SAFE_PROFILE_FIELDS)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="User not found or profile update failed"
        )

    log_action(
        user_id,
        "profile_updated",
        {"username": username}
    )

    return result.data[0]


def change_password(
    user_id: str,
    current_password: str,
    new_password: str,
    current_session_id: str
):
    user_result = (
        supabase.table("users")
        .select("id, password_hash")
        .eq("id", user_id)
        .execute()
    )

    if not user_result.data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user = user_result.data[0]

    if not verify_password(
        current_password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if current_password == new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    new_hash = hash_password(new_password)

    supabase.table("users").update({
        "password_hash": new_hash,
        "updated_at": current_time().isoformat()
    }).eq("id", user_id).execute()

    # Revoke all other active sessions, keeping the current session active.
    supabase.table("sessions").update({
        "revoked_at": current_time().isoformat()
    }).eq(
        "user_id", user_id
    ).neq(
        "id", current_session_id
    ).is_(
        "revoked_at", "null"
    ).execute()

    log_action(
        user_id,
        "password_changed",
        {}
    )

    return {
        "message": "Password changed successfully"
    }
