// The toolbar at the top of the feed. It lets the user filter by tag,
// filter by date range, and choose the sort order.
//
// This component does not hold any state itself. It receives the current
// values and "setter" functions and just draws the buttons.

import FilterButton from "@/components/ui/FilterButton";
import {
  RANGE_OPTIONS,
  TAG_OPTIONS,
  type Range,
  type Sort,
  type Tag,
} from "@/lib/types";

type FilterBarProps = {
  tag: Tag | "all";
  range: Range;
  sort: Sort;
  onTagChange: (tag: Tag | "all") => void;
  onRangeChange: (range: Range) => void;
  onSortChange: (sort: Sort) => void;
};

export default function FilterBar({
  tag,
  range,
  sort,
  onTagChange,
  onRangeChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        {TAG_OPTIONS.map((option) => (
          <FilterButton
            key={option}
            label={option}
            active={tag === option}
            onClick={() => onTagChange(option)}
          />
        ))}
      </div>

      {/* Date range filters */}
      <div className="flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((option) => (
          <FilterButton
            key={option.id}
            label={option.label}
            active={range === option.id}
            onClick={() => onRangeChange(option.id)}
          />
        ))}
      </div>

      {/* Sort order */}
      <div className="sm:ml-auto flex items-center gap-2 text-xs">
        <span className="text-zinc-500">Sort:</span>
        <FilterButton
          label="Newest"
          active={sort === "desc"}
          onClick={() => onSortChange("desc")}
        />
        <FilterButton
          label="Oldest"
          active={sort === "asc"}
          onClick={() => onSortChange("asc")}
        />
      </div>
    </div>
  );
}
