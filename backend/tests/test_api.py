
from types import SimpleNamespace

from fastapi.testclient import TestClient

import main as main_module
import routers.admin as admin_router
from main import app
from routers.auth import get_current_admin
from security.passwords import hash_password, verify_password


client = TestClient(app)


class FakeQuery:
    """A small Supabase query mock for safe API testing."""

    def __init__(self, rows=None):
        self.rows = rows if rows is not None else []

    def select(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def insert(self, payload):
        self.rows = [{"id": 999, **payload}]
        return self

    def execute(self):
        return SimpleNamespace(data=self.rows)


class FakeSupabase:
    """Prevents automated tests from changing real Supabase data."""

    def __init__(self, rows=None):
        self.rows = rows if rows is not None else []

    def table(self, table_name):
        return FakeQuery(self.rows.copy())


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_hello_endpoint():
    response = client.get("/api/hello?name=Saints")

    assert response.status_code == 200
    assert response.json() == {"message": "Hello, Saints!"}


def test_get_courses(monkeypatch):
    sample_courses = [
        {
            "id": 1,
            "title": "Introduction to Programming",
            "description": "Learn programming fundamentals",
            "price": 500,
        }
    ]

    monkeypatch.setattr(
        main_module,
        "supabase",
        FakeSupabase(sample_courses),
    )

    response = client.get("/api/courses")

    assert response.status_code == 200
    assert response.json() == sample_courses


def test_get_missing_course_returns_404(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "supabase",
        FakeSupabase([]),
    )

    response = client.get("/api/courses/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Course not found"


def test_create_course_requires_admin():
    response = client.post(
        "/api/courses",
        json={
            "title": "Test Course",
            "description": "Automated test course",
            "price": 100,
        },
    )

    assert response.status_code in (401, 403)


def test_admin_can_create_course(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "supabase",
        FakeSupabase([]),
    )

    app.dependency_overrides[get_current_admin] = lambda: {
        "id": "test-admin",
        "role": "admin",
    }

    try:
        response = client.post(
            "/api/courses",
            json={
                "title": "Automated Test Course",
                "description": "Created during automated testing",
                "price": 100,
            },
        )
    finally:
        app.dependency_overrides.pop(get_current_admin, None)

    assert response.status_code == 200
    assert response.json()["title"] == "Automated Test Course"
    assert response.json()["id"] == 999


def test_password_hashing():
    password = "TestPassword_123!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)


def test_wrong_password_rejected():
    password = "TestPassword_123!"
    hashed = hash_password(password)

    assert not verify_password("WrongPassword_123!", hashed)


def test_me_endpoint_requires_authentication():
    response = client.get("/api/auth/me")

    assert response.status_code == 401


# ==========================================
# ADMIN CSV EXPORT TESTS
# ==========================================

def test_admin_can_export_users_csv(monkeypatch):
    sample_users = [
        {
            "id": "user-1",
            "email": "learner@example.com",
            "username": "=1+1",
            "role": "user",
            "is_banned": False,
            "ban_reason": None,
            "created_at": "2026-11-27T10:00:00",
            "updated_at": "2026-11-27T10:00:00",
            "password_hash": "must-not-be-exported",
        }
    ]

    monkeypatch.setattr(
        admin_router,
        "supabase",
        FakeSupabase(sample_users),
    )

    app.dependency_overrides[get_current_admin] = lambda: {
        "id": "test-admin",
        "role": "admin",
    }

    try:
        response = client.get("/api/admin/exports/users")
    finally:
        app.dependency_overrides.pop(get_current_admin, None)

    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers["content-disposition"]
    assert "saints-nexus-users.csv" in response.headers["content-disposition"]
    assert "learner@example.com" in response.text
    assert "'=1+1" in response.text
    assert "password_hash" not in response.text
    assert "must-not-be-exported" not in response.text


def test_admin_can_export_audit_logs_csv(monkeypatch):
    sample_logs = [
        {
            "id": 101,
            "user_id": "admin-1",
            "action": "user_banned",
            "details": {"target_user_id": "user-1"},
            "ip_address": "127.0.0.1",
            "created_at": "2026-11-27T10:00:00",
        }
    ]

    monkeypatch.setattr(
        admin_router,
        "supabase",
        FakeSupabase(sample_logs),
    )

    app.dependency_overrides[get_current_admin] = lambda: {
        "id": "test-admin",
        "role": "admin",
    }

    try:
        response = client.get("/api/admin/exports/audit-logs")
    finally:
        app.dependency_overrides.pop(get_current_admin, None)

    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers["content-disposition"]
    assert "saints-nexus-audit-logs.csv" in response.headers["content-disposition"]
    assert "user_banned" in response.text
    assert "target_user_id" in response.text


def test_csv_exports_require_admin_authentication():
    users_response = client.get("/api/admin/exports/users")
    logs_response = client.get("/api/admin/exports/audit-logs")

    assert users_response.status_code == 401
    assert logs_response.status_code == 401