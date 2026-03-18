const API_URL = "http://localhost:8000";
//where the frontend and backend actually connect and talk to each other

//Exercises 

export async function getExercises() {
  const res = await fetch(`${API_URL}/exercises/`);
  return res.json();
}

export async function createExercise(name: string) {
  const res = await fetch(`${API_URL}/exercises/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteExercise(id: number) {
  await fetch(`${API_URL}/exercises/${id}`, { method: "DELETE" });
}

//Sessions 

export async function getSessions() {
  const res = await fetch(`${API_URL}/sessions/`);
  return res.json();
}

export async function createSession(data: {
  date: string;
  notes?: string;
  sets: {
    exercise_id: number;
    set_number: number;
    reps: number;
    weight_lbs: number;
  }[];
}) {
  const res = await fetch(`${API_URL}/sessions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSession(id: number) {
  await fetch(`${API_URL}/sessions/${id}`, { method: "DELETE" });
}