# Saints Nexus E-Learning Website
## Software Requirements Specification (SRS)

**Project:** Saints Nexus E-Learning Website
**Course:** CSE309 — Web Applications
**Student ID:** 2110400
**Section:** 6
**Version:** 1.0

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements of the Saints Nexus E-Learning Website. It specifies the system's expected behavior, user roles, security requirements, administrative features, course management, session management, and group-based permissions.

### 1.2 Scope

Saints Nexus is a web-based e-learning platform designed to provide users with access to an online course catalogue, account management, authentication, administrative operations, activity logging, and a group workspace with different permission levels.

The system uses a React and TypeScript frontend, a FastAPI backend, a Supabase PostgreSQL database, and Vercel deployment.

### 1.3 Definitions

- **Visitor:** A user who has not authenticated.
- **Registered User:** An authenticated user with regular platform access.
- **Administrator:** An authenticated user with administrative privileges.
- **Access Token:** A short-lived JWT used to authenticate API requests.
- **Refresh Token:** A credential used to renew authentication.
- **RBAC:** Role-Based Access Control.
- **Audit Log:** A record of selected system actions.
- **PROJECT AVENGERS:** The configured group workspace with different permission assignments.

---

## 2. Functional Requirements

### FR-01: User Registration

The system shall allow users to register accounts using the registration form.

- The system shall validate submitted registration information.
- Duplicate email registrations shall be rejected.
- Passwords shall be stored using Argon2 password hashing.
- Registration shall create a user account in the database.

### FR-02: User Login

The system shall authenticate users using their credentials.

- The system shall reject incorrect credentials.
- The system shall provide authentication tokens following successful authentication.
- Authentication shall be required for protected resources.
- Banned accounts shall not be permitted to access protected platform functionality.

### FR-03: Authentication and Token Management

The system shall implement JWT-based authentication.

- Access tokens shall be used for protected API requests.
- Refresh tokens shall be used to renew access.
- Refresh-token rotation shall be implemented.
- Refresh tokens shall be stored in hashed form on the server.
- Revoked sessions shall no longer be valid.
- Authentication credentials shall be handled by the frontend authentication service.

### FR-04: User Profile Management

Authenticated users shall be able to access and manage their profile information.

- Users shall view their profile information.
- Users shall update supported profile fields.
- Users shall change their passwords.
- Incorrect current passwords shall prevent password changes.

### FR-05: Session Management

The system shall provide session-related functionality.

- Users shall be able to view their active sessions.
- Users shall be able to revoke supported sessions.
- Revoked authentication sessions shall be invalidated.
- Session operations shall require authentication.

### FR-06: Course Catalogue

The system shall provide a course catalogue.

- Users shall retrieve available courses.
- Course information shall include supported course fields such as title, description, price and identifier.
- The backend shall provide course retrieval endpoints.
- The catalogue shall retrieve course data from the backend API.

### FR-07: Course Administration

Administrators shall be able to manage course records.

- Administrators shall create courses.
- Administrators shall update courses.
- Administrators shall delete courses.
- Unauthorized users shall not be permitted to perform administrator-only course operations.

### FR-08: Administrator Dashboard

The system shall provide an administrative dashboard.

- Administrators shall view user-related statistics.
- Administrators shall view registered users.
- Administrators shall view role and account status information.
- Administrators shall perform supported administrative operations.

### FR-09: User Role Management

The system shall allow authorized administrators to manage user roles.

- Administrators shall be able to assign supported roles.
- The system shall prevent administrators from changing their own role through the protected administrative operation.
- Role-management requests shall require administrative authorization.

### FR-10: Account Ban Management

The system shall support account banning and unbanning.

- Authorized administrators shall ban supported accounts.
- Authorized administrators shall unban supported accounts.
- The system shall reject access by banned users.
- Self-banning shall be prevented.
- Protected administrative operations shall enforce authorization.

### FR-11: Audit Logging

The system shall record supported administrative and security-related activities.

- Audit records shall be stored for supported actions.
- Administrators shall access audit-log records.
- Audit-log retrieval shall be restricted to authorized administrators.
- The administrative interface shall display supported activity records.

### FR-12: PROJECT AVENGERS Group Workspace

The system shall provide the configured group workspace named **PROJECT AVENGERS**.

- The group workspace shall provide shared resource functionality.
- Members shall have different permissions based on their configured access.
- Group resource operations shall be enforced by the backend.
- The system shall support resource creation, updating and assignment according to permissions.
- Unauthorized group operations shall be rejected.

