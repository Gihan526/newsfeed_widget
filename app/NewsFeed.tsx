"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type Tag = "funding" | "launch" | "acquisition" | "news";

export type NewsItem = {
  title: string;
  source: string;
  date: string;
  excerpt: string;
  link: string;
  image?: string;
  tag: Tag;
};

export const TAG_STYLES: {
  funding: string;
  launch: string;
  acquisition: string;
  news: string;
} = {
  funding: "bg-blue-100 text-blue-700",
  launch: "bg-emerald-100 text-emerald-700",
  acquisition: "bg-purple-100 text-purple-700",
  news: "bg-zinc-100 text-zinc-600",
};


const TAGS: (Tag | "all")[] = ["all", "funding", "launch", "acquisition", "news"];

type Range = "all" | "today" | "week" | "month";
const RANGES: { id: Range; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function inRange(iso: string, range: Range): boolean {
  if (range === "all") return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const today = startOfDay(new Date());
  const cutoff = new Date(today);
  if (range === "today") {
    return t >= cutoff.getTime();
  }
  cutoff.setDate(cutoff.getDate() - (range === "week" ? 6 : 30));
  return t >= cutoff.getTime();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NewsFeed({ items }: { items: NewsItem[] }) {
  const [tag, setTag] = useState<Tag | "all">("all");
  const [range, setRange] = useState<Range>("all");
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const visible = useMemo(() => {
    const list = items.filter(
      (i) => (tag === "all" || i.tag === tag) && inRange(i.date, range)
    );
    const dir = sort === "desc" ? -1 : 1;
    return [...list].sort(
      (a, b) => dir * (new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }, [items, tag, range, sort]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Startup Newsfeed
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {items.length} stories from Inc42
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${
                tag === t
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                range === r.id
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="sm:ml-auto flex items-center gap-2 text-xs">
          <span className="text-zinc-500">Sort:</span>
          <button
            onClick={() => setSort("desc")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
              sort === "desc"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSort("asc")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
              sort === "asc"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-center py-20 text-sm text-zinc-500">
          No articles match the current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((item) => (
            <article
              key={item.link}
              className="flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {item.image && (
                <div className="relative w-full h-40 bg-zinc-100">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500">
                    {item.source} · {formatDate(item.date)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TAG_STYLES[item.tag]}`}
                  >
                    {item.tag}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 leading-snug mb-2">
                  {item.title}
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm font-medium text-zinc-900 hover:underline"
                >
                  Read more
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
