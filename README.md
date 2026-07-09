# Newsfeed Widget

A small Next.js widget that pulls the latest startup stories from the [Inc42](https://inc42.com)
RSS feed, auto-tags each story (funding / launch / acquisition / news), and shows them in a
filterable, sortable card grid.

## Getting Started

```bash
bun i          # install
bun run dev    # start the dev server
```

Then open http://localhost:3000.

> Uses [Bun](https://bun.sh) (`bun.lock`). To use npm/pnpm/yarn instead, delete `bun.lock` and run
> your installer — nothing in the code depends on Bun.

## Tech Stack

- **Next.js 16 (App Router)** — Server Components fetch the feed on the server.
- **TypeScript** — typed news items and tags.
- **Tailwind CSS v4** — styling, no separate CSS files.


## How It Works

**1. The server fetches and cleans the data.**
`app/page.tsx` is a Server Component. It calls `fetchNews()` (in `lib/news.ts`), which downloads the
Inc42 RSS feed, and converts each raw entry into a typed `NewsItem`:

```ts
type NewsItem = {
  title: string;
  source: string;   // "Inc42"
  date: string;     // ISO date string from the feed
  excerpt: string;  // first 180 chars of the summary
  link: string;     // article URL
  image?: string;   // best available thumbnail
  tag: Tag;          // inferred from the text 
};
```

The browser never touches the RSS feed — it only receives the finished array.

**2. Where each field comes from.**

- **Date** — read straight from the feed: `item.isoDate ?? item.pubDate ?? now`. So it's the
  article's real publish time, not when we fetched it.
- **Image** — feeds are inconsistent, so we try three spots and take the first:
  `enclosure.url → media:thumbnail.url → first <img> in the HTML`.
- **Tag** — the feed has no reliable category, so we guess. `inferTag` lowercases the title +
  summary and checks it against keyword lists (funding / launch / acquisition); if nothing matches
  it falls back to `news`. To tune the tagging, just edit the word lists in `lib/news.ts`.

**3. The client filters and sorts.**
`NewsFeed` receives the array and uses the `useNewsFilters` hook, which keeps three pieces of state —
tag, date range, and sort order — and runs the filtering/sorting in a single `useMemo`. Everything
happens in memory, so every click is instant with no refetching.

Date filtering (`isInRange` in `lib/date.ts`) compares each article against a cutoff:

- **Today** — since midnight today
- **This week** — today + previous 6 days
- **This month** — today + previous 30 days
- **All time** — no filtering

## Caching

`export const revalidate = 3600` in `page.tsx` tells Next.js to render the page once and only
re-fetch the feed at most once an hour, so Inc42 isn't hit on every request.

## Notes & Limitations

- **~20 items only.** An RSS feed is a "latest headlines" list, not an archive — it carries only the
  most recent posts (usually ~20) with no pagination or date lookup. `slice(0, 20)` caps the list;
  raising the number can't fetch more than the feed contains. The date filters narrow *within* those
  items, they don't look further back.
- **Tagging is a heuristic.** Keyword matching can mis-tag a headline or fall back to `news`.
- **Single source.** Only Inc42 is wired up, but `FEEDS` in `lib/news.ts` is an array and
  `Promise.allSettled` already handles multiple feeds — add an entry (and its image host to
  `next.config.ts`) to include another source.
