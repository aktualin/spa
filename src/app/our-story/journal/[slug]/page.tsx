import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getJournalPost, getJournalPosts } from "@/lib/content/journal";
import { withPageSeo } from "@/lib/content/seo";
import { sanitizeHtml } from "@/lib/domain/sanitize";

type JournalPostPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Slug yang di-prerender. Tanpa ini Next 16 hanya menyiapkan shell rute, dan
 * `usePathname()` di `Navigation` memblokir prerender (`CLIENT_HOOK_DYNAMIC`).
 */
export async function generateStaticParams() {
  const posts = await getJournalPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: JournalPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);

  if (!post) {
    return { title: "Tulisan tidak ditemukan" };
  }

  return withPageSeo(`/our-story/journal/${slug}`, {
    title: post.seoTitle ?? post.title,
    description:
      post.seoDescription ??
      post.excerpt ??
      `${post.title} — Journal KAMA Spa.`,
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

export default function JournalPostPage({ params }: JournalPostPageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  return (
    <>
      <Navigation />
      <Suspense fallback={<JournalPostFallback />}>
        <JournalPostContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function JournalPostFallback() {
  return (
    <main className="flex-1">
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            Memuat tulisan…
          </h1>
        </div>
      </Reveal>
    </main>
  );
}

async function JournalPostContent({ params }: JournalPostPageProps) {
  const { slug } = await params;
  const post = await getJournalPost(slug);

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
                Journal
              </Link>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {post.category ? (
                  <span className="eyebrow text-cocoa/60">{post.category}</span>
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
                className="text-rich-text max-w-[70ch] text-body text-cocoa/80"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.bodyHtml) }}
              />
            ) : (
              <p className="max-w-[70ch] text-body text-cocoa/70">
                Isi tulisan ini belum tersedia.
              </p>
            )}

            {post.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-cocoa/20 px-3 py-1 text-caption text-cocoa/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Reveal>

        {others.length > 0 ? (
          <Reveal as="section" className="bg-cream-soft">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                Tulisan lainnya
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
