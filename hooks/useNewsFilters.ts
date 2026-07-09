"use client";

// Keeps track of the three filter controls (tag, date range, sort) and
// works out which articles should be visible. Keeping this in one hook
// means NewsFeed only has to worry about drawing the UI.

import { useMemo, useState } from "react";
import { isInRange } from "@/lib/date";
import type { NewsItem, Range, Sort, Tag } from "@/lib/types";

export function useNewsFilters(items: NewsItem[]) {
  const [tag, setTag] = useState<Tag | "all">("all");
  const [range, setRange] = useState<Range>("all");
  const [sort, setSort] = useState<Sort>("desc");

  // useMemo re-runs the filtering/sorting only when the inputs change,
  // instead of on every single re-render.
  const visibleItems = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        (tag === "all" || item.tag === tag) && isInRange(item.date, range)
    );

    // -1 puts newest first, 1 puts oldest first.
    const direction = sort === "desc" ? -1 : 1;
    return [...filtered].sort(
      (a, b) =>
        direction * (new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }, [items, tag, range, sort]);

  return {
    tag,
    range,
    sort,
    setTag,
    setRange,
    setSort,
    visibleItems,
  };
}
