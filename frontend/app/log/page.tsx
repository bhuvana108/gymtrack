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

const REST_PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "60s", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
];

function formatSetDetail(set: SetEntry) {
  const hasTime = set.time != null;
  const hasSpeed = set.speed != null;
  const hasLevel = set.level != null;

  if (hasTime) {
    const speedSuffix = hasSpeed
      ? ` @ ${set.speed}${set.exercise_name.toLowerCase() === "treadmill" ? "mph" : ""}`
      : "";
    const levelSuffix = hasLevel ? ` (Level ${set.level})` : "";

    return `${set.time}min${speedSuffix}${levelSuffix}`;
  }

  return `Set ${set.set_number}: ${set.reps} reps @ ${set.weight_lbs} lbs`;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
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
  const [inputError, setInputError] = useState("");
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedRestSeconds, setSelectedRestSeconds] = useState<number | null>(null);
  const [remainingRestSeconds, setRemainingRestSeconds] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [restTimerCompleted, setRestTimerCompleted] = useState(false);

  const selectedExercise = exercises.find((e) => e.id === Number(selectedExerciseId));
  const isCardio = selectedExercise && (selectedExercise.name.toLowerCase() === "treadmill" || selectedExercise.name.toLowerCase() === "stairmaster");
  const isTreadmill = selectedExercise && selectedExercise.name.toLowerCase() === "treadmill";

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  useEffect(() => {
    if (!isRestTimerRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingRestSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timer);
          setIsRestTimerRunning(false);
          setRestTimerCompleted(true);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRestTimerRunning]);

  function validateRange(value: string) {
    if (value === "") {
      setInputError("");
      return;
    }

    const num = Number(value);
    if (num < 0 || num > 300) {
      setInputError("Invalid input entered! (Range: 0-300)");
    } else {
      setInputError("");
    }
  }

  function handleAddSet() {
    if (!selectedExercise) return;
    setInputError("");

    const repsValue = Number(reps);
    const weightValue = Number(weight);
    const timeValue = Number(time);
    const levelValue = Number(level);
    const speedValue = Number(speed);
    const inclineValue = Number(incline);

    if (isCardio) {
      if (!time) {
        setInputError("Enter time for cardio.");
        return;
      }
      if (isTreadmill) {
        if (!speed) {
          setInputError("Enter time and speed for treadmill.");
          return;
        }
      } else if (!level) {
        setInputError("Enter time and level for stairmaster.");
        return;
      }
      if (
        timeValue < 0 ||
        timeValue > 300 ||
        (level && (levelValue < 0 || levelValue > 300)) ||
        (speed && (speedValue < 0 || speedValue > 300)) ||
        (isTreadmill && incline && (inclineValue < 0 || inclineValue > 300))
      ) {
        setInputError("Invalid Input entered");
        return;
      }
    } else {
      if (!reps || !weight) {
        setInputError("Enter reps and weight before adding a set.");
        return;
      }
      if (repsValue < 0 || repsValue > 300 || weightValue < 0 || weightValue > 300) {
        setInputError("Invalid Input entered");
        return;
      }
    }

    // count how many sets already exist for this exercise
    const existingSets = sets.filter(
      (s, index) => s.exercise_id === selectedExercise.id && index !== editingSetIndex
    );

    const newSet: SetEntry = {
      exercise_id: selectedExercise.id,
      exercise_name: selectedExercise.name,
      set_number:
        editingSetIndex !== null && sets[editingSetIndex]?.exercise_id === selectedExercise.id
          ? sets[editingSetIndex].set_number
          : existingSets.length + 1,
    };

    if (isCardio) {
      newSet.time = timeValue;
      if (level) {
        newSet.level = levelValue;
      }
      if (speed) {
        newSet.speed = speedValue;
      }
      if (isTreadmill && incline) {
        newSet.incline = inclineValue;
      }
    } else {
      newSet.reps = repsValue;
      newSet.weight_lbs = weightValue;
    }

    setSets((prev) => {
      if (editingSetIndex !== null) {
        return prev.map((set, index) => (index === editingSetIndex ? newSet : set));
      }
      return [...prev, newSet];
    });

    // reset fields
    setReps("");
    setWeight("");
    setTime("");
    setLevel("");
    setSpeed("");
    setIncline("");
    setEditingSetIndex(null);
  }

  function handleRemoveSet(index: number) {
    setInputError("");

    if (editingSetIndex === index) {
      setEditingSetIndex(null);
      setSelectedExerciseId("");
      setReps("");
      setWeight("");
      setTime("");
      setLevel("");
      setSpeed("");
      setIncline("");
    }

    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function handleEditSet(index: number) {
    const setToEdit = sets[index];
    if (!setToEdit) return;

    setInputError("");
    setEditingSetIndex(index);
    setSelectedExerciseId(setToEdit.exercise_id);

    if (setToEdit.time != null) {
      setTime(String(setToEdit.time));
      setLevel(setToEdit.level != null ? String(setToEdit.level) : "");
      setSpeed(setToEdit.speed != null ? String(setToEdit.speed) : "");
      setIncline(setToEdit.incline != null ? String(setToEdit.incline) : "");
      setReps("");
      setWeight("");
    } else {
      setReps(setToEdit.reps != null ? String(setToEdit.reps) : "");
      setWeight(setToEdit.weight_lbs != null ? String(setToEdit.weight_lbs) : "");
      setTime("");
      setLevel("");
      setSpeed("");
      setIncline("");
    }
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

  function handleSelectRestPreset(seconds: number) {
    setSelectedRestSeconds(seconds);
    setRemainingRestSeconds(seconds);
    setIsRestTimerRunning(false);
    setRestTimerCompleted(false);
  }

  function handleStartRestTimer() {
    if (remainingRestSeconds === 0) {
      return;
    }

    setIsRestTimerRunning(true);
    setRestTimerCompleted(false);
  }

  function handleToggleRestTimer() {
    if (remainingRestSeconds === 0) {
      return;
    }

    setIsRestTimerRunning((currentValue) => !currentValue);
    setRestTimerCompleted(false);
  }

  function handleResetRestTimer() {
    setSelectedRestSeconds(null);
    setRemainingRestSeconds(0);
    setIsRestTimerRunning(false);
    setRestTimerCompleted(false);
  }

  async function handleSave() {
    if (sets.length === 0) return;
    setInputError("");
    setSaving(true);

    await createSession({
      date,
      notes: notes || undefined,
      sets: sets.map((set) => {
        const { exercise_id, set_number } = set;
        const baseSet = { exercise_id, set_number };
        
        if (set.time != null) {
          return { ...baseSet, time: set.time, level: set.level, speed: set.speed, ...(set.incline != null && { incline: set.incline }) };
        } else {
          return { ...baseSet, reps: set.reps, weight_lbs: set.weight_lbs };
        }
      }),
    });

    setSaving(false);
    setSaved(true);
    setSets([]);
    setNotes("");
    setEditingSetIndex(null);
    setSelectedExerciseId("");
    setReps("");
    setWeight("");
    setTime("");
    setLevel("");
    setSpeed("");
    setIncline("");
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

      <div className="border border-gray-200 rounded p-4 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold">Rest Timer</h2>
            <p className="text-xs text-gray-400 mt-1">
              Start a countdown between sets and reset it whenever you are ready.
            </p>
          </div>
          {(selectedRestSeconds !== null || restTimerCompleted) && (
            <button
              type="button"
              onClick={handleResetRestTimer}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {REST_PRESETS.map((preset) => {
            const isSelected = selectedRestSeconds === preset.seconds;

            return (
              <button
                key={preset.seconds}
                type="button"
                onClick={() => handleSelectRestPreset(preset.seconds)}
                className={`rounded border px-3 py-2 text-sm transition ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div
          className={`rounded border px-4 py-5 text-center ${
            restTimerCompleted
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            {restTimerCompleted
              ? "Rest complete"
              : isRestTimerRunning
                ? "Resting"
                : remainingRestSeconds > 0
                  ? "Paused"
                  : "Ready"}
          </p>
          <p
            className={`text-3xl font-semibold ${
              restTimerCompleted ? "text-green-600" : "text-gray-900"
            }`}
          >
            {formatTimer(remainingRestSeconds)}
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleStartRestTimer}
            disabled={remainingRestSeconds === 0 || isRestTimerRunning}
            className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-40"
          >
            Start
          </button>
          <button
            type="button"
            onClick={handleToggleRestTimer}
            disabled={remainingRestSeconds === 0 || restTimerCompleted}
            className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            {isRestTimerRunning ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={handleResetRestTimer}
            disabled={selectedRestSeconds === null && !restTimerCompleted}
            className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Add a set / cardio info */}
      <div className="border border-gray-200 rounded p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">
          {editingSetIndex !== null
            ? isCardio
              ? "Edit Cardio Details"
              : "Edit Set"
            : isCardio
              ? "Add Cardio Details"
              : "Add a Set"}
        </h2>
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
                  min="0"
                  max="300"
                  step="0.1"
                  placeholder="Time (min)"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    validateRange(e.target.value);
                  }}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                />
                {isTreadmill && (
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="0.1"
                    placeholder="Speed (mph)"
                    value={speed}
                    onChange={(e) => {
                      setSpeed(e.target.value);
                      validateRange(e.target.value);
                    }}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                )}
              </div>
              <div className="flex gap-2">
                {!isTreadmill && (
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="0.1"
                    placeholder="Level"
                    value={level}
                    onChange={(e) => {
                      setLevel(e.target.value);
                      validateRange(e.target.value);
                    }}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                )}
                {isTreadmill && (
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="0.1"
                    placeholder="Incline (%)"
                    value={incline}
                    onChange={(e) => {
                      setIncline(e.target.value);
                      validateRange(e.target.value);
                    }}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="300"
                placeholder="Reps"
                value={reps}
                onChange={(e) => {
                  setReps(e.target.value);
                  validateRange(e.target.value);
                }}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              />
              <input
                type="number"
                min="0"
                max="300"
                placeholder="Weight (lbs)"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  validateRange(e.target.value);
                }}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              />
            </div>
          )}

          <button
            onClick={handleAddSet}
            className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
          >
            {editingSetIndex !== null
              ? isCardio
                ? "Save Cardio Changes"
                : "Save Set Changes"
              : `+ ${isCardio ? "Add Cardio Details" : "Add Set"}`}
          </button>

          {inputError && (
            <p className="text-red-500 text-xs mt-1">{inputError}</p>
          )}
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
                  <span className="font-medium">{s.exercise_name}</span> — {formatSetDetail(s)}
                </span>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => handleEditSet(i)}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveSet(i)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
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
