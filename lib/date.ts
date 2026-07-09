//date helpers.

import type { Range } from "@/lib/types";

export function isInRange(iso: string, range: Range): boolean {
  if (range === "all") return true;

  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);

  if (range === "week") cutoff.setDate(cutoff.getDate() - 6); // today + 6 days
  if (range === "month") cutoff.setDate(cutoff.getDate() - 30); // today + 30 days

  return time >= cutoff.getTime();
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
