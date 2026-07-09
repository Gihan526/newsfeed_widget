// A single article shown as a card in the grid.

import Image from "next/image";
import { formatDate } from "@/lib/date";
import { TAG_STYLES, type NewsItem } from "@/lib/types";

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Some feed items don't have an image, so only show it when we have one. */}
      {item.image && (
        <div className="relative w-full h-40 bg-zinc-100">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-500">
            {item.source} · {formatDate(item.date)}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TAG_STYLES[item.tag]}`}
          >
            {item.tag}
          </span>
        </div>

        <h2 className="text-base font-semibold text-zinc-900 leading-snug mb-2">
          {item.title}
        </h2>

        <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
          {item.excerpt}
        </p>

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm font-medium text-zinc-900 hover:underline"
        >
          Read more
        </a>
      </div>
    </article>
  );
}
