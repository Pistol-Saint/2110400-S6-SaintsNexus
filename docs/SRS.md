# Software Requirements Specification (SRS) — Saints Nexus

## 1. Introduction

### 1.1 Purpose
This specification describes the implemented functional and non-functional requirements of Saints Nexus, an e-learning course catalogue with account and administrator features.

### 1.2 Scope
The system consists of a React/TypeScript web frontend, a FastAPI/Python REST API, and a Supabase PostgreSQL database. It supports course browsing, account authentication, profile/session management, and basic administrator controls.

### 1.3 Technology
- Frontend: React, TypeScript, Vite, React Router
- Backend: Python, FastAPI
- Database: Supabase PostgreSQL
- Authentication: PyJWT access tokens and opaque refresh tokens
- Password hashing: pwdlib Argon2
- Deployment: Vercel
- Testing: pytest and FastAPI TestClient

## 2. User roles

- **Visitor:** Browse public course information and register/login.
- **User:** Access authenticated learner pages, update profile, change password, view/revoke sessions.
- **Admin:** Access user-management and audit-log endpoints and perform course write operations.

Authorization is enforced by backend dependencies, not only by hiding frontend navigation.

## 3. Functional requirements

### 3.1 Course catalogue
- FR-01: The system shall return the course list.
- FR-02: The system shall return a course by ID.
- FR-03: The system shall return 404 when a requested course does not exist.
- FR-04: An administrator shall be able to create a course.
- FR-05: An administrator shall be able to update a course.
- FR-06: An administrator shall be able to delete a course.
- FR-07: Course input shall validate a non-empty title and non-negative price.

### 3.2 Authentication and sessions
- FR-08: A visitor shall be able to register with email, username, and password.
- FR-09: A registered user shall be able to log in with email and password.
- FR-10: The system shall hash passwords before storage.
- FR-11: The API shall issue a signed access token with a 15-minute lifetime.
- FR-12: The API shall issue a refresh token with a seven-day lifetime.
- FR-13: The system shall rotate refresh tokens on successful refresh.
- FR-14: The system shall reject missing, invalid, expired, or revoked access sessions.
- FR-15: A user shall be able to log out and revoke a refresh-token session.
- FR-16: A user shall be able to list their sessions and revoke another session.
- FR-17: A banned user shall be prevented from authenticated access.

### 3.3 Profile
- FR-18: An authenticated user shall be able to view profile details.
- FR-19: An authenticated user shall be able to update their username subject to length and uniqueness validation.
- FR-20: A user shall be required to provide the current password to change it.
- FR-21: A successful password change shall revoke other active sessions.

### 3.4 Administration
- FR-22: An administrator shall be able to list registered users without exposing password hashes.
- FR-23: An administrator shall be able to change another user's role between user and admin.
- FR-24: An administrator shall be able to ban another user with a non-empty reason.
- FR-25: An administrator shall be able to unban a user.
- FR-26: Banning a user shall revoke that user's active sessions.
- FR-27: An administrator shall be able to view a bounded number of audit-log records.
- FR-28: The admin dashboard shall display user, administrator, normal-user, and banned-account counts.

## 4. Non-functional requirements

- NFR-01 Security: Protected API operations shall require valid authentication and appropriate role authorization.
- NFR-02 Password storage: Passwords shall be stored as Argon2 password hashes, not plaintext.
- NFR-03 Token security: JWTs shall be signed and validated with required claims, issuer, and expiry.
- NFR-04 Input validation: API request data shall be validated using Pydantic schemas.
- NFR-05 Maintainability: Frontend, backend routers, schemas, services, and security helpers shall be separated into modules.
- NFR-06 Reliability: Invalid requests shall return meaningful HTTP error responses.
- NFR-07 Compatibility: The application shall support modern browsers and standard HTTP APIs.
- NFR-08 Configuration: Secrets shall be supplied through environment variables and excluded from source control.

## 5. External interfaces

- Web interface: React single-page application.
- REST API: JSON over HTTP/HTTPS, documented by FastAPI Swagger UI at `/docs`.
- Database: Supabase client connection to PostgreSQL-backed tables.

## 6. Data entities

The inspected application uses the following database entities:
- **courses:** course ID, creation timestamp, title, description, price.
- **users:** user ID, email, username, password hash, role, ban state/reason, timestamps.
- **sessions:** session ID, user ID, refresh-token hash, expiry, revocation timestamp, last activity, IP address.
- **audit_logs:** user reference, action, structured details, IP address, timestamp.

Exact SQL constraints and indexes should be verified against the deployed Supabase schema before including a database DDL appendix.

## 7. Known limitations

The current implementation does not provide group/team permissions, brute-force lockout, CSV export, admin search/filter/pagination, or a dedicated failed-login analytics view. Refresh tokens are returned in JSON and held in browser sessionStorage rather than an HttpOnly cookie. These are limitations and future improvements, not implemented requirements.
