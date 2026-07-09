"use client";

import { useMemo, useState } from "react";
import { isInRange } from "@/lib/date";
import type { NewsItem, Range, Sort, Tag } from "@/lib/types";

export function useNewsFilters(items: NewsItem[]) {
  const [tag, setTag] = useState<Tag | "all">("all");
  const [range, setRange] = useState<Range>("all");
  const [sort, setSort] = useState<Sort>("desc");

  const visibleItems = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        (tag === "all" || item.tag === tag) && isInRange(item.date, range),
    );

    const direction = sort === "desc" ? -1 : 1;
    return [...filtered].sort(
      (a, b) =>
        direction * (new Date(a.date).getTime() - new Date(b.date).getTime()),
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
