export type Tag = "funding" | "launch" | "acquisition" | "news";

export type NewsItem = {
  title: string;
  source: string;
  date: string; // ISO date string"
  excerpt: string;
  link: string;
  image?: string;
  tag: Tag;
};

export type Range = "all" | "today" | "week" | "month";

export type Sort = "desc" | "asc";

export const TAG_STYLES: Record<Tag, string> = {
  funding: "bg-blue-100 text-blue-700",
  launch: "bg-emerald-100 text-emerald-700",
  acquisition: "bg-purple-100 text-purple-700",
  news: "bg-zinc-100 text-zinc-600",
};

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
