# entry point for my backend
# evert api route call is here

from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/money")
def health():
    return {"status": "yippie"}