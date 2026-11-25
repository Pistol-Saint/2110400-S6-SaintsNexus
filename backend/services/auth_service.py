
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from backend.database import supabase
from backend.security.passwords import hash_password, verify_password
from backend.security.tokens import create_access_token
from backend.security.refresh_tokens import (
    create_refresh_token,
    hash_refresh_token,
)


REFRESH_TOKEN_DAYS = 7


def current_time():
    return datetime.now(timezone.utc)


def log_action(user_id, action, details=None, ip_address=None):
    try:
        supabase.table("audit_logs").insert({
            "user_id": user_id,
            "action": action,
            "details": details or {},
            "ip_address": ip_address,
        }).execute()
    except Exception:
        pass


def signup_user(email, username, password, ip_address=None):
    email = email.strip().lower()
    username = username.strip()

    try:
        existing_email = (
            supabase.table("users")
            .select("id")
            .eq("email", email)
            .execute()
        )

        if existing_email.data:
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        existing_username = (
            supabase.table("users")
            .select("id")
            .eq("username", username)
            .execute()
        )

        if existing_username.data:
            raise HTTPException(
                status_code=409,
                detail="Username already taken"
            )

        result = supabase.table("users").insert({
            "email": email,
            "username": username,
            "password_hash": hash_password(password),
            "role": "user",
        }).execute()

        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Account creation failed"
            )

        user = result.data[0]

        log_action(
            user["id"],
            "signup_success",
            {"email": email},
            ip_address,
        )

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Account creation failed"
        )


def login_user(email, password, ip_address=None):
    email = email.strip().lower()

    try:
        result = (
            supabase.table("users")
            .select("*")
            .eq("email", email)
            .execute()
        )

        if not result.data:
            log_action(None, "login_failure", {"email": email}, ip_address)
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        user = result.data[0]

        if not verify_password(password, user["password_hash"]):
            log_action(
                user["id"],
                "login_failure",
                {"email": email},
                ip_address,
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if user["is_banned"]:
            log_action(user["id"], "login_blocked_banned", {}, ip_address)
            raise HTTPException(
                status_code=403,
                detail="Account is banned"
            )

        log_action(user["id"], "login_success", {}, ip_address)

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Login failed"
        )


def create_session(user_id, ip_address=None):
    refresh_token = create_refresh_token()
    now = current_time()

    result = supabase.table("sessions").insert({
        "user_id": user_id,
        "refresh_token_hash": hash_refresh_token(refresh_token),
        "expires_at": (now + timedelta(days=REFRESH_TOKEN_DAYS)).isoformat(),
        "last_seen_at": now.isoformat(),
        "ip_address": ip_address,
    }).execute()

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Session creation failed"
        )

    return {
        "session": result.data[0],
        "refresh_token": refresh_token,
    }


def refresh_session(refresh_token, ip_address=None):
    token_hash = hash_refresh_token(refresh_token)

    result = (
        supabase.table("sessions")
        .select("*")
        .eq("refresh_token_hash", token_hash)
        .is_("revoked_at", "null")
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid or revoked refresh token"
        )

    session = result.data[0]

    expires_at = datetime.fromisoformat(
        session["expires_at"].replace("Z", "+00:00")
    )

    if expires_at <= current_time():
        supabase.table("sessions").update({
            "revoked_at": current_time().isoformat()
        }).eq("id", session["id"]).execute()

        raise HTTPException(
            status_code=401,
            detail="Refresh token has expired"
        )

    user_result = (
        supabase.table("users")
        .select("*")
        .eq("id", session["user_id"])
        .execute()
    )

    if not user_result.data:
        raise HTTPException(status_code=401, detail="User not found")

    user = user_result.data[0]

    if user["is_banned"]:
        supabase.table("sessions").update({
            "revoked_at": current_time().isoformat()
        }).eq("id", session["id"]).execute()

        raise HTTPException(status_code=403, detail="Account is banned")

    new_refresh_token = create_refresh_token()
    now = current_time()

    updated = (
        supabase.table("sessions")
        .update({
            "refresh_token_hash": hash_refresh_token(new_refresh_token),
            "expires_at": (
                now + timedelta(days=REFRESH_TOKEN_DAYS)
            ).isoformat(),
            "last_seen_at": now.isoformat(),
            "ip_address": ip_address,
        })
        .eq("id", session["id"])
        .eq("refresh_token_hash", token_hash)
        .is_("revoked_at", "null")
        .execute()
    )

    if not updated.data:
        raise HTTPException(
            status_code=401,
            detail="Refresh token already used or invalid"
        )

    log_action(user["id"], "token_refreshed", {}, ip_address)

    return {
        "user": user,
        "session": updated.data[0],
        "refresh_token": new_refresh_token,
    }


def logout_session(refresh_token):
    token_hash = hash_refresh_token(refresh_token)

    result = (
        supabase.table("sessions")
        .select("id,user_id")
        .eq("refresh_token_hash", token_hash)
        .is_("revoked_at", "null")
        .execute()
    )

    if result.data:
        session = result.data[0]

        supabase.table("sessions").update({
            "revoked_at": current_time().isoformat()
        }).eq("id", session["id"]).execute()

        log_action(session["user_id"], "logout", {})


def list_user_sessions(user_id):
    result = (
        supabase.table("sessions")
        .select(
            "id,created_at,expires_at,revoked_at,last_seen_at,ip_address"
        )
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


def revoke_user_session(user_id, session_id):
    result = (
        supabase.table("sessions")
        .select("id,revoked_at")
        .eq("id", session_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    if result.data[0]["revoked_at"] is not None:
        return {"message": "Session already revoked"}

    supabase.table("sessions").update({
        "revoked_at": current_time().isoformat()
    }).eq("id", session_id).eq("user_id", user_id).execute()

    log_action(user_id, "session_revoked", {"session_id": session_id})

    return {"message": "Session revoked successfully"}


def build_auth_response(user, session, refresh_token):
    access_token = create_access_token(
        str(user["id"]),
        user["role"],
        str(session["id"]),
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "session_id": str(session["id"]),
        "user": {
            "id": str(user["id"]),
            "email": user["email"],
            "username": user["username"],
            "role": user["role"],
        },
    }
