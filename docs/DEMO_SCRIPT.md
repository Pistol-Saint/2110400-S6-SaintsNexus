# Saints Nexus — 5–8 Minute Demo and Viva Guide

## Before recording

- Use the deployed frontend: https://2110400-saintsnexus-frontend.vercel.app/
- Keep the API Swagger UI ready: https://2110400-saintsnexus-backend.vercel.app/docs
- Prepare one administrator and one normal test account; keep credentials private.
- Ensure the admin account is not banned and the demo user has a known role.
- Close unrelated tabs and hide password managers, private messages, and secret values.
- Do not display or copy JWTs, refresh tokens, database keys, or passwords.

## Suggested 6-minute walkthrough

### 0:00–0:35 — Introduction
"Hello, this is Saints Nexus, a full-stack e-learning platform built for CSE309. The frontend uses React and TypeScript, the backend uses FastAPI and Python, Supabase provides persistence, and the application is deployed on Vercel."

Show the deployed home page and course catalogue.

### 0:35–1:20 — Course catalogue
Show the course list and a course detail if available. Explain that the frontend retrieves course data from the REST API. If demonstrating admin course CRUD, use the admin account and create/update/delete only a disposable demo course.

### 1:20–2:10 — Registration and login
Show the registration/login interface. Explain password validation and that the backend hashes passwords with Argon2. Sign in with a prepared normal-user account.

### 2:10–3:15 — Profile and sessions
Open the dashboard and profile. Show username update, password-change form without exposing a real password, session list, and the revoke action. Explain that the backend checks ownership and active session status.

### 3:15–4:35 — Administrator features
Sign out and sign in with the admin account. Show dashboard counts, user list, role-change control, ban/unban workflow on a disposable account, and audit logs. Explain that privileged routes are protected by backend admin dependencies.

### 4:35–5:25 — API and deployment
Open Swagger UI and show representative authentication, profile, admin, and course endpoints. Show the health endpoint and mention the Vercel deployment.

### 5:25–6:10 — Tests and honest limitations
Show the terminal output from the latest `pytest` run and frontend production build. Briefly state that group/team permissions, login lockout, CSV export, and richer security analytics remain future work in this submitted version. Do not imply these are implemented.

### 6:10–6:30 — Conclusion
"Saints Nexus demonstrates a deployed full-stack application with course management, account authentication, session handling, profile management, and administrator controls. Thank you."

## Viva questions to practise

**1. Why React and TypeScript?**  
React supports reusable component-based interfaces. TypeScript adds static type checking to catch many mistakes during development.

**2. Why FastAPI?**  
FastAPI provides typed request handling, Pydantic validation, dependency injection, and generated OpenAPI/Swagger documentation.

**3. What is JWT?**  
A signed token carrying claims that the server validates. In this project, the access token contains the user subject, role, session ID, issuer, issued-at time, and expiry.

**4. Why have access and refresh tokens?**  
The short-lived access token is used for API requests. A longer-lived refresh token can obtain a new access token without asking the user to log in each time.

**5. What happens when a refresh token is rotated?**  
The backend hashes the presented token, finds the active session, validates expiry, replaces the stored hash with a new token hash, and returns a new refresh token. The old token should no longer work.

**6. How are passwords stored?**  
The password is transformed using Argon2 password hashing. The database stores the resulting hash, not the original password.

**7. What is RBAC?**  
Role-Based Access Control assigns permissions according to a user's role. Here, backend dependencies distinguish authenticated users from administrators.

**8. Why is backend authorization necessary if the frontend hides admin buttons?**  
Frontend checks improve usability but can be bypassed. The API must independently reject unauthorized requests.

**9. What happens when an administrator bans a user?**  
The user record is marked banned with a reason, active sessions are revoked, and an audit event is recorded. Authenticated requests check the ban state.

**10. What is the purpose of audit logs?**  
They provide a history of important events such as login outcomes and administrative actions, supporting accountability and troubleshooting.

**11. What are the current limitations?**  
The inspected version lacks group/team permission management, login lockout, CSV export, admin filtering/pagination, and a dedicated failed-login analytics page. Refresh tokens are stored in sessionStorage rather than HttpOnly cookies.

**12. What would you improve next?**  
Implement granular group permissions, brute-force throttling, CSV exports, richer admin search and security analytics, move refresh tokens to Secure HttpOnly cookies with suitable CSRF controls, and add tests for token expiry, tampering, ownership, and RBAC boundaries.

## Important viva advice

Explain the actual code path and be honest about limitations. If asked about a feature that is not implemented, say so and describe how you would design it. Never claim a screenshot, test, or feature exists unless you can demonstrate it.
