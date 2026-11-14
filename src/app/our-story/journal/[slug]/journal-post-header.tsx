import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { JournalPost } from "@/lib/content/journal";
import { journalListHref } from "@/lib/domain/journal";
import { BackLink } from "../../../_components/detail-parts";
import { formatPublishedAt } from "../journal.helpers";

/** Kepala artikel: tautan kembali, kategori/tanggal, judul, excerpt, sampul. */
export function JournalPostHeader({
  post,
  pageCopy,
}: {
  post: JournalPost;
  pageCopy: PageCopy;
}) {
  const published = formatPublishedAt(post.publishedAt);

  return (
    <>
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <div className="flex max-w-[60ch] flex-col gap-4">
            <BackLink href="/our-story/journal">
              {copy(pageCopy, "journal.detail.back_label")}
            </BackLink>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {post.category ? (
                <Link
                  href={journalListHref({ category: post.category })}
                  className="eyebrow text-cocoa/60 transition-opacity hover:opacity-70"
                >
                  {post.category}
                </Link>
              ) : null}
              {published ? (
                <span className="text-caption text-cocoa/50">{published}</span>
              ) : null}
            </div>
            <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="text-lead text-cocoa/70">{post.excerpt}</p>
            ) : null}
          </div>
        </div>
      </Reveal>

      {post.coverUrl ? (
        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-10 md:py-12">
            <div className="image-container aspect-[16/9] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverUrl}
                alt={post.title}
                className="image-cover"
              />
            </div>
          </div>
        </Reveal>
      ) : null}
    </>
  );
}