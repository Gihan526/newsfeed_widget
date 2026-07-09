//fetch news
import Parser from "rss-parser";
import type { NewsItem, Tag } from "@/lib/types";

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

// Pull the first <img> if there is one.
function extractImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1];
}

const TAG_KEYWORDS: { tag: Tag; words: string[] }[] = [
  {
    tag: "funding",
    words: [
      "rais",
      "funding",
      "seed",
      "invest",
      "ipo",
      "debt",
      "valuation",
      "round",
    ],
  },
  {
    tag: "launch",
    words: ["launch", "unveil", "debut", "introduc", "rollout", "rolls out"],
  },
  {
    tag: "acquisition",
    words: ["acquire", "acquisition", "buyout", "merger", "buys", "takes over"],
  },
];

// Guess tag name .
function inferTag(text: string): Tag {
  const lower = text.toLowerCase();
  const match = TAG_KEYWORDS.find(({ words }) =>
    words.some((word) => lower.includes(word)),
  );
  return match?.tag ?? "news";
}

// Fetch every feed at once.
export async function fetchNews(itemsPerFeed = 20): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url);
      const items = feed.items as FeedItem[];

      return items.slice(0, itemsPerFeed).map((item) => ({
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
    }),
  );

  const articles: NewsItem[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      console.error(`[feeds] ${FEEDS[index].source} failed:`, result.reason);
    }
  });

  return articles;
}
