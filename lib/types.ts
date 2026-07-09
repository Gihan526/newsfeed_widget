// Shared types and constants used across the newsfeed UI.

// The kind of story. We show a coloured label for each one.
export type Tag = "funding" | "launch" | "acquisition" | "news";

// A single news article after we clean it up from the RSS feed.
export type NewsItem = {
  title: string;
  source: string;
  date: string; // ISO date string, e.g. "2026-07-09T10:00:00Z"
  excerpt: string;
  link: string;
  image?: string;
  tag: Tag;
};

// A date filter option shown in the toolbar.
export type Range = "all" | "today" | "week" | "month";

// How the list is ordered.
export type Sort = "desc" | "asc";

// Tailwind classes for each tag's coloured pill.
export const TAG_STYLES: Record<Tag, string> = {
  funding: "bg-blue-100 text-blue-700",
  launch: "bg-emerald-100 text-emerald-700",
  acquisition: "bg-purple-100 text-purple-700",
  news: "bg-zinc-100 text-zinc-600",
};

// Options for the filter buttons. "all" means "don't filter".
export const TAG_OPTIONS: (Tag | "all")[] = [
  "all",
  "funding",
  "launch",
  "acquisition",
  "news",
];

export const RANGE_OPTIONS: { id: Range; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];
