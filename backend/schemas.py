from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

#Exercises
class ExerciseCreate(BaseModel):
    name: str

class Exercise(BaseModel):
    id: int
    name: str
    created_at: datetime

#Sets
class SetCreate(BaseModel):
    exercise_id: int
    set_number: int
    reps: int
    weight_lbs: float

class Set(BaseModel):
    id: int
    session_id: int
    exercise_id: int
    set_number: int
    reps: int
    weight_lbs: float

#Sessions/Workouts
class SessionCreate(BaseModel):
    date: date
    notes: Optional[str] = None
    sets: list[SetCreate] = []

class Session(BaseModel):
    id: int
    date: date
    notes: Optional[str] = None
    created_at: datetime


'''
two versions for each model (set, exercise, session) 
exerciseCreate is what the frontend sees when creating (no id)
exercises is what the backend returns after saving (id is created and saved in db)
'''