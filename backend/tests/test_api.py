
from types import SimpleNamespace

from fastapi.testclient import TestClient

import main as main_module
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
