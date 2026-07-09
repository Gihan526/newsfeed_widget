// Small date helpers shared by the newsfeed UI.

import type { Range } from "@/lib/types";

// Give back the same date but at midnight (00:00), so "today" starts at
// the beginning of the day rather than the current time.
export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Decide whether an article's date falls inside the chosen range.
export function isInRange(iso: string, range: Range): boolean {
  if (range === "all") return true;

  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false; // skip broken dates

  const cutoff = startOfDay(new Date());
  if (range === "today") {
    return time >= cutoff.getTime();
  }

  // "week" = last 7 days, "month" = last 31 days.
  const daysBack = range === "week" ? 6 : 30;
  cutoff.setDate(cutoff.getDate() - daysBack);
  return time >= cutoff.getTime();
}

// Turn an ISO date string into something readable, e.g. "Jul 9, 2026".
// If the date is missing or broken we just show the original text.
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
