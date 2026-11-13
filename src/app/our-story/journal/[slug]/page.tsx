import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getJournalPost, getJournalPosts } from "@/lib/content/journal";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { journalListHref, journalPath } from "@/lib/domain/journal";
import { sanitizeHtml } from "@/lib/domain/sanitize";

type JournalPostPageProps = {
  params: Promise<{ slug: string }>;
};

/*
 * Tanpa `generateStaticParams`: daftar artikel terbit bisa kosong dan daftar
 * kosong menggagalkan build. Slug dibaca di dalam Suspense (seperti
 * /promos/[slug]) dan navigasi memakai `DeferredNavigation`. Artikel yang
 * tidak terlihat publik dijawab 404 sungguhan oleh `src/proxy.ts`.
 */

export async function generateMetadata({
  params,
}: JournalPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);

  if (!post) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "journal.detail.not_found_title") || undefined };
  }

  const path = journalPath(post.slug);
  const title = post.seoTitle ?? post.title;
  const description =
    post.seoDescription ?? post.excerpt ?? `${post.title} — Journal KAMA Spa.`;
  const images = post.coverUrl ? [{ url: post.coverUrl, alt: post.title }] : undefined;

  return withPageSeo(path, {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      images,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      section: post.category ?? undefined,
      tags: post.tags.length > 0 ? post.tags : undefined,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  });
}

/** Tanggal publikasi dalam format Indonesia; `null` kalau belum dijadwalkan. */
function formatPublishedAt(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function JournalPostPage({ params }: JournalPostPageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <JournalPostFallback
            title={copy(pageCopy, "journal.detail.loading_title")}
          />
        }
      >
        <JournalPostContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function JournalPostFallback({ title }: { title: string }) {
  return (
    <main className="flex-1">
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            {title}
          </h1>
        </div>
      </Reveal>
    </main>
  );
}

async function JournalPostContent({ params }: JournalPostPageProps) {
  const { slug } = await params;
  const [post, pageCopy] = await Promise.all([
    getJournalPost(slug),
    getPageCopy(),
  ]);

  if (!post) notFound();

  const published = formatPublishedAt(post.publishedAt);
  const others = (await getJournalPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <main className="flex-1">
        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-20 lg:py-24">
            <div className="flex max-w-[60ch] flex-col gap-4">
              <Link
                href="/our-story/journal"
                className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                <ArrowLeft className="h-4 w-4" />
                {copy(pageCopy, "journal.detail.back_label")}
              </Link>
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

        {others.length > 0 ? (
          <Reveal as="section" className="bg-cream-soft">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {copy(pageCopy, "journal.detail.others_title")}
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/our-story/journal/${other.slug}`}
                    className="group flex flex-col gap-2"
                  >
                    <h3 className="font-display text-title-sm transition-opacity group-hover:opacity-70">
                      {other.title}
                    </h3>
                    {other.excerpt ? (
                      <p className="text-body text-cocoa/70">{other.excerpt}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        ) : null}
    </main>
  );
}
