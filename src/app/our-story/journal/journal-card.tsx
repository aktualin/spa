import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { JournalPost } from "@/lib/content/journal";
import { formatPublishedAt } from "./journal.helpers";

/** Kartu artikel di daftar journal: sampul, kategori/tanggal, judul, excerpt. */
export function JournalCard({
  post,
  pageCopy,
}: {
  post: JournalPost;
  pageCopy: PageCopy;
}) {
  const published = formatPublishedAt(post.publishedAt);

  return (
    <Link
      href={`/our-story/journal/${post.slug}`}
      className="group flex flex-col gap-3"
    >
      {post.coverUrl ? (
        <div className="image-container aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl}
            alt={post.title}
            loading="lazy"
            className="image-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {post.category ? (
          <span className="eyebrow text-cocoa/60">
            {post.category}
          </span>
        ) : null}
        {published ? (
          <span className="text-caption text-cocoa/50">
            {published}
          </span>
        ) : null}
      </div>
      <h2 className="font-display text-title-sm transition-opacity group-hover:opacity-70">
        {post.title}
      </h2>
      {post.excerpt ? (
        <p className="text-body text-cocoa/70">{post.excerpt}</p>
      ) : null}
      <span className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4">
        {copy(pageCopy, "global.read_label")}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}