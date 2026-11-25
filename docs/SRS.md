# Software Requirements Specification (SRS) — Saints Nexus

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements of Saints Nexus, a web-based e-learning platform for browsing courses and accessing learning materials.

### 1.2 Scope

Saints Nexus allows students to explore available courses and allows administrators to manage course information. The MVP focuses on core course functionality, while the Beta release introduces authentication, role-based access, dashboards, enrollment, and progress tracking.

### 1.3 Technology Stack

- **Frontend:** React + TypeScript
- **Backend:** FastAPI + Python
- **Database:** To be confirmed based on the project's actual database configuration.
- **API:** RESTful HTTP endpoints

## 2. User Roles

- **Student:** Can browse available courses and view course details and learning materials.
- **Administrator:** Can manage course information and associated learning content.

In the Beta release, access to restricted features must depend on the authenticated user's role.

## 3. Functional Requirements

### 3.1 Course Browsing — MVP

- FR-01: The system shall display a list of available courses.
- FR-02: The system shall allow users to view the details of an individual course.
- FR-03: The system shall retrieve course information through the backend API.
- FR-04: The system shall display appropriate feedback when course information cannot be retrieved.

### 3.2 Course Management — MVP

- FR-05: The backend shall support creating a course.
- FR-06: The backend shall support retrieving course information.
- FR-07: The backend shall support updating an existing course.
- FR-08: The backend shall support deleting a course.
- FR-09: The system shall validate course data before saving changes.

### 3.3 Authentication and Authorization — Beta

- FR-10: The system shall allow users to register and log in.
- FR-11: The system shall distinguish between student and administrator roles.
- FR-12: The system shall restrict administrative operations to authorized administrators.
- FR-13: The system shall provide role-appropriate dashboards.

### 3.4 Enrollment and Progress — Beta

- FR-14: Students shall be able to enroll in available courses.
- FR-15: The system shall associate enrollments with the relevant student and course.
- FR-16: The system shall support tracking student learning progress.

## 4. Non-Functional Requirements

- NFR-01 — Usability: The interface should be understandable and easy to navigate.
- NFR-02 — Performance: Course information should load within a reasonable response time under normal local development conditions.
- NFR-03 — Security: Inputs must be validated, and restricted operations must be protected.
- NFR-04 — Maintainability: Frontend and backend code should be organized into understandable modules.
- NFR-05 — Reliability: The system should handle invalid requests and API errors without crashing.
- NFR-06 — Compatibility: The application should support modern web browsers.

## 5. External Interface Requirements

### 5.1 User Interface

The frontend shall provide pages or components for course browsing and course details. Administrative interfaces will support course management as the project develops.

### 5.2 Software Interface

The React + TypeScript frontend shall communicate with the FastAPI + Python backend through HTTP requests to REST API endpoints.

### 5.3 API Interface

The API shall return appropriate HTTP status codes and structured responses. Exact endpoint paths and request/response formats shall be documented in the Technical Design Document
