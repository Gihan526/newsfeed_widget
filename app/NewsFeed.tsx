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
  funding: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  launch:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  acquisition:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  news: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};


const TAGS: (Tag | "all")[] = ["all", "funding", "launch", "acquisition", "news"];

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
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const visible = useMemo(() => {
    const list = tag === "all" ? items : items.filter((i) => i.tag === tag);
    const dir = sort === "desc" ? -1 : 1;
    return [...list].sort(
      (a, b) => dir * (new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }, [items, tag, sort]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Startup Newsfeed
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="sm:ml-auto flex items-center gap-2 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Sort:</span>
          <button
            onClick={() => setSort("desc")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
              sort === "desc"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSort("asc")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
              sort === "asc"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-center py-20 text-sm text-zinc-500 dark:text-zinc-400">
          No articles with the &ldquo;{tag}&rdquo; tag right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((item) => (
            <article
              key={item.link}
              className="flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {item.image && (
                <div className="relative w-full h-40 bg-zinc-100 dark:bg-zinc-800">
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
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {item.source} · {formatDate(item.date)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TAG_STYLES[item.tag]}`}
                  >
                    {item.tag}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug mb-2">
                  {item.title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
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
