# Saints Nexus — E-Learning Platform

Saints Nexus is a web-based e-learning platform built for the IUB CSE309 Web Applications project. It provides course discovery and administration, account authentication, profile/session management, and administrative user controls.

## Live deployment

- **Frontend:** https://2110400-saintsnexus-frontend.vercel.app/
- **Backend health:** https://2110400-saintsnexus-backend.vercel.app/api/health
- **API documentation:** https://2110400-saintsnexus-backend.vercel.app/docs
- **Repository:** https://github.com/Pistol-Saint/2110400-S6-SaintsNexus

## Technology

- Frontend: React, TypeScript, Vite, React Router
- Backend: Python, FastAPI
- Database: Supabase (PostgreSQL)
- Authentication: JWT access tokens, rotating opaque refresh tokens, Argon2 password hashing
- Hosting: Vercel
- Tests: pytest, FastAPI TestClient

## Implemented functionality

### Learners
- Register and sign in.
- Browse the course catalogue and view course details.
- View and update profile username.
- Change password after verifying the current password.
- View login sessions and revoke other active sessions.
- Sign out and use automatic access-token refresh.

### Administrators
- View dashboard counts for users, administrators, normal users, and banned accounts.
- View registered users.
- Promote/demote users between `user` and `admin`.
- Ban accounts with a reason and unban accounts.
- Review administrative audit logs.
- Create, update, and delete courses.

### API
- `/api/health`
- `/api/courses` and `/api/courses/{course_id}`
- `/api/auth/signup`, `login`, `refresh`, `logout`, `me`, `sessions`
- `/api/profile` and `/api/profile/change-password`
- `/api/admin/users`, role/ban/unban actions, and `/api/admin/audit-logs`

Open the deployed Swagger UI for the authoritative request/response schemas and endpoint details.

## Run locally

Requirements: Python 3.10+, Node.js 22+, and npm.

### Backend (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` locally with the required configuration:

```dotenv
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_api_key
JWT_SECRET_KEY=your_long_random_jwt_secret
PASSWORD_PEPPER=your_password_pepper
```

Do not commit real credentials. Start the API:

```powershell
fastapi dev main.py --port 8002
```

Backend docs: http://127.0.0.1:8002/docs

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://127.0.0.1:8002
```

Start the frontend:

```powershell
npm run dev
```

Open http://localhost:5173.

## Verification

From the repository root, with the backend virtual environment active:

```powershell
python -m pytest backend\tests -v
npm run build --prefix frontend
git diff --check
```

The project verification recorded for the final-assessment implementation was **9 passing backend tests** and a successful TypeScript/Vite production build. Re-run these commands against the final submitted commit and retain the actual terminal output as evidence.

## Environment and security notes

- Keep `backend/.env` and `frontend/.env.local` out of Git.
- Configure the equivalent environment variables in Vercel project settings; never place secret values in this README or screenshots.
- The current frontend stores access and refresh tokens in browser `sessionStorage`. The refresh token is not currently delivered through an HttpOnly cookie.
- Access tokens expire after 15 minutes; refresh tokens have a seven-day lifetime and are rotated on refresh.
- The inspected implementation does not currently include group/team permission management, login lockout, CSV export, or a dedicated failed-login security dashboard. These are recorded as limitations in `docs/FINAL_REPORT.md`; do not present them as completed features.

## Project documentation

- [Product Requirements Document](docs/PRD.md)
- [Software Requirements Specification](docs/SRS.md)
- [Technical Design Document](docs/TDD.md)
- [Final Project Report](docs/FINAL_REPORT.md)
- [Submission and Evidence Checklist](docs/FINAL_SUBMISSION_CHECKLIST.md)
- [Demo and Viva Script](docs/DEMO_SCRIPT.md)

## Academic integrity and tool disclosure

The project author is responsible for understanding, verifying, and defending the submitted implementation. If AI assistance was used during development or documentation, disclose it in accordance with the course/faculty policy and describe the actual nature of that assistance. Do not claim that generated or suggested material was independently authored if it was not.
