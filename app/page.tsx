import Parser from "rss-parser";
import NewsFeed, { type NewsItem, type Tag } from "./NewsFeed";

export const revalidate = 3600;

type FeedItem = Parser.Item & {
  "media:thumbnail"?: { url?: string };
  enclosure?: { url?: string };
  description?: string;
};

const FEEDS: { url: string; source: string }[] = [
  { url: "https://inc42.com/feed", source: "Inc42" },
];

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "newsfeed-widget/1.0" },
});

function extractImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1];
}

function inferTag(text: string): Tag {
  const t = text.toLowerCase();
  if (
    /(rais|funding|series [a-z]|seed|invest|fund|ipo|debt|valuation|round|corpus|cheque|lead round)/.test(
      t
    )
  )
    return "funding";
  if (/(launch|unveil|debut|introduc|rolls? out|rollout|rolls out)/.test(t))
    return "launch";
  if (/(acquire|acquisition|buyout|merger|takes over|buys )/.test(t))
    return "acquisition";
  return "news";
}

async function fetchNews(itemsPerFeed = 100): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url);
      return (feed.items as FeedItem[]).slice(0, itemsPerFeed).map((item) => ({
        title: item.title ?? "Untitled",
        source,
        date: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        excerpt: (item.contentSnippet ?? "").slice(0, 180).trim(),
        link: item.link ?? "#",
        image:
          item.enclosure?.url ??
          item["media:thumbnail"]?.url ??
          extractImage(item.content ?? item.description ?? ""),
        tag: inferTag(`${item.title ?? ""} ${item.contentSnippet ?? ""}`),
      }));
    })
  );

  return results.flatMap((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : (console.error(`[feeds] ${FEEDS[i].source} failed:`, r.reason), [])
  );
}

export default async function Home() {
  const items = await fetchNews();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <NewsFeed items={items} />
    </div>
  );
}
