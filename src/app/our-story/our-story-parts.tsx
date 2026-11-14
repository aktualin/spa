import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { PublicSectionHeader } from "@/components/public/page-parts";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { JournalPost } from "@/lib/content/journal";
import { sanitizeHtml } from "@/lib/domain/sanitize";

/** Section prosa (philosophy/values): judul + HTML tersanitasi. */
export function StoryProseSection({
  eyebrow,
  title,
  html,
  sectionClassName,
}: {
  eyebrow: string;
  title: string;
  html: string;
  sectionClassName: string;
}) {
  return (
    <Reveal as="section" className={sectionClassName}>
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <PublicSectionHeader eyebrow={eyebrow} title={title} />
        <div
          className="kama-prose text-rich-text mt-8 max-w-[70ch] text-body text-cocoa/80"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      </div>
    </Reveal>
  );
}

/** Teaser tiga artikel journal terbaru di halaman Our Story. */
export function OurStoryJournal({
  latest,
  pageCopy,
}: {
  latest: JournalPost[];
  pageCopy: PageCopy;
}) {
  if (latest.length === 0) return null;

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <PublicSectionHeader
          eyebrow={copy(pageCopy, "our_story.journal_eyebrow")}
          title={copy(pageCopy, "our_story.journal_title")}
          description={copy(pageCopy, "our_story.journal_description")}
          action={{
            label: copy(pageCopy, "our_story.journal_cta"),
            href: copy(pageCopy, "our_story.journal_href") || "/our-story/journal",
          }}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((post) => (
            <Link
              key={post.slug}
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
              {post.category ? (
                <span className="eyebrow text-cocoa/60">
                  {post.category}
                </span>
              ) : null}
              <h3 className="font-display text-title-sm transition-opacity group-hover:opacity-70">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="text-body text-cocoa/70">{post.excerpt}</p>
              ) : null}
              <span className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4">
                {copy(pageCopy, "global.read_label")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Reveal>
  );
}