### FR-13: Group Resource Management

The group workspace shall support resource operations.

- Authorized users shall create group resources.
- Authorized users shall update group resources.
- Authorized users shall assign resources.
- Users with View permission shall access permitted group information and resources.
- The backend shall validate permission requirements for each operation.

### FR-14: API Access

The backend shall expose API endpoints for the frontend.

- The API shall provide health-check functionality.
- The API shall provide course operations.
- The API shall provide authentication operations.
- The API shall provide administrative operations.
- The API shall provide group workspace operations.
- The API shall enforce authentication and authorization where required.

---

## 3. Non-Functional Requirements

### NFR-01: Security

- Passwords shall not be stored as plaintext.
- Password hashing shall use Argon2.
- Protected endpoints shall validate authentication.
- Protected administrative operations shall enforce role authorization.
- Group permissions shall be enforced by the backend.
- Refresh tokens shall be stored in hashed form.
- Revocation and banning shall be enforced by protected backend operations.

### NFR-02: Reliability

- The backend shall return appropriate responses for supported operations.
- Invalid requests shall not be treated as successful operations.
- Missing resources shall return appropriate error responses.
- The application shall handle API failures without treating failed operations as successful.

### NFR-03: Maintainability

- Frontend and backend shall be separated.
- Backend routes shall be organized into modules.
- Authentication-related frontend functionality shall use dedicated service and context components.
- The project shall maintain documentation for requirements, design and implementation.

### NFR-04: Usability

- Users shall access the course catalogue through the frontend.
- Authentication-related pages shall provide access to login and registration.
- Users shall access profile and dashboard functionality.
- Administrative features shall be accessible through the administrative interface.
- Group workspace functionality shall be accessible through the frontend.

### NFR-05: Deployment

- The frontend shall be deployable using Vercel.
- The backend shall be deployable using Vercel.
- The database shall be hosted using Supabase.
- Environment-specific configuration shall be used for deployment.

### NFR-06: Testability

- Backend functionality shall be testable through automated tests.
- API functionality shall be accessible through Swagger/OpenAPI documentation.
- Frontend production builds shall be verifiable through the build process.

---

## 4. User Roles and Permission Matrix

| Feature | Visitor | Registered User | Administrator |
|---|---|---|---|
| View course catalogue | Yes | Yes | Yes |
| Register account | Yes | No | No |
| Login | Yes | No | No |
| View own profile | No | Yes | Yes |
| Update own profile | No | Yes | Yes |
| Change own password | No | Yes | Yes |
| View own sessions | No | Yes | Yes |
| Revoke supported sessions | No | Yes | Yes |
| Create course | No | No | Yes |
| Update course | No | No | Yes |
| Delete course | No | No | Yes |
| View admin dashboard | No | No | Yes |
| Manage user roles | No | No | Yes |
| Ban/unban users | No | No | Yes |
| View administrative audit logs | No | No | Yes |

### 4.1 PROJECT AVENGERS Group Permission Matrix

| Group Member | Create | Update | Assign | View |
|---|---|---|---|---|
| saints_adminX | Yes | Yes | Yes | Yes |
| saints_userZ | Yes | Yes | No | Yes |
| saints_userZ2 | No | No | Yes | Yes |
| saints_userZ3 | No | No | No | Yes |
| saints_adminX2 | No group membership | No | No | No |

**Note:** `saints_adminX2` is a platform administrator but is not a configured member of PROJECT AVENGERS. Platform administration and group membership are separate authorization contexts.

---

## 5. Use Cases

### UC-01: Register Account

**Actor:** Visitor

**Precondition:** The visitor is not authenticated.

**Main flow:**
1. The visitor opens the registration page.
2. The visitor submits registration information.
3. The system validates the information.
4. The system checks for duplicate email registration.
5. The system hashes the password.
6. The system stores the account.

**Postcondition:** The account is registered successfully.

### UC-02: Login

**Actor:** Visitor or registered user

**Precondition:** The account exists and is not banned.

**Main flow:**
1. The user opens the login page.
2. The user enters credentials.
3. The backend validates credentials.
4. The system generates authentication credentials.
5. The user accesses protected functionality.

**Postcondition:** The user is authenticated.

### UC-03: Update Profile

**Actor:** Registered user

**Precondition:** The user is authenticated.

**Main flow:**
1. The user opens the profile page.
2. The user modifies supported profile information.
3. The user submits changes.
4. The system validates and updates the profile.

**Postcondition:** The supported profile information is updated.

### UC-04: Manage Courses

