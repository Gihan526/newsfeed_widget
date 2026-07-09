"use client";

// The main component. It reads the filter state from the useNewsFilters
// hook, then renders the toolbar and the grid of cards.

import FilterBar from "@/components/FilterBar";
import NewsCard from "@/components/NewsCard";
import { useNewsFilters } from "@/hooks/useNewsFilters";
import type { NewsItem } from "@/lib/types";

export default function NewsFeed({ items }: { items: NewsItem[] }) {
  const { tag, range, sort, setTag, setRange, setSort, visibleItems } =
    useNewsFilters(items);

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

      <FilterBar
        tag={tag}
        range={range}
        sort={sort}
        onTagChange={setTag}
        onRangeChange={setRange}
        onSortChange={setSort}
      />

      {visibleItems.length === 0 ? (
        <p className="text-center py-20 text-sm text-zinc-500">
          No articles match the current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleItems.map((item) => (
            <NewsCard key={item.link} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
