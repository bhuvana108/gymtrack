"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessions, getSessionSets } from "@/lib/api";

interface Session {
  id: number;
  date: string;
  notes?: string;
  created_at: string;
}

interface SetDetail {
  exercise_name: string;
  set_number: number;
  reps?: number;
  weight_lbs?: number;
  time?: number;
  level?: number;
  speed?: number;
  incline?: number;
}

interface GroupedSessions {
  date: string;
  sessions: Session[];
  allSets?: SetDetail[];
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [setsMap, setSetsMap] = useState<Record<string, SetDetail[]>>({});

  useEffect(() => {
    getSessions().then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  async function handleExpand(date: string) {
    // if already expanded, collapse it
    if (expandedDate === date) {
      setExpandedDate(null);
      return;
    }

    // if we haven't loaded the sets for this date yet, fetch them
    if (!setsMap[date]) {
      const sessionsForDate = sessions.filter((s) => s.date === date);
      const allSets: SetDetail[] = [];

      for (const session of sessionsForDate) {
        const sets = await getSessionSets(session.id);
        allSets.push(...sets);
      }

      setSetsMap((prev) => ({ ...prev, [date]: allSets }));
    }

    setExpandedDate(date);
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

  // Group sessions by date
  const groupedByDate = sessions.reduce((acc, session) => {
    const existing = acc.find((g) => g.date === session.date);
    if (existing) {
      existing.sessions.push(session);
    } else {
      acc.push({ date: session.date, sessions: [session] });
    }
    return acc;
  }, [] as GroupedSessions[]);

  // Sort by date descending
  groupedByDate.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="max-w-xl mx-auto p-6">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Workout History</h1>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : groupedByDate.length === 0 ? (
        <p className="text-gray-400 text-sm">No workouts logged yet.</p>
      ) : (
        <ul className="space-y-3">
          {groupedByDate.map((group) => (
            <li key={group.date} className="border border-gray-200 rounded">
              {/* Date header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleExpand(group.date)}
              >
                <div>
                  <p className="text-sm font-medium">{formatDate(group.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">
                    {expandedDate === group.date ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded sets */}
              {expandedDate === group.date && (
                <div className="border-t border-gray-100 px-4 py-3">
                  {!setsMap[group.date] ? (
                    <p className="text-xs text-gray-400">Loading...</p>
                  ) : setsMap[group.date].length === 0 ? (
                    <p className="text-xs text-gray-400">No sets logged.</p>
                  ) : (
                    <>
                      <ul className="space-y-2 mb-3">
                        {setsMap[group.date].map((s, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium">{s.exercise_name}</span> — {s.time !== undefined ? `${s.time}min @ ${s.speed}${s.exercise_name.toLowerCase() === "treadmill" ? "mph" : ""}${s.level !== undefined ? ` (Pace ${s.level})` : ""}` : `Set ${s.set_number}: ${s.reps} reps @ ${s.weight_lbs} lbs`}
                          </li>
                        ))}
                      </ul>
                    </>
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