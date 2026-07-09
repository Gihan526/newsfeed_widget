// Server-side data fetching: read the RSS feed(s) and turn each entry
// into a clean NewsItem the UI can render. This runs on the server.

import Parser from "rss-parser";
import type { NewsItem, Tag } from "@/lib/types";

// rss-parser doesn't know about these extra fields, so we describe them here.
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

// Pull the first <img> src out of an HTML string, if there is one.
function extractImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1];
}

// Guess a tag from the article text using some simple keyword matching.
function inferTag(text: string): Tag {
  const lower = text.toLowerCase();
  if (
    /(rais|funding|series [a-z]|seed|invest|fund|ipo|debt|valuation|round|corpus|cheque|lead round)/.test(
      lower
    )
  ) {
    return "funding";
  }
  if (/(launch|unveil|debut|introduc|rolls? out|rollout|rolls out)/.test(lower)) {
    return "launch";
  }
  if (/(acquire|acquisition|buyout|merger|takes over|buys )/.test(lower)) {
    return "acquisition";
  }
  return "news";
}

// Fetch every feed at once. If one feed fails we log it and keep the rest,
// so a single broken source doesn't take down the whole page.
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
    })
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
