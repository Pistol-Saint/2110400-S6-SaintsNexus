import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from routers.auth import get_current_admin
from database import supabase
from services.auth_service import current_time, log_action


router = APIRouter(prefix="/api/admin", tags=["Administration"])


# Fields safe to return in administrator user-management responses
SAFE_USER_FIELDS = (
    "id, email, username, role, is_banned, ban_reason, created_at, updated_at"
)


# View all registered users
@router.get("/users")
def get_all_users(
    admin: dict = Depends(get_current_admin),
):
    result = (
        supabase.table("users")
        .select(SAFE_USER_FIELDS)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


# Change a user's role
@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    new_role: str,
    request: Request,
    admin: dict = Depends(get_current_admin),
):
    if new_role not in ["user", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Allowed roles: user, admin",
        )

    if str(admin["id"]) == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own administrator role",
        )

    user_result = (
        supabase.table("users")
        .select("id, role")
        .eq("id", user_id)
        .execute()
    )

    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user_result.data[0]["role"]

    result = (
        supabase.table("users")
        .update({
            "role": new_role,
            "updated_at": current_time().isoformat(),
        })
        .eq("id", user_id)
        .select(SAFE_USER_FIELDS)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Role update failed")

    ip_address = request.client.host if request.client else None

    log_action(
        admin["id"],
        "user_role_changed",
        {
            "target_user_id": user_id,
            "old_role": old_role,
            "new_role": new_role,
        },
        ip_address,
    )

    return {
        "message": "User role updated successfully",
        "user": result.data[0],
    }


# Ban a user
@router.post("/users/{user_id}/ban")
def ban_user(
    user_id: str,
    reason: str,
    request: Request,
    admin: dict = Depends(get_current_admin),
):
    if str(admin["id"]) == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot ban your own account",
        )

    reason = reason.strip()

    if not reason:
        raise HTTPException(
            status_code=400,
            detail="A ban reason is required",
        )

    user_result = (
        supabase.table("users")
        .select("id, is_banned")
        .eq("id", user_id)
        .execute()
    )

    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    if user_result.data[0]["is_banned"]:
        raise HTTPException(status_code=400, detail="User is already banned")

    result = (
        supabase.table("users")
        .update({
            "is_banned": True,
            "ban_reason": reason,
            "updated_at": current_time().isoformat(),
        })
        .eq("id", user_id)
        .select(SAFE_USER_FIELDS)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="User ban failed")

    # Revoke all active sessions belonging to the banned user
    supabase.table("sessions").update({
        "revoked_at": current_time().isoformat()
    }).eq("user_id", user_id).is_("revoked_at", "null").execute()

    ip_address = request.client.host if request.client else None

    log_action(
        admin["id"],
        "user_banned",
        {
            "target_user_id": user_id,
            "reason": reason,
        },
        ip_address,
    )

    return {
        "message": "User banned successfully",
        "user": result.data[0],
    }


# Unban a user
@router.post("/users/{user_id}/unban")
def unban_user(
    user_id: str,
    request: Request,
    admin: dict = Depends(get_current_admin),
):
    user_result = (
        supabase.table("users")
        .select("id, is_banned, ban_reason")
        .eq("id", user_id)
        .execute()
    )

    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    if not user_result.data[0]["is_banned"]:
        raise HTTPException(status_code=400, detail="User is not banned")

    result = (
        supabase.table("users")
        .update({
            "is_banned": False,
            "ban_reason": None,
            "updated_at": current_time().isoformat(),
        })
        .eq("id", user_id)
        .select(SAFE_USER_FIELDS)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="User unban failed")

    ip_address = request.client.host if request.client else None

    log_action(
        admin["id"],
        "user_unbanned",
        {
            "target_user_id": user_id,
        },
        ip_address,
    )

    return {
        "message": "User unbanned successfully",
        "user": result.data[0],
    }


# View administrative audit logs
@router.get("/audit-logs")
def get_audit_logs(
    admin: dict = Depends(get_current_admin),
    limit: int = 100,
):
    if limit < 1 or limit > 500:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 500",
        )

    result = (
        supabase.table("audit_logs")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return result.data


# ==========================================
# ADMINISTRATOR CSV EXPORTS
# ==========================================

def safe_csv_value(value):
    """
    Convert values safely for CSV output.
    Prevent spreadsheet formula injection.
    """
    if value is None:
        return ""

    if isinstance(value, (dict, list)):
        import json
        value = json.dumps(value, ensure_ascii=False)

    value = str(value)

    if value.startswith(("=", "+", "-", "@", "\t", "\r")):
        value = "'" + value

    return value


def create_csv_response(rows, columns, filename):
    """
    Generate a downloadable UTF-8 CSV file.
    """
    output = io.StringIO(newline="")
    writer = csv.writer(output)

    writer.writerow(columns)

    for row in rows:
        writer.writerow([
            safe_csv_value(row.get(column))
            for column in columns
        ])

    csv_content = "\ufeff" + output.getvalue()

    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


# Export registered users
@router.get("/exports/users")
def export_users_csv(
    admin: dict = Depends(get_current_admin),
):
    result = (
        supabase.table("users")
        .select(SAFE_USER_FIELDS)
        .order("created_at", desc=True)
        .execute()
    )

    columns = [
        "id",
        "email",
        "username",
        "role",
        "is_banned",
        "ban_reason",
        "created_at",
        "updated_at",
    ]

    return create_csv_response(
        result.data or [],
        columns,
        "saints-nexus-users.csv",
    )


# Export administrative audit logs
@router.get("/exports/audit-logs")
def export_audit_logs_csv(
    admin: dict = Depends(get_current_admin),
):
    result = (
        supabase.table("audit_logs")
        .select("*")
        .order("created_at", desc=True)
        .limit(5000)
        .execute()
    )

    rows = result.data or []

    columns = list(rows[0].keys()) if rows else [
        "id",
        "user_id",
        "action",
        "details",
        "ip_address",
        "created_at",
    ]

    return create_csv_response(
        rows,
        columns,
        "saints-nexus-audit-logs.csv",
    )