**Actor:** Administrator

**Precondition:** The administrator is authenticated and authorized.

**Main flow:**
1. The administrator accesses the course-management functionality.
2. The administrator creates, updates or deletes a course.
3. The backend validates the administrator's role.
4. The system performs the requested operation.

**Postcondition:** The supported course operation is completed.

### UC-05: Ban a User

**Actor:** Administrator

**Precondition:** The administrator is authenticated and authorized.

**Main flow:**
1. The administrator accesses the user-management interface.
2. The administrator selects a user.
3. The administrator initiates the ban operation.
4. The backend validates authorization and restrictions.
5. The system updates the account status.

**Postcondition:** The account is banned and protected access is rejected.

### UC-06: Perform Group Resource Operation

**Actor:** PROJECT AVENGERS member

**Precondition:** The user is authenticated and has the required group permission.

**Main flow:**
1. The user opens PROJECT AVENGERS.
2. The user selects an available resource operation.
3. The frontend sends the request.
4. The backend validates the user's group permission.
5. The backend performs the operation if authorized.

**Postcondition:** The permitted operation is completed or the unauthorized operation is rejected.

---

## 6. Acceptance Criteria

### AC-01: Registration Validation

- **Given** a visitor submits valid registration information,
- **When** the information is processed,
- **Then** the account shall be created if the registration requirements are satisfied.

### AC-02: Authentication

- **Given** a registered account with valid credentials,
- **When** the user submits a login request,
- **Then** the backend shall authenticate the user and provide the supported authentication credentials.

### AC-03: Invalid Login

- **Given** a user submits incorrect credentials,
- **When** the backend processes the request,
- **Then** the login shall be rejected.

### AC-04: Profile Password Validation

- **Given** an authenticated user submits an incorrect current password,
- **When** the user attempts to change the password,
- **Then** the password change shall be rejected.

### AC-05: Administrative Course Authorization

- **Given** a non-administrator attempts a protected course-management operation,
- **When** the backend processes the request,
- **Then** the operation shall be rejected.

### AC-06: User Ban Enforcement

- **Given** an account is banned,
- **When** the account attempts protected access,
- **Then** the backend shall reject the protected request.

### AC-07: Group Permission Enforcement

- **Given** a group member does not possess the required permission,
- **When** the member attempts an unauthorized group operation,
- **Then** the backend shall reject the request.

### AC-08: Session Revocation

- **Given** an authenticated user has a supported active session,
- **When** the user revokes that session,
- **Then** the revoked session shall no longer be accepted.

---

## 7. Requirements Traceability

| Requirement | Implementation | Verification |
|---|---|---|
| FR-01 Registration | Authentication backend and frontend | Registration functionality and backend tests |
| FR-02 Login | Authentication service and backend | Authentication tests |
| FR-03 Token management | Authentication backend | Token/session verification |
| FR-04 Profile management | Profile page and backend | Profile/password functionality |
| FR-05 Session management | Auth routes and frontend | Session operations |
| FR-06 Course catalogue | Course API and frontend | Course retrieval and tests |
| FR-07 Course administration | Course API | Course authorization tests |
| FR-08 Admin dashboard | Admin frontend | Dashboard functionality |
| FR-09 Role management | Admin backend and frontend | Role-management verification |
| FR-10 Ban management | Admin backend | Ban/unban and access verification |
| FR-11 Audit logging | Admin backend | Audit-log retrieval |
| FR-12 Group workspace | Group routes and frontend | Group access verification |
| FR-13 Group resource management | Group routes and frontend | Permission verification |
| FR-14 API access | FastAPI backend | Swagger/OpenAPI and tests |

---

## 8. Limitations

The following functionalities are outside the current verified implementation or are not fully implemented:

- General-purpose group creation and membership management.
- Dedicated failed-login analysis dashboard.
- CSV export functionality.
- Server-side user search, filtering and pagination.
- Comprehensive dedicated user security-detail analytics.
- Full bulk moderation operations.
- Automated login brute-force protection and rate limiting.
- Refresh-token authentication using an HttpOnly cookie-based architecture.

These limitations are documented to distinguish the current implementation from potential future enhancements.

---

## 9. Future Enhancements

- General group creation and membership management.
- Expanded security analytics.
- Dedicated failed-login analysis.
- CSV export.
- Server-side user search and pagination.
- Expanded bulk moderation.
- Automated rate limiting and brute-force prevention.
- HttpOnly cookie-based authentication.
- Expanded automated security and authorization tests.

---

**End of SRS**
