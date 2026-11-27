# Product Requirements Document (PRD) — Saints Nexus

## 1. Project Overview

Saints Nexus is a web-based e-learning platform developed for the IUB CSE309 Web Applications course. It provides a course catalogue, user registration and authentication, profile and session management, administrator controls, course management, audit logging, and a configured collaborative group workspace with permission-controlled resource operations.

The platform uses a React and TypeScript frontend, a FastAPI backend, and Supabase PostgreSQL for persistence. The frontend and backend are deployed through Vercel.

## 2. Problem Statement

Learners require a centralized platform to discover courses and manage their accounts. Platform administrators require secure and controlled tools to maintain course information, manage user accounts and roles, restrict abusive accounts, and review administrative activity. Collaborative activities also require controlled access to shared resources according to member permissions.

Saints Nexus addresses these needs through a web application with user authentication, role-based access control, course management, account management, session security, audit records, and a configured group workspace.

## 3. Product Goals

1. Provide a responsive interface for browsing courses.
2. Support user registration, login, and account self-service.
3. Secure user passwords using password hashing.
4. Implement access-token authentication and refresh-session management.
5. Restrict administrative operations through server-side authorization.
6. Allow administrators to manage users and courses.
7. Provide account banning, unbanning, session revocation, and audit logging.
8. Provide a collaborative workspace with granular resource permissions.
9. Deploy the application for remote assessment.
10. Maintain documentation and automated tests for the implemented system.

## 4. Target Users

### 4.1 Visitor
- Browse publicly available courses.
- Register an account.
- Log in.

### 4.2 Registered User
- Browse courses.
- Access the authenticated dashboard.
- View and update profile information.
- Change password after verifying the current password.
- View active sessions and revoke other sessions.
- Access group workspace resources according to assigned permissions.

### 4.3 Administrator
- Access learner functionality.
- View administrator dashboard statistics.
- View registered users.
- Change user roles.
- Ban and unban users.
- Review audit logs.
- Create, update, and delete courses.
- Perform platform-level administrative operations subject to backend authorization.

### 4.4 PROJECT AVENGERS Group Owner and Members
The configured PROJECT AVENGERS workspace supports permission-controlled resource operations.

- Group owner: Create, Update, Assign, View.
- Member with Create, Update, View: Create and edit resources, and view resources.
- Member with Assign, View: Assign resources and view resources.
- Member with View only: View resources.

The permissions are enforced by the backend rather than relying solely on frontend visibility.

## 5. Product Scope and Implemented Features

### 5.1 Course Catalogue
- Retrieve and display courses.
- Retrieve an individual course by its ID through the API.
- Allow administrators to create courses.
- Allow administrators to update courses.
- Allow administrators to delete courses.
- Validate course input, including non-empty titles and non-negative prices.

### 5.2 Authentication and Account Management
- Register accounts using email, username, and password.
- Reject duplicate registrations.
- Authenticate users with email and password.
- Hash passwords using Argon2.
- Issue short-lived signed JWT access tokens.
- Issue opaque refresh tokens with server-side hashed storage.
- Rotate refresh tokens after successful refresh.
- Revoke sessions during logout and relevant account-security operations.
- Allow authenticated users to view their current profile.
- Allow username updates subject to validation.
- Allow password changes after current-password verification.

### 5.3 Session Management
- Maintain authenticated sessions.
- List a user's active sessions.
- Revoke another active session.
- Reject revoked, expired, invalid, or otherwise unauthorized sessions.
- Revoke relevant sessions when accounts are banned or passwords are changed.

### 5.4 Administration
- Display user-related dashboard statistics.
- List registered users.
- Apply client-side search and role/status filtering to loaded user data.
- Apply client-side pagination to loaded user data.
- Change another user's role between user and admin.
- Ban users with a required reason.
- Unban users.
- Revoke relevant sessions during ban operations.
- Review administrative audit records.

### 5.5 PROJECT AVENGERS Workspace
- Provide a configured group workspace.
- Retrieve group resources.
- Create resources subject to Create permission.
- Update resources subject to Update permission.
- Assign resources subject to Assign permission.
- View resources subject to View permission.
- Enforce group permissions on the backend.
- Display permission-dependent workspace controls on the frontend.

The current implementation provides a configured workspace rather than a complete general-purpose group creation and membership-administration system.

### 5.6 Audit Logging
- Record relevant administrative and account-security activities.
- Allow administrators to retrieve recent audit records.
- Provide client-side filtering of loaded audit records where implemented.

## 6. Non-Functional Goals

### 6.1 Security
- Passwords are not stored in plaintext.
- Authentication is required for protected operations.
- Administrator operations require backend authorization.
- Tokens are validated before authenticated access.
- Session revocation is enforced.
- Sensitive configuration values are kept outside source control.

### 6.2 Maintainability
- Separate frontend components, services, contexts, and types.
- Separate backend routers, services, schemas, and security utilities.
- Use structured API responses and request validation.

### 6.3 Reliability
- Provide meaningful error responses.
- Reject invalid or unauthorized operations.
- Validate inputs before database operations.

### 6.4 Deployment
- Maintain a publicly accessible frontend and backend.
- Provide API documentation through FastAPI Swagger UI.
- Use environment-based configuration for deployment.

## 7. Success Criteria

- Public course catalogue works.
- Individual course API retrieval works.
- Registration and login work.
- Duplicate registrations are rejected.
- Passwords are stored as hashes.
- Access-token authentication works.
- Refresh-token rotation is enforced.
- Session revocation works.
- Profile and password-management workflows work.
- Administrator operations are restricted appropriately.
- Ban and unban operations work.
- Audit records are accessible to administrators.
- PROJECT AVENGERS permissions are enforced server-side.
- Automated tests pass.
- Frontend production build succeeds.
- Deployed frontend and backend are accessible.

## 8. Out of Scope and Known Limitations

The current release does not claim to provide:

- General-purpose group creation and membership administration.
- Login brute-force protection or temporary lockout.
- CSV exports for users, records, or audit logs.
- Server-side user search, filtering, and pagination.
- A dedicated failed-login security analytics dashboard.
- A comprehensive dedicated user-detail and security-analytics interface.
- Refresh-token delivery through an HttpOnly cookie.

The current user search, filters, and pagination operate on data loaded by the frontend. The PROJECT AVENGERS workspace is a configured permission-controlled workspace rather than a fully dynamic collaboration-management system.

## 9. Constraints and Risks

- Limited project-development time.
- Database and authentication secrets must remain private.
- Browser sessionStorage is accessible to scripts running in the browser, increasing exposure in the event of XSS.
- The current refresh-token implementation is not based on HttpOnly cookies.
- The existing automated test suite does not cover every authentication, security, administrative, and group-permission scenario.
- Some broader administration and security requirements remain future improvements.

## 10. Future Improvements

- General-purpose group creation and membership management.
- Expanded automated security and permission tests.
- Login rate limiting and brute-force protection.
- Server-side user filtering and pagination.
- CSV export.
- Dedicated failed-login analytics.
- Improved user-detail and moderation interfaces.
- Stronger token-storage architecture and additional security hardening.