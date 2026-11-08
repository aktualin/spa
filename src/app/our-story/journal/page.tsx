import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
} from "@/components/public/page-parts";
import {
  getJournalCategories,
  getJournalPosts,
  getJournalTags,
} from "@/lib/content/journal";
import { withPageSeo } from "@/lib/content/seo";
import {
  JOURNAL_BASE_PATH,
  journalListHref,
  parseJournalFilter,
} from "@/lib/domain/journal";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo(JOURNAL_BASE_PATH, {
    title: "Journal",
    // Versi tersaring (?category=, ?tag=) menunjuk ke daftar utama.
    alternates: { canonical: JOURNAL_BASE_PATH },
    description:
      "Tulisan KAMA Spa tentang perawatan tubuh, ritual, dan kebiasaan istirahat yang baik.",
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

type JournalPageProps = {
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[] }>;
};

export default function JournalPage({ searchParams }: JournalPageProps) {
  /* Filter kategori/tag datang dari query string — runtime data, jadi daftar
     artikelnya dibaca di dalam Suspense boundary. Header halaman tetap
     ter-prerender. */
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Journal"
          title="Catatan dari ruang rawat."
          description="Tulisan singkat tentang treatment, bahan yang kami pakai, dan cara merawat diri di antara kunjungan."
        />
        <Suspense fallback={<JournalListFallback />}>
          <JournalList searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function JournalListFallback() {
  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <p className="text-body text-cocoa/60">Memuat tulisan…</p>
      </div>
    </Reveal>
  );
}

async function JournalList({ searchParams }: JournalPageProps) {
  const { category, tag } = parseJournalFilter(await searchParams);
  const [posts, categories, tags] = await Promise.all([
    getJournalPosts({ category, tag }),
    getJournalCategories(),
    getJournalTags(),
  ]);
  const activeCategory = categories.find(
    (name) => name.toLowerCase() === category?.toLowerCase(),
  );

  return (
    <>
        {categories.length > 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama pt-10 md:pt-12">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={journalListHref({ tag })}
                  aria-current={category ? undefined : "page"}
                  className={`btn btn-outline border-cocoa/40 ${
                    category ? "" : "bg-cocoa/10"
                  }`}
                >
                  Semua
                </Link>
                {categories.map((name) => (
                  <Link
                    key={name}
                    href={journalListHref({ category: name, tag })}
                    aria-current={activeCategory === name ? "page" : undefined}
                    className={`btn btn-outline border-cocoa/40 ${
                      activeCategory === name ? "bg-cocoa/10" : ""
                    }`}
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        ) : null}

        {tags.length > 0 ? (
          <Reveal as="section" className="bg-cream">
            <div
              className={`container-kama ${categories.length > 0 ? "pt-4" : "pt-10 md:pt-12"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption text-cocoa/50">Tag:</span>
                {tags.map((name) => {
                  const current = tag === name;
                  return (
                    <Link
                      key={name}
                      href={journalListHref({
                        category: activeCategory ?? category,
                        tag: current ? undefined : name,
                      })}
                      aria-current={current ? "page" : undefined}
                      className={`border px-3 py-1 text-caption transition-colors ${
                        current
                          ? "border-cocoa/60 bg-cocoa/10 text-cocoa"
                          : "border-cocoa/20 text-cocoa/60 hover:border-cocoa/50"
                      }`}
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ) : null}

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            {posts.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => {
                  const published = formatPublishedAt(post.publishedAt);

                  return (
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
                        Baca
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <PublicEmptyState
                title={
                  category || tag
                    ? `Belum ada tulisan ${[
                        category ? `di kategori "${activeCategory ?? category}"` : "",
                        tag ? `dengan tag "${tag}"` : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}`
                    : "Belum ada tulisan"
                }
                description="Daftar ini terisi otomatis begitu artikel dipublikasikan dari dashboard admin."
              />
            )}
          </div>
        </Reveal>
    </>
  );
}
