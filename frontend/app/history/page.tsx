"use client";

import { useEffect, useState } from "react";
import { getSessions, deleteSession, getSessionSets } from "@/lib/api";

interface Session {
  id: number;
  date: string;
  notes?: string;
  created_at: string;
}

interface SetDetail {
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_lbs: number;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [setsMap, setSetsMap] = useState<Record<number, SetDetail[]>>({});

  useEffect(() => {
    getSessions().then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  async function handleExpand(session: Session) {
    // if already expanded, collapse it
    if (expandedId === session.id) {
      setExpandedId(null);
      return;
    }

    // if we haven't loaded the sets for this session yet, fetch them
    if (!setsMap[session.id]) {
      const sets = await getSessionSets(session.id);
      setSetsMap((prev) => ({ ...prev, [session.id]: sets }));
    }

    setExpandedId(session.id);
  }

  async function handleDelete(id: number) {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Workout History</h1>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-400 text-sm">No workouts logged yet.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id} className="border border-gray-200 rounded">
              {/* Session header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleExpand(session)}
              >
                <div>
                  <p className="text-sm font-medium">{formatDate(session.date)}</p>
                  {session.notes && (
                    <p className="text-xs text-gray-400 mt-0.5">{session.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(session.id);
                    }}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                  <span className="text-gray-400 text-xs">
                    {expandedId === session.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded sets */}
              {expandedId === session.id && (
                <div className="border-t border-gray-100 px-4 py-3">
                  {!setsMap[session.id] ? (
                    <p className="text-xs text-gray-400">Loading...</p>
                  ) : setsMap[session.id].length === 0 ? (
                    <p className="text-xs text-gray-400">No sets logged.</p>
                  ) : (
                    <ul className="space-y-1">
                      {setsMap[session.id].map((s, i) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium">{s.exercise_name}</span>{" "}
                          — Set {s.set_number}: {s.reps} reps @ {s.weight_lbs} lbs
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}