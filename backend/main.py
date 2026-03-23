# entry point for my backend
# evert api route call is here

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection
from routers import exercises, sessions


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exercises.router)
app.include_router(sessions.router)

@app.get("/health")
def health():
    conn = get_connection()
    conn.close()
    return {"status": "ok", "db": "connected"}

@app.get("/money")
def money():
    return {"status": "yippie"}