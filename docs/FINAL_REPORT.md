# Saints Nexus — Final Project Report

> **Submission draft:** Complete the student/course metadata and attach the required screenshots and demo recording before submission. This report describes the code inspected on the `main` branch; it does not claim that unimplemented assessment requirements are complete.

## Cover information

| Field | Value |
|---|---|
| Project | Saints Nexus — E-Learning Website |
| Course | CSE309 — Web Applications |
| Section | 6 |
| Institution | Independent University, Bangladesh |
| Student name | [Enter your name exactly as registered] |
| Student ID | [Enter your student ID] |
| Group members | [Enter names and IDs, or state individual project if applicable] |
| Faculty | [Enter faculty name] |
| Submission date | [Enter date] |
| Repository | https://github.com/Pistol-Saint/2110400-S6-SaintsNexus |
| Live frontend | https://2110400-saintsnexus-frontend.vercel.app/ |
| Live API | https://2110400-saintsnexus-backend.vercel.app/ |
| API documentation | https://2110400-saintsnexus-backend.vercel.app/docs |

## 1. Executive summary

Saints Nexus is a web-based e-learning platform developed with React and TypeScript, a FastAPI/Python backend, and Supabase PostgreSQL. The application provides a public course catalogue, user registration and login, JWT-based authentication with refresh-token rotation, profile and password management, login-session management, administrator user controls, audit logging, and administrator-only course management.

The frontend and backend are deployed through Vercel. The inspected repository contains nine backend automated tests. The project was previously verified with nine passing tests and a successful TypeScript/Vite production build. The deployed health endpoint and Swagger UI were also confirmed operational during the final deployment troubleshooting.

The current implementation meets a meaningful subset of the course project goals. However, the repository audit identified gaps against the broader final-assessment checklist, notably group/team permissions, brute-force lockout, CSV export, and a dedicated failed-login security view. These are explicitly documented as limitations rather than presented as completed features.

## 2. Problem statement and objectives

Learners need a simple way to discover available courses and manage their platform accounts. Platform administrators need controlled tools to maintain course data, manage user roles, restrict abusive accounts, and review administrative activity.

Objectives:
1. Build a responsive web frontend using React and TypeScript.
2. Implement a REST API using FastAPI and Python.
3. Persist course, user, session, and audit data using Supabase.
4. Support secure password hashing and authenticated sessions.
5. Apply server-side role-based access control to privileged operations.
6. Provide basic learner account management and administrator tools.
7. Deploy the frontend and backend for remote access and demonstration.

## 3. Scope and implemented features

### 3.1 Course catalogue
- Public course listing and individual course retrieval.
- Administrator-only course creation, update, and deletion.
- Course input validation for non-empty titles and non-negative prices.

### 3.2 Authentication and session lifecycle
- User signup and login.
- Argon2 password hashing.
- JWT access tokens with a 15-minute lifetime.
- Opaque refresh tokens with a seven-day lifetime.
- Refresh-token hashes stored in the database and rotated after successful refresh.
- Session validation and revocation.
- Logout, session listing, and revocation of other active sessions.
- Banned accounts rejected by authenticated API operations.

### 3.3 Profile management
- View account details.
- Update username with validation and uniqueness checks.
- Change password after verifying the current password.
- Revoke other sessions after password change.

### 3.4 Administration
- Dashboard counts for total users, administrators, normal users, and banned users.
- List registered users.
- Change another user's role between user and admin.
- Ban users with a required reason and unban users.
- Ban action revokes the target user's active sessions.
- Review recent administrative audit logs.
- Backend authorization protects privileged endpoints.

## 4. System architecture and technology

The application uses a three-layer architecture:

- **Presentation:** React, TypeScript, Vite, React Router.
- **Application:** FastAPI routers, Pydantic schemas, services, JWT/session dependencies.
- **Persistence:** Supabase PostgreSQL.

Vercel routes requests under `/api/*` to the backend service and other web routes to the frontend service.

### Database entities

The inspected code references:
- `courses`: course title, description, price, creation time, ID.
- `users`: email, username, password hash, role, ban state/reason, timestamps.
- `sessions`: user reference, refresh-token hash, expiry, revocation, last activity, IP address.
- `audit_logs`: actor/user reference, action, structured details, IP address, timestamp.

Exact SQL types, foreign keys, indexes, and Row Level Security policies should be verified in the Supabase dashboard before adding a schema appendix.

## 5. Security design

- Passwords are hashed using Argon2 rather than stored in plaintext.
- JWT access tokens are signed using HS256 and validated for required claims, issuer, and expiry.
- Refresh tokens are generated with a cryptographically secure random generator.
- Only SHA-256 hashes of refresh tokens are stored in the database.
- Refresh tokens are rotated on successful refresh.
- Authenticated requests check token validity, active session state, user existence, and ban status.
- Administrator operations are protected by backend dependencies.
- Ban and password-change operations revoke relevant active sessions.
- CORS allows the configured local frontend and deployed frontend origins.

**Security limitation:** the current frontend keeps access and refresh tokens in browser sessionStorage; the backend returns refresh tokens in JSON. This version does not use an HttpOnly refresh-token cookie. A future hardening step should move refresh-token handling to Secure, HttpOnly, SameSite cookies and add CSRF protections appropriate to that design.

