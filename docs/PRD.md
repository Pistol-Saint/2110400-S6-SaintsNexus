# Product Requirements Document (PRD) — Saints Nexus

## 1. Project Overview

Saints Nexus is a web-based e-learning platform designed to help students access online courses and learning materials. Administrators can manage courses and their associated lessons through a centralized system.

## 2. Project Goals

- Provide students with an organized platform for browsing courses and learning materials.
- Allow students to view course details and lesson information.
- Enable administrators to create, view, update, and delete courses.
- Develop a maintainable web application using React, TypeScript, FastAPI, and Python.

## 3. Target Users

- **Students:** Browse available courses and access course information and learning materials.
- **Administrators:** Manage courses and their associated learning content.

## 4. Core Features

### MVP — Midterm

- Display a list of available courses.
- View individual course details.
- Provide REST API endpoints for course management.
- Store and retrieve course information from a database.
- Run the frontend and backend locally.

### Beta — Final

- User registration and login.
- Role-Based Access Control (RBAC) for students and administrators.
- Student and administrator dashboards.
- Course enrollment and learning progress tracking.
- Deployment of the application.

## 5. User Stories

- As a student, I want to browse available courses so that I can find relevant learning materials.
- As a student, I want to view course details so that I can understand what a course offers.
- As an administrator, I want to manage courses so that course information remains up to date.
- As a student, I want to track my learning progress so that I can monitor my progress through a course.

## 6. Success Metrics

- Students can browse and view course information successfully.
- Course management operations work correctly through the backend API.
- Frontend and backend communicate successfully.
- Authentication and role-based permissions work correctly in the Beta release.

## 7. Risks and Constraints

- Limited development time may restrict the number of completed features.
- Database and API integration issues may affect development.
- Authentication and authorization must be implemented carefully.
- The project must remain within the required React + TypeScript and FastAPI + Python technology stack.

## 8. Project Scope

The MVP focuses on core course browsing, course information, and backend course management. The Beta release expands the platform with authentication, role-based access, dashboards, enrollment, progress tracking, and deployment.
