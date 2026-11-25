# Product Requirements Document (PRD) — Saints Nexus

## 1. Project overview

Saints Nexus is a web-based e-learning platform developed for the IUB CSE309 Web Applications course. It allows visitors and registered learners to explore a course catalogue. Registered users can manage their accounts, while administrators can manage courses and moderate user accounts.

## 2. Problem and goals

Learners need a centralized interface to discover available courses and maintain an account. Platform operators need protected tools to maintain course information, manage account roles, respond to misuse, and review administrative activity.

Project goals:
- Provide a responsive, understandable course catalogue.
- Support account registration, authentication, and account self-service.
- Restrict privileged operations to administrators.
- Provide basic administrative account controls and audit history.
- Deploy the frontend and API for remote demonstration.

## 3. Target users

- **Visitor:** Can access public course information and account registration/login.
- **Learner (user):** Can browse courses, view a dashboard, manage profile/password, and inspect/revoke other active sessions.
- **Administrator:** Has learner capabilities plus course CRUD, user listing, role management, ban/unban, dashboard counts, and audit-log access.

## 4. Implemented product scope

### 4.1 Course catalogue and management
- Display courses retrieved from the API/database.
- View an individual course.
- Allow administrators to create, update, and delete courses.
- Validate course title and non-negative price.

### 4.2 Authentication and account management
- Register accounts and authenticate using email/password.
- Hash passwords with Argon2 through pwdlib.
- Issue 15-minute JWT access tokens.
- Issue seven-day opaque refresh tokens, storing only their SHA-256 hashes in the database.
- Rotate refresh tokens when a refresh succeeds.
- Revoke sessions on logout, explicit session revocation, password change (other sessions), and account ban.
- Allow a user to update their username and change their password after supplying the current password.

### 4.3 Administration
- Display counts for all users, administrators, normal users, and banned accounts.
- List registered users.
- Change another user's role between user and admin.
- Ban a user with a required reason and unban a banned user.
- Review the latest administrative audit records.
- Restrict course write operations to administrators.

## 5. Out of scope / known gaps

The current inspected implementation does not include:
- Shared group/team creation, membership, or granular group permissions.
- Login attempt throttling or temporary account/IP lockout.
- CSV export.
- Search, filters, and pagination in the admin user table.
- A dedicated failed-login security analytics dashboard.
- HttpOnly-cookie storage for refresh tokens.

These are known gaps against the broader final-assessment checklist and must not be represented as completed product capabilities.

## 6. Success criteria

- Public course listing and course details respond through the deployed API.
- Registration/login and protected routes behave as intended.
- Invalid or expired access tokens are rejected; refresh-token rotation and session revocation are enforced server-side.
- Non-admin users cannot perform administrator-only course or user-management operations.
- Administrators can change roles and ban/unban other accounts.
- Profile, password, and session-management workflows work.
- Automated tests and frontend production build pass.
- Frontend and backend are accessible through the published Vercel URLs.

## 7. Constraints and risks

- Limited course-project schedule.
- Supabase credentials and JWT/password secrets must remain private.
- Browser sessionStorage is accessible to scripts executing in the page; an HttpOnly refresh-cookie design would provide stronger protection against token theft through XSS.
- Some broader security and collaboration requirements remain unimplemented and should be identified as future work.
