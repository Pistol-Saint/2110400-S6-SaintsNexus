from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from database import supabase
from routers.auth import get_current_user


router = APIRouter(prefix="/api/groups", tags=["Project Groups"])

GROUP_NAME = "PROJECT AVENGERS"


class ResourceCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None


class ResourceUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = None


class ResourceAssignment(BaseModel):
    assigned_to: str | None = None


def get_group():
    result = (
        supabase.table("project_groups")
        .select("*")
        .eq("name", GROUP_NAME)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Project group not found")

    return result.data[0]


def get_group_membership(group_id, user_id):
    result = (
        supabase.table("project_group_members")
        .select("*")
        .eq("group_id", str(group_id))
        .eq("user_id", str(user_id))
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this project group"
        )

    return result.data[0]


def require_permission(membership, permission):
    if membership.get("is_owner"):
        return

    if not membership.get(f"can_{permission}", False):
        raise HTTPException(
            status_code=403,
            detail=f"You do not have {permission} permission in this group"
        )


def get_group_context(user):
    group = get_group()
    membership = get_group_membership(group["id"], user["id"])
    return group, membership


def get_resource(group_id, resource_id):
    result = (
        supabase.table("project_group_resources")
        .select("*")
        .eq("id", resource_id)
        .eq("group_id", str(group_id))
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Resource not found")

    return result.data[0]


@router.get("/project-avengers")
def get_project_group(user: dict = Depends(get_current_user)):
    group, membership = get_group_context(user)
    require_permission(membership, "view")

    member_result = (
        supabase.table("project_group_members")
        .select("*")
        .eq("group_id", str(group["id"]))
        .execute()
    )

    members = []

    for member in member_result.data:
        user_result = (
            supabase.table("users")
            .select("id,username")
            .eq("id", str(member["user_id"]))
            .execute()
        )

        if user_result.data:
            members.append({
                **user_result.data[0],
                "is_owner": member["is_owner"],
                "permissions": {
                    "create": member["can_create"],
                    "update": member["can_update"],
                    "assign": member["can_assign"],
                    "view": member["can_view"],
                },
            })

    return {
        "id": str(group["id"]),
        "name": group["name"],
        "project_name": group["project_name"],
        "owner_id": str(group["owner_id"]),
        "created_at": group["created_at"],
        "my_permissions": {
            "owner": membership["is_owner"],
            "create": membership["can_create"],
            "update": membership["can_update"],
            "assign": membership["can_assign"],
            "view": membership["can_view"],
        },
        "members": members,
    }


@router.get("/project-avengers/resources")
def list_group_resources(user: dict = Depends(get_current_user)):
    group, membership = get_group_context(user)
    require_permission(membership, "view")

    result = (
        supabase.table("project_group_resources")
        .select("*")
        .eq("group_id", str(group["id"]))
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


@router.post("/project-avengers/resources")
def create_group_resource(
    data: ResourceCreate,
    user: dict = Depends(get_current_user),
):
    group, membership = get_group_context(user)
    require_permission(membership, "create")

    payload = data.model_dump()
    payload["title"] = payload["title"].strip()

    if not payload["title"]:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    payload["group_id"] = str(group["id"])
    payload["created_by"] = str(user["id"])

    result = (
        supabase.table("project_group_resources")
        .insert(payload)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Resource creation failed")

    return result.data[0]


@router.put("/project-avengers/resources/{resource_id}")
def update_group_resource(
    resource_id: str,
    data: ResourceUpdate,
    user: dict = Depends(get_current_user),
):
    group, membership = get_group_context(user)
    require_permission(membership, "update")

    get_resource(group["id"], resource_id)

    updates = data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "title" in updates:
        if updates["title"] is None or not updates["title"].strip():
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        updates["title"] = updates["title"].strip()

    result = (
        supabase.table("project_group_resources")
        .update(updates)
        .eq("id", resource_id)
        .eq("group_id", str(group["id"]))
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Resource not found")

    return result.data[0]


@router.patch("/project-avengers/resources/{resource_id}/assign")
def assign_group_resource(
    resource_id: str,
    data: ResourceAssignment,
    user: dict = Depends(get_current_user),
):
    group, membership = get_group_context(user)
    require_permission(membership, "assign")

    get_resource(group["id"], resource_id)

    if data.assigned_to is not None:
        get_group_membership(group["id"], data.assigned_to)

    result = (
        supabase.table("project_group_resources")
        .update({"assigned_to": data.assigned_to})
        .eq("id", resource_id)
        .eq("group_id", str(group["id"]))
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Resource not found")

    return result.data[0]
