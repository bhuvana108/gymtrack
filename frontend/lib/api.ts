
const API_URL = "http://127.0.0.1:8000";
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

export async function updateExercise(id: number, name: string) {
  const res = await fetch(`${API_URL}/exercises/${id}`, {
    method: "PATCH", //used patch instead of post bc we're only updating the name of the exercise, change to PUT if errors occur
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

//Sessions 

export async function getSessions() {
  const res = await fetch(`${API_URL}/sessions/`);
  return res.json();
}

export async function getSessionSets(sessionId: number) {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/sets`);
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