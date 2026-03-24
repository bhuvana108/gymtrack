"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getExercises, createSession } from "@/lib/api";

interface Exercise {
  id: number;
  name: string;
}

interface SetEntry {
  exercise_id: number;
  exercise_name: string;
  set_number: number;
  reps?: number;
  weight_lbs?: number;
  time?: number;
  level?: number;
  speed?: number;
  incline?: number;
}

export default function LogPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([]);

  // current set being built
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | "">("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [time, setTime] = useState("");
  const [level, setLevel] = useState("");
  const [speed, setSpeed] = useState("");
  const [incline, setIncline] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const selectedExercise = exercises.find((e) => e.id === Number(selectedExerciseId));
  const isCardio = selectedExercise && (selectedExercise.name.toLowerCase() === "treadmill" || selectedExercise.name.toLowerCase() === "stairmaster");
  const isTreadmill = selectedExercise && selectedExercise.name.toLowerCase() === "treadmill";

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  function handleAddSet() {
    if (!selectedExercise) return;

    if (isCardio) {
      if (isTreadmill) {
        if (!time || !speed) return;
      } else {
        if (!time || !level) return;
      }
    } else {
      if (!reps || !weight) return;
    }

    // count how many sets already exist for this exercise
    const existingSets = sets.filter((s) => s.exercise_id === selectedExercise.id);

    const newSet: SetEntry = {
      exercise_id: selectedExercise.id,
      exercise_name: selectedExercise.name,
      set_number: existingSets.length + 1,
    };

    if (isCardio) {
      newSet.time = Number(time);
      if (isTreadmill) {
        newSet.speed = Number(speed);
        if (incline) {
          newSet.incline = Number(incline);
        }
      } else {
        newSet.level = Number(level);
      }
    } else {
      newSet.reps = Number(reps);
      newSet.weight_lbs = Number(weight);
    }

    setSets((prev) => [...prev, newSet]);

    // reset fields
    setReps("");
    setWeight("");
    setTime("");
    setLevel("");
    setSpeed("");
    setIncline("");
  }

  function handleRemoveSet(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;

    //error, fixed to using try catch so browser accepts user input
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
      }
    } catch {
      input.focus();
    }
  }

  async function handleSave() {
    if (sets.length === 0) return;
    setSaving(true);

    await createSession({
      date,
      notes: notes || undefined,
      sets: sets.map((set) => {
        const { exercise_id, set_number } = set;
        const baseSet = { exercise_id, set_number };
        
        if (set.time !== undefined) {
          return { ...baseSet, time: set.time, level: set.level, speed: set.speed, ...(set.incline !== undefined && { incline: set.incline }) };
        } else {
          return { ...baseSet, reps: set.reps, weight_lbs: set.weight_lbs };
        }
      }),
    });

    setSaving(false);
    setSaved(true);
    setSets([]);
    setNotes("");
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Log Workout</h1>

      {/* Date */}
        <div className="mb-4">
        <label htmlFor="workout-date" className="block text-sm font-medium mb-1">
            Date
        </label>
        <input
            id="workout-date"
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onClick={openDatePicker}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
        />
        </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Felt strong today"
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
        />
      </div>

      {/* Add a set / cardio */}
      <div className="border border-gray-200 rounded p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">{isCardio ? "Add Cardio Details" : "Add a Set"}</h2>
        <div className="flex flex-col gap-2">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value === "" ? "" : Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Select exercise...</option>
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          {isCardio ? (
            <>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Time (min)"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                />
                {isTreadmill ? (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Speed (mph)"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Speed Number (e.g. 1, 2, 6)"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                )}
              </div>
              <div className="flex gap-2">
                {isTreadmill && (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Incline (%)"
                    value={incline}
                    onChange={(e) => setIncline(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              />
              <input
                type="number"
                placeholder="Weight (lbs)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              />
            </div>
          )}

          <button
            onClick={handleAddSet}
            className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
          >
            + {isCardio ? "Add Cardio Details" : "Add Set"}
          </button>
        </div>
      </div>

      {/* Sets logged so far */}
      {sets.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Sets Logged</h2>
          <ul className="space-y-2">
            {sets.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between border border-gray-200 rounded px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium">{s.exercise_name}</span> — {s.time !== undefined ? `${s.time}min @ ${s.speed}${s.exercise_name.toLowerCase() === "treadmill" ? "mph" : ""}${s.level !== undefined ? ` (Pace ${s.level})` : ""}` : `${s.reps} reps @ ${s.weight_lbs} lbs`}
                </span>
                <button
                  onClick={() => handleRemoveSet(i)}
                  className="text-red-400 hover:text-red-600 text-xs ml-4"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save */}
      {saved && (
        <p className="text-green-600 text-sm mb-3">Workout saved!</p>
      )}
      <button
        onClick={handleSave}
        disabled={sets.length === 0 || saving}
        className="w-full bg-black text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save Workout"}
      </button>
    </main>
  );
}