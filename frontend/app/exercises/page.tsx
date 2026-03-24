//exercises page frontend

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getExercises, createExercise, deleteExercise, updateExercise } from "@/lib/api";

interface Exercise {
  id: number;
  name: string;
  created_at: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

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

  async function handleEditStart(exercise: Exercise) {
    setEditingId(exercise.id);
    setEditingName(exercise.name);
  }

  async function handleEditSave() {
    if (!editingName.trim() || editingId === null) return;
    const updated = await updateExercise(editingId, editingName.trim());
    setExercises((prev) =>
      prev.map((e) => (e.id === editingId ? { ...e, name: updated.name } : e))
    );
    setEditingId(null);
    setEditingName("");
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditingName("");
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back
      </Link>
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
              {editingId === exercise.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium">{exercise.name}</span>
              )}
              <div className="flex gap-2 ml-4">
                {editingId === exercise.id ? (
                  <>
                    <button
                      onClick={handleEditSave}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditStart(exercise)}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}