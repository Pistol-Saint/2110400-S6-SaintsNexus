# Technical Design Document (TDD) — Saints Nexus

## 1. Overview

Saints Nexus is a web-based e-learning platform built with React + TypeScript on the frontend and FastAPI + Python on the backend. The application follows a client-server architecture in which the frontend communicates with the backend through REST APIs.

## 2. Technology Stack

- **Frontend:** React, TypeScript
- **Backend:** Python, FastAPI
- **API Communication:** HTTP and REST
- **Database:** To be confirmed from the existing project configuration.
- **Version Control:** Git and GitHub

## 3. System Architecture

The system consists of three main layers:

1. **Frontend:** Displays course information and provides user interaction.
2. **Backend:** Handles API requests, validates input, and implements application logic.
3. **Database:** Stores and retrieves course information and, in the Beta release, user accounts, enrollments, and learning progress.

The frontend sends HTTP requests to the backend. The backend processes each request, interacts with the database when necessary, and returns an appropriate response.

## 4. Project Structure

The project is organized into separate frontend and backend applications, with documentation stored in the `docs/` directory.

- `frontend/` — React + TypeScript application.
- `backend/` — FastAPI + Python application.
- `docs/PRD.md` — Product requirements.
- `docs/SRS.md` — Software requirements.
- `docs/TDD.md` — Technical design.

The internal frontend and backend module structures shall follow the existing project implementation.

## 5. API Design

The backend shall expose REST API endpoints for course operations.

Planned API operations include:

| Method | Purpose |
|---|---|
| GET | Retrieve the list of courses |
| GET | Retrieve a specific course |
| POST | Create a course |
| PUT | Update a course |
| DELETE | Delete a course |

The final endpoint paths, request schemas, response schemas, and status codes must match the implemented FastAPI routes.

## 6. Data Model

### 6.1 Course

The course entity may include:

- Course ID — unique identifier.
- Title — course name.
- Description — information about the course.
- Additional fields — based on the existing project requirements.

### 6.2 Beta Data Model

The Beta release may introduce the following entities:

- **User:** Account
