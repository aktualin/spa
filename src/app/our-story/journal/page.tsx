import type { Metadata } from "next";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { PublicPageHeader } from "@/components/public/page-parts";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { JOURNAL_BASE_PATH } from "@/lib/domain/journal";
import { JournalList } from "./journal-list";

export async function generateMetadata(): Promise<Metadata> {
  // Versi tersaring (?category=, ?tag=) menunjuk ke daftar utama.
  return withPageSeo(JOURNAL_BASE_PATH, {
    alternates: { canonical: JOURNAL_BASE_PATH },
  });
}

type JournalPageProps = {
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[] }>;
};

export default async function JournalPage({ searchParams }: JournalPageProps) {
  /* Filter kategori/tag datang dari query string — runtime data, jadi daftar
     artikelnya dibaca di dalam Suspense boundary. Header halaman tetap
     ter-prerender. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "journal.hero.eyebrow")}
          title={copy(pageCopy, "journal.hero.title")}
          description={copy(pageCopy, "journal.hero.description")}
        />
        <Suspense
          fallback={
            <JournalListFallback text={copy(pageCopy, "journal.loading")} />
          }
        >
          <JournalList searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function JournalListFallback({ text }: { text: string }) {
  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <p className="text-body text-cocoa/60">{text}</p>
      </div>
    </Reveal>
  );
}