//exercises page frontend

"use client";

import { useEffect, useState } from "react";
import { getExercises, createExercise, deleteExercise } from "@/lib/api";

interface Exercise {
  id: number;
  name: string;
  created_at: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExercises().then((data) => {
      setExercises(data);
      setLoading(false);
    });
  }, []);

  async function handleAdd() {
    if (!newName.trim()) return;
    const created = await createExercise(newName.trim());
    setExercises((prev) => [...prev, created]);
    setNewName("");
  }

  async function handleDelete(id: number) {
    await deleteExercise(id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Exercise Library</h1>

      {/* Add exercise */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="e.g. Bench Press"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
        >
          Add
        </button>
      </div>

      {/* Exercise list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : exercises.length === 0 ? (
        <p className="text-gray-400 text-sm">No exercises yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {exercises.map((exercise) => (
            <li
              key={exercise.id}
              className="flex items-center justify-between border border-gray-200 rounded px-4 py-3"
            >
              <span className="text-sm font-medium">{exercise.name}</span>
              <button
                onClick={() => handleDelete(exercise.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}