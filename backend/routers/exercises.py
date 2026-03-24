from fastapi import APIRouter, HTTPException
from db import get_connection
from schemas import Exercise, ExerciseCreate


#getting exercise info 
router = APIRouter(prefix="/exercises", tags=["exercises"]) #every route in this file starts with /exercises

@router.get("/", response_model=list[Exercise])
def get_exercises(): #function runs anytime someone visits GET /exercises
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM exercises ORDER BY name ASC")
    exercises = cur.fetchall()
    cur.close()
    conn.close()
    return exercises


#receiving exercise info 
@router.post("/", response_model=Exercise) #someone is sending data to /exercises
def create_exercise(exercise: ExerciseCreate):
    conn = get_connection()
    cur = conn.cursor()
    #writes to DB
    cur.execute(    
        "INSERT INTO exercises (name) VALUES (%s) RETURNING *",
        (exercise.name,)
    )
    new_exercise = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return new_exercise

#deleting exercise info 
@router.delete("/{exercise_id}")
def delete_exercise(exercise_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM exercises WHERE id = %s RETURNING id", (exercise_id,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return {"deleted": exercise_id}

#updating exercise info
@router.patch("/{exercise_id}", response_model=Exercise)
def update_exercise(exercise_id: int, exercise: ExerciseCreate):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE exercises SET name = %s WHERE id = %s RETURNING *",
        (exercise.name, exercise_id)
    )
    updated_exercise = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if not updated_exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return updated_exercise