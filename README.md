# GymTrack

GymTrack is a full stack workout tracker. It lets you manage exercises, log workout sessions, and review workout history. I'm
currently still working on and updating this project! :D

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- Database: PostgreSQL

## Features/Basic Overview

- Add, edit, and delete exercises
- Log sets with # of reps and weight (lbs)
- Log cardio workouts
- View workout history by date

## Project Structure

```text
gymtrack/
├── backend/   # FastAPI API and database access
└── frontend/  # Next.js app
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL

## Backend Setup

1. Create a PostgreSQL database.
2. Add a `.env` file in `backend/` with:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/gymtrack
```
** Make sure `backend/.env` is in your `.gitignore` file and is never commited!

3. Install backend dependencies:

```bash
cd backend
pip install fastapi uvicorn psycopg2-binary python-dotenv
```

4. Start the backend server:

```bash
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

## Frontend Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Main API Routes

- `GET /health` - backend/database health check
- `GET /exercises/` - list exercises
- `POST /exercises/` - create an exercise
- `PATCH /exercises/{exercise_id}` - update an exercise
- `DELETE /exercises/{exercise_id}` - delete an exercise
- `GET /sessions/` - list workout sessions
- `POST /sessions/` - create a workout session
- `GET /sessions/{session_id}/sets` - get sets for a session
- `DELETE /sessions/{session_id}` - delete a session

## Notes

- The frontend is currently hardcoded to call the backend at `http://127.0.0.1:8000`.
- The database schema must already exist before running the app.
- CORS is configured for local frontend development on port `3000`.

