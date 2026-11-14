import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { getJournalPost, getJournalPosts } from "@/lib/content/journal";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { journalListHref } from "@/lib/domain/journal";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { JournalPostHeader } from "./journal-post-header";
import { JournalPostOthers } from "./journal-post-others";

type JournalPostPageProps = {
  params: Promise<{ slug: string }>;
};

/** Isi artikel — dibaca di dalam Suspense karena slug adalah runtime data. */
export async function JournalPostContent({ params }: JournalPostPageProps) {
  const { slug } = await params;
  const [post, pageCopy] = await Promise.all([
    getJournalPost(slug),
    getPageCopy(),
  ]);

  if (!post) notFound();

  const others = (await getJournalPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <main className="flex-1">
      <JournalPostHeader post={post} pageCopy={pageCopy} />

      <Reveal as="section" className="bg-cream">
        <div className="container-kama pb-14 md:pb-16 lg:pb-20">
          {post.bodyHtml ? (
            <div
              className="kama-prose text-rich-text max-w-[70ch] text-body text-cocoa/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.bodyHtml) }}
            />
          ) : (
            <p className="max-w-[70ch] text-body text-cocoa/70">
              {copy(pageCopy, "journal.detail.empty_body")}
            </p>
          )}

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={journalListHref({ tag })}
                  className="border border-cocoa/20 px-3 py-1 text-caption text-cocoa/60 transition-colors hover:border-cocoa/50"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </Reveal>

      <JournalPostOthers others={others} pageCopy={pageCopy} />
    </main>
  );
}