## 6. API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health |
| GET | `/api/courses` | List courses |
| GET | `/api/courses/{course_id}` | Read one course |
| POST / PUT / DELETE | `/api/courses...` | Admin course management |
| POST | `/api/auth/signup` | Registration |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh/rotate token |
| POST | `/api/auth/logout` | Logout/revoke session |
| GET | `/api/auth/me` | Current user |
| GET / DELETE | `/api/auth/sessions...` | Session management |
| GET / PUT | `/api/profile` | Read/update profile |
| POST | `/api/profile/change-password` | Change password |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/{user_id}/role` | Change role |
| POST | `/api/admin/users/{user_id}/ban` | Ban user |
| POST | `/api/admin/users/{user_id}/unban` | Unban user |
| GET | `/api/admin/audit-logs` | Audit history |

The deployed Swagger UI at https://2110400-saintsnexus-backend.vercel.app/docs provides the exact schemas and parameters.

## 7. Testing and verification

The repository currently includes nine backend tests:
1. Health endpoint.
2. Hello endpoint.
3. Course listing with a mocked database.
4. Missing course returns 404.
5. Course creation requires admin authorization.
6. Admin can create a course using a dependency override and mocked database.
7. Password hashing and verification.
8. Incorrect password verification fails.
9. Current-user endpoint requires authentication.

The fake Supabase query used in tests prevents test operations from modifying production database rows.

Previously recorded verification:
- Backend test suite: 9 passed, with one non-blocking Starlette/httpx deprecation warning.
- Frontend: TypeScript check and Vite production build succeeded.
- Git whitespace validation: `git diff --check` clean.
- Deployed backend health endpoint returned `{"status":"ok"}`.
- Deployed Swagger UI loaded successfully.

**Before final hand-in:** rerun the test/build commands on the final commit and insert fresh terminal screenshots. Do not reuse old output if the code has changed.

## 8. Deployment

- Frontend: https://2110400-saintsnexus-frontend.vercel.app/
- Backend: https://2110400-saintsnexus-backend.vercel.app/
- Health check: https://2110400-saintsnexus-backend.vercel.app/api/health
- API documentation: https://2110400-saintsnexus-backend.vercel.app/docs
- Source repository: https://github.com/Pistol-Saint/2110400-S6-SaintsNexus

Secrets are configured through environment variables and must not be included in the report or screenshots. The frontend API base URL is configured through `VITE_API_URL`.

## 9. GitHub workflow and project management

The repository history includes feature branches and merged pull requests. The inspected recent history includes:
- PR #1: Saints Nexus documentation.
- PR #4/#5: Course CRUD implementation.
- PR #6: Final-assessment authentication and admin features.
- Commit `0feaf273`: Vercel backend import-path fix.

See the repository's Pull Requests and commit history for full metadata:
https://github.com/Pistol-Saint/2110400-S6-SaintsNexus/pulls

## 10. Known gaps and future improvements

The following broader assessment requirements were not found in the inspected main-branch source and should be treated as incomplete:
1. Shared groups/teams, membership management, and granular permissions.
2. Login brute-force protection and temporary lockout.
3. CSV export for users, records, or activity.
4. Admin user search, filtering, and pagination.
5. Dedicated failed-login analytics/security dashboard.
6. HttpOnly-cookie refresh-token storage.
7. Expanded automated tests for token expiry/tampering, refresh-token reuse, ownership boundaries, banned-user flows, and comprehensive RBAC.

These should be prioritized in a future iteration. They are not claimed as delivered functionality in this report.

## 11. Conclusion

Saints Nexus demonstrates a deployed full-stack web application with course management, user authentication, session lifecycle handling, profile management, and basic administrator controls. The project uses a modular frontend/backend structure, Supabase persistence, password hashing, JWT validation, refresh-token rotation, backend authorization, audit records, and automated tests. The current release provides a working foundation while leaving clearly identified security, collaboration, and administration enhancements for future work.

## 12. Tools, references, and AI-use disclosure

- React, TypeScript, Vite, React Router documentation.
- FastAPI and Pydantic documentation.
- Supabase documentation.
- Vercel deployment documentation.
- Python, PyJWT, pwdlib/Argon2, pytest documentation.
- Git and GitHub documentation.

**AI assistance disclosure:** ChatGPT was used as an AI-assisted development and documentation aid for troubleshooting, code review/explanation, planning, and drafting/editing project documentation. The student must review all generated suggestions, verify the final code and report, and be prepared to explain the implementation. Amend this statement to accurately reflect the actual assistance used and the faculty's required disclosure format.

## Appendix A — Evidence

Attach the screenshots listed in `docs/FINAL_SUBMISSION_CHECKLIST.md`. Each screenshot should show the relevant deployed page or test output, with secrets and personal credentials hidden.

## Appendix B — Demonstration

Prepare a concise 5–8 minute walkthrough covering registration/login, course browsing and administration, profile/session management, administrator controls, and the deployed application/API. Use only test accounts deliberately prepared for assessment. Do not include passwords, access tokens, refresh tokens, or secret environment values in the recording.
