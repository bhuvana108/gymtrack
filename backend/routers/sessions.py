from fastapi import APIRouter, HTTPException
from db import get_connection
from schemas import Session, SessionCreate

router = APIRouter(prefix="/sessions", tags=["sessions"])


#get sessions
@router.get("/", response_model=list[Session])
def get_sessions():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sessions ORDER BY date DESC")
    sessions = cur.fetchall()
    cur.close()
    conn.close()
    return sessions

#post/create sessions
@router.post("/", response_model=Session)
def create_session(session: SessionCreate):
    conn = get_connection()
    cur = conn.cursor()

    #Step 1: insert the session
    cur.execute(
        "INSERT INTO sessions (date, notes) VALUES (%s, %s) RETURNING *",
        (session.date, session.notes)
    )
    new_session = cur.fetchone()
    session_id = new_session["id"]

    #Step 2: insert each set linked to this session
    for s in session.sets:
        cur.execute(
            """INSERT INTO sets (session_id, exercise_id, set_number, reps, weight_lbs)
               VALUES (%s, %s, %s, %s, %s)""",
            (session_id, s.exercise_id, s.set_number, s.reps, s.weight_lbs)
        )

    conn.commit()
    cur.close()
    conn.close()
    return new_session

#delete session
@router.delete("/{session_id}")
def delete_session(session_id: int):
    conn = get_connection()
    cur = conn.cursor()
    # delete sets first (they depend on the session)
    cur.execute("DELETE FROM sets WHERE session_id = %s", (session_id,))
    # then delete the session
    cur.execute("DELETE FROM sessions WHERE id = %s RETURNING id", (session_id,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"deleted": session_id}

@router.get("/{session_id}/sets")
def get_session_sets(session_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.set_number, s.reps, s.weight_lbs, e.name as exercise_name
        FROM sets s
        JOIN exercises e ON s.exercise_id = e.id
        WHERE s.session_id = %s
        ORDER BY e.name, s.set_number
    """, (session_id,))
    sets = cur.fetchall()
    cur.close()
    conn.close()
    return sets