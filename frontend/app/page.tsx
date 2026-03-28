"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">GymTrack</h1>
      <p className="text-gray-400 text-sm mb-8">Your personal workout tracker</p>

      <div className="flex flex-col gap-3">
        <Link
          href="/log"
          className="block border border-gray-200 rounded px-4 py-4 hover:bg-gray-50"
        >
          <p className="font-medium text-sm">Log Workout</p>
          <p className="text-xs text-gray-400 mt-0.5">Record today's sets, reps, and weight</p>
        </Link>

        <Link
          href="/history"
          className="block border border-gray-200 rounded px-4 py-4 hover:bg-gray-50"
        >
          <p className="font-medium text-sm">Workout History</p>
          <p className="text-xs text-gray-400 mt-0.5">Browse your past workouts</p>
        </Link>

        <Link
          href="/exercises"
          className="block border border-gray-200 rounded px-4 py-4 hover:bg-gray-50"
        >
          <p className="font-medium text-sm">Exercise Library</p>
          <p className="text-xs text-gray-400 mt-0.5">Manage your saved exercises</p>
        </Link>
      </div>
    </main>
  );
}