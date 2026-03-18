# entry point for my backend
# evert api route call is here

from fastapi import FastAPI
from db import get_connection
from routers import exercises, sessions


app = FastAPI()

app.include_router(exercises.router)
app.include_router(sessions.router)

@app.get("/health")
def health():
    conn = get_connection()
    conn.close()
    return {"status": "ok", "db": "connected"}

@app.get("/money")
def health():
    return {"status": "yippie"}