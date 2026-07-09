import NewsFeed from "@/components/NewsFeed";
import { fetchNews } from "@/lib/news";

// Re-fetch the feed at most once an hour.
export const revalidate = 3600;

export default async function Home() {
  const items = await fetchNews();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <NewsFeed items={items} />
    </div>
  );
}
