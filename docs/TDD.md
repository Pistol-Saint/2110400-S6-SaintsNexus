# Technical Design Document (TDD) — Saints Nexus

## 1. Architecture

Saints Nexus uses a three-layer client/server architecture:

1. **Presentation layer:** React + TypeScript + Vite single-page application.
2. **Application/API layer:** FastAPI routes, Pydantic schemas, service functions, authentication dependencies, and security utilities.
3. **Data layer:** Supabase PostgreSQL accessed through the Supabase Python client.

The frontend calls the backend REST API. Vercel routes `/api/*` requests to the backend service and other paths to the frontend service.

## 2. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, React Router |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| Database | Supabase PostgreSQL |
| Password hashing | pwdlib with Argon2 |
| Access tokens | PyJWT, HS256 |
| Refresh tokens | Python secrets + SHA-256 hash at rest |
| Hosting | Vercel |
| Tests | pytest, FastAPI TestClient |

## 3. Repository organization

- `backend/main.py`: FastAPI application, CORS, course endpoints, router registration.
- `backend/routers/auth.py`: signup, login, refresh, logout, session, current-user endpoints and auth dependencies.
- `backend/routers/profile.py`: profile and password-change endpoints.
- `backend/routers/admin.py`: user list, role changes, ban/unban, audit logs.
- `backend/services/auth_service.py`: account, session, refresh-token, and audit-log business logic.
- `backend/services/profile_service.py`: profile and password-change business logic.
- `backend/security/passwords.py`: password hashing and verification.
- `backend/security/tokens.py`: JWT creation and validation.
- `backend/security/refresh_tokens.py`: opaque refresh-token generation and hashing.
- `backend/schemas/`: Pydantic request models.
- `backend/tests/test_api.py`: automated API and password tests.
- `frontend/src/App.tsx`: route composition and course UI.
- `frontend/src/context/AuthContext.tsx`: authentication state.
- `frontend/src/services/api.ts`: API requests, token storage, refresh retry.
- `frontend/src/pages/BasicPages.tsx`: learner dashboard, profile/session UI, admin dashboard.
- `docs/`: project requirements, design, report, and submission guidance.

## 4. API design

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| GET | `/api/courses` | Public | List courses |
| GET | `/api/courses/{course_id}` | Public | Course detail |
| POST | `/api/courses` | Admin | Create course |
| PUT | `/api/courses/{course_id}` | Admin | Update course |
| DELETE | `/api/courses/{course_id}` | Admin | Delete course |
| POST | `/api/auth/signup` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Refresh token | Rotate refresh token and issue access token |
| POST | `/api/auth/logout` | Refresh token | Revoke session |
| GET | `/api/auth/me` | Authenticated | Current user |
| GET | `/api/auth/sessions` | Authenticated | List own sessions |
| DELETE | `/api/auth/sessions/{session_id}` | Authenticated | Revoke own other session |
| GET | `/api/profile` | Authenticated | Read profile |
| PUT | `/api/profile` | Authenticated | Update username |
| POST | `/api/profile/change-password` | Authenticated | Change password |
| GET | `/api/admin/users` | Admin | List safe user fields |
| PATCH | `/api/admin/users/{user_id}/role` | Admin | Change role |
| POST | `/api/admin/users/{user_id}/ban` | Admin | Ban user |
| POST | `/api/admin/users/{user_id}/unban` | Admin | Unban user |
| GET | `/api/admin/audit-logs` | Admin | Read recent audit logs |

The deployed Swagger UI is the source of truth for exact request parameters and response schemas.

## 5. Authentication design

- Passwords are hashed using Argon2 before persistence.
- Access tokens are JWTs signed with HS256 and contain subject, role, session ID, issuer, issued-at, and expiry claims.
- Access-token lifetime is 15 minutes.
- Refresh tokens are generated from cryptographically secure random bytes, have a seven-day expiry, and are stored as SHA-256 hashes.
- A successful refresh replaces the stored refresh-token hash, preventing reuse of the previous token.
- Authenticated requests validate the JWT, verify that its session remains active, load the user, and reject banned accounts.
- Frontend access and refresh tokens are currently stored in sessionStorage. This is a known security trade-off; refresh tokens are not HttpOnly cookies in this version.

## 6. Authorization and audit

FastAPI dependencies separate authenticated-user access from administrator-only access. Course write endpoints and admin router endpoints use the admin dependency. Ban operations revoke the target user's active sessions. Role changes, bans, unbans, authentication events, and selected account events are recorded in the audit log.

## 7. Database model

Core tables:
- `courses`: ID, created_at, title, description, price.
- `users`: ID, email, username, password_hash, role, is_banned, ban_reason, created_at, updated_at.
- `sessions`: ID, user_id, refresh_token_hash, expires_at, revoked_at, last_seen_at, ip_address.
- `audit_logs`: ID, user_id, action, details, ip_address, created_at.

Confirm exact column types, foreign keys, RLS policies, and indexes in Supabase before producing a schema screenshot or SQL appendix.

## 8. Deployment and configuration

Vercel uses the root `vercel.json` service configuration to route API requests to the FastAPI backend and web routes to the Vite frontend. Backend environment variables include `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET_KEY`, and `PASSWORD_PEPPER`. The frontend uses `VITE_API_URL`. Actual values must remain private and must never be committed or shown in screenshots.

## 9. Testing

The current automated suite contains nine tests covering health, hello, course listing, missing course, admin authorization for course creation, password hashing/verification, and authentication requirement for the current-user endpoint. The final-assessment implementation was previously verified with nine passing tests and a successful frontend production build. Re-run both before submission.

## 10. Known technical limitations

No group/team service or granular group permissions, login lockout, CSV export, admin search/filter/pagination, or dedicated failed-login analytics dashboard were found in the inspected main-branch implementation. These are future-work items. The test suite should be expanded to cover token expiry/tampering, refresh rotation/reuse, session ownership, banned-user behavior, and role-based denial.
