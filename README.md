# Newsfeed Widget

A small Next.js widget that pulls the latest startup stories from the [Inc42](https://inc42.com)
RSS feed, auto-tags each story (funding / launch / acquisition / news), and shows them in a
filterable, sortable card grid.

---

## Getting Started

Install dependencies:

```bash
bun i
```

Run the dev server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Uses [Bun](https://bun.sh) as the package manager (`bun.lock`). If you prefer npm/pnpm/yarn,
> delete `bun.lock`, run your installer, and swap the commands accordingly - nothing in the code
> depends on Bun itself.

---

## Tech Stack

- **Framework - Next.js 16 (App Router).** Server Components let us fetch the feed on the server.
- **Language - TypeScript.** Typed feed items + tags catch mistakes early.
- **Styling - Tailwind CSS v4.** Fast to build a clean card UI with no separate CSS files.
- **Feed parsing - `rss-parser`.** Handles RSS/Atom quirks so we don't hand-parse XML.
- **Images - `next/image`.** Automatic optimization + lazy loading for feed thumbnails.

---

## How It Works

The app is two files doing two jobs.

### 1. `app/page.tsx` - the server (data)

This is a **React Server Component**. It runs on the server, fetches the feed, transforms it, and
hands a clean array of items to the UI. The browser never sees the RSS feed or makes the network
request itself.

The data flow:

```
Inc42 RSS feed(XML over HTTP)  -->  rss-parser(parseURL)  -->  transform each item(title/date/image/tag)  -->  NewsItem[](typed data)  -->  <NewsFeed />(client UI)
```

For each raw feed item I build a typed `NewsItem`:

```ts
type NewsItem = {
  title: string;
  source: string;   // "Inc42"
  date: string;     // ISO date string
  excerpt: string;  // first 180 chars of the summary
  link: string;     // canonical article URL
  image?: string;   // best available thumbnail (see below)
  tag: Tag;         // inferred, see below
};
```

**Image resolution** - feeds are inconsistent about where they put the thumbnail, so I try three
sources in order and take the first that exists:

```
enclosure.url  ->  media:thumbnail.url  ->  first <img> in the HTML body
```

**How each item's date is decided** - the feed doesn't always expose a clean date, so I pick one
with a three-step fallback (first that exists wins):

```
item.isoDate  ->  item.pubDate  ->  new Date().toISOString()
```

- `isoDate` - `rss-parser`'s normalized ISO-8601 date (e.g. `2026-07-07T09:30:00Z`). Preferred
  because it's unambiguous and safe to sort/compare.
- `pubDate` - the raw date string straight from the RSS XML. Used only if `isoDate` is missing.
- `new Date().toISOString()` - today's date, as a last resort so a dateless item still has a valid
  date and never breaks sorting/filtering (downside: it then looks brand-new).

So the stored date is the **article's publish time from the feed**, not when we fetched it. On the
client, `formatDate` renders it as `Jul 7, 2026`, and `inRange` (via `startOfDay`) compares it
against today to bucket it into today / week / month.

> **Dates are not guessed with regex.** They come from a real, structured `<pubDate>` field that the
> publisher provides and `rss-parser` reads directly - so they're trustworthy. The **only** thing we
> infer with regex is the **tag** (below), because the feed has no reliable category. In short:
> **date = read from the feed; tag = guessed from the text.**

**Tag inference** (`inferTag`) - the feed has no category I can trust, so I guess a tag by
running regexes over the title + summary. First match wins, in priority order:

```
funding      -  rais / funding / series X / seed / invest / ipo / round / valuation 
launch       -  launch / unveil / debut / introduc / rolls out 
acquisition  -  acquire / acquisition / buyout / merger / takes over / buys 
news         -  (default when nothing else matches)
```

**Resilience** - feeds go down. i wrap the fetch in `Promise.allSettled` so a failed feed is
logged and skipped (returns `[]`) instead of crashing the whole page. This also makes the code
**multi-feed ready**: `FEEDS` is an array, so adding another source is a one-line change and each
source is fetched independently.

**Caching (ISR)** - `export const revalidate = 3600` tells Next.js to render the page once, cache
the HTML, and only re-fetch the feed at most once per hour. Visitors get an instant static page;
Inc42 doesn't get hammered on every request.

### 2. `app/NewsFeed.tsx` - the client (UI)

A **Client Component** (`"use client"`) that receives the finished `NewsItem[]` and handles all
interaction in the browser. It holds three pieces of state:

- **Tag filter** - all / funding / launch / acquisition / news
- **Date range** - all time / today / this week / this month
- **Sort** - newest or oldest first

Filtering and sorting run in a single `useMemo` over the items already in memory - no refetching,
so every click is instant. It renders a responsive 1/2/3-column card grid, and shows a friendly
"No articles match" message when filters exclude everything.

### Supporting files

- **`app/layout.tsx`** - root layout, loads the Geist fonts and global styles.
- **`app/globals.css`** - Tailwind import + base theme tokens.
- **`next.config.ts`** - whitelists `inc42.com` and `asset.inc42.com` as allowed image hosts.
  `next/image` refuses to optimize images from un-listed domains, so any new feed's image host must
  be added here too.

---

## Why the feed only returns ~20 items (how count really works)

**I fetch from Inc42's site-wide RSS feed, not the homepage.**
`https://inc42.com/feed` is a machine-readable XML endpoint  that lists
Inc42's **most recent posts across the whole site**, newest first. It is *not* the homepage HTML and
*not* a single category.

**An RSS feed is a "latest headlines" list, not a searchable archive.**
The publisher decides how many recent posts appear in the XML (WordPress defaults to 10; sites often
raise it to ~20). As
new articles are published, older ones drop off the bottom. There is **no date parameter, no
pagination, and no way to ask for "last month."** Those older articles still exist on inc42.com -
they're just not in the feed anymore.

**`slice(0, 20)` is a ceiling, not a request.**
In `fetchNews`, `itemsPerFeed = 20` and we do `.slice(0, 20)`. Slice can only *shorten* the list
the feed already gave us - it can't fetch more. So:

> **Items shown = min(items the feed contains, your slice value).**

That's why **raising `20` to `100` does not give you 100** - if the feed only carries ~20 items,
you get ~20 no matter how high you set the number. (Lowering it to, say, 5 *does* work, because then
your slice is the smaller limit.)

**The date-range filter narrows, it does not look back.**
"This week" / "This month" filter *within* the ~20 items already loaded - they never fetch older
data. If all 20 items happen to be from this week, "This month" and "All time" look identical.

### Why have All time / Today / This week / This month filters ?

Since we can't fetch older data, "all 20 items are from the same day" does *not* mean "all 20 items are from the same day." Inc42
publishes several stories a day, so the 20 most-recent items usually **span a few days** - the newest
might be from today and the oldest a few days back. There's a real date spread *inside* the data we
already have, and the filter narrows within it:

- **Today** - the useful one. Out of ~20 items spanning a few days, it shows only today's
  stories ("what's new right now?"). This is the view most people actually want.
- **This week** - useful only when the 20 items happen to reach back past 7 days; often they don't,
  so it may match everything.
- **This month** - almost always identical to **All time**, because 20 recent items rarely span a
  whole month.

They were built this way for two reasons: (1) once you have a "Today" filter, adding week/month is
nearly free - same code, more buttons; and (2) **future-proofing** - if the item count is raised,
more feeds are added, or history is later accumulated in a database, the longer ranges become
meaningful immediately with zero new code.
.

---

## Design Decisions & Trade-offs

**Server-side fetch + ISR, instead of fetching in the browser**
Chosen so the page is fast and SEO-friendly, the feed URL/parsing stays on the server, and Inc42
isn't hit on every page view. *Trade-off:* content can be up to 1 hour stale (tunable via
`revalidate`).

**Regex tag inference, instead of an LLM/API or trusting feed categories**
Chosen because it's free, instant, needs no API key, and the feed's own categories aren't reliable.
*Trade-off:* it's a heuristic - headlines can be mis-tagged or fall back to generic `news`. The
rules live in one function (`inferTag`) and are easy to tweak.

**Client-side filtering & sorting, instead of server round-trips**
Chosen because the dataset is tiny (~20 items), so filtering in memory is instant and needs no
extra endpoints. *Trade-off:* wouldn't scale to thousands of items - that would call for
server-side or paginated filtering.

**`Promise.allSettled` + array-shaped `FEEDS`, instead of a single hardcoded fetch**
Chosen so one broken feed can't take down the page, and adding sources later is trivial.
*Trade-off:* slightly more code than a single `fetch` for what is currently one source - a
deliberate bet on future extensibility.

**Three-step image fallback + host whitelist, instead of assuming one image field**
Chosen because RSS feeds are inconsistent about thumbnails; the fallback chain maximizes the chance
of showing an image. *Trade-off:* `next.config.ts` must list every image host, so a new feed needs a
config change, not just a code change.

---


## Known Limitations & Possible Next Steps

- **Recent-only data.** Limited to whatever the RSS feed currently carries (~20 items). Historical /
  by-month browsing would require accumulating items in a database or using a real API.
- **Heuristic tagging.** `inferTag` can misclassify; a larger keyword set or a model-based classifier
  would improve accuracy.
- **Single source.** Only Inc42 is wired up, though the code supports multiple feeds - add entries to
  `FEEDS` (and their image hosts to `next.config.ts`).
- **Metadata polish.** `app/layout.tsx` still uses the default Next.js `<title>`/description - worth
  updating before shipping.
