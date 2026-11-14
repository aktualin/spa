import type { Metadata } from "next";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { getCatalogSlugs, getMenuEntry } from "@/lib/content/catalog";
import { packages as staticPackages, treatments as staticTreatments } from "@/data/content";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { toPlainText } from "@/lib/domain/rich-text";
import { MenuDetailContent } from "./menu-detail-content";

// Slug untuk prerender saat build diambil dari database. Bila DB tidak
// terjangkau saat build (fallback kosong), pakai slug statis — Cache
// Components menolak generateStaticParams yang mengembalikan nol hasil.
export async function generateStaticParams() {
  const { treatments, packages } = await getCatalogSlugs();
  const slugs = [...treatments.map((t) => t.treatmentSlug), ...packages];
  const source =
    slugs.length > 0
      ? slugs
      : [...staticTreatments.map((t) => t.slug), ...staticPackages.map((p) => p.slug)];
  return source.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getMenuEntry(slug);

  if (!entry) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "menu.detail.not_found_title") || undefined };
  }

  return withPageSeo(`/menu/${slug}`, {
    title: entry.name,
    description:
      entry.kind === "package"
        ? toPlainText(`${entry.subtitle}. ${toPlainText(entry.description)}`, 160)
        : toPlainText([entry.tagline, toPlainText(entry.description)].filter(Boolean).join(". "), 160),
  });
}

export default async function TreatmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* The params are runtime data: reading them must happen inside a
     Suspense boundary, otherwise Next.js complains about "URL data during
     prerendering". Every slug of `generateStaticParams` is prerendered, so
     the fallback is only a safety net. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <TreatmentFallback
            eyebrow={copy(pageCopy, "menu.detail.eyebrow")}
            title={copy(pageCopy, "menu.detail.loading_title")}
          />
        }
      >
        <MenuDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function TreatmentFallback({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <main className="main-wrapper">
      <section className="page-hero">
        <div className="padding-global">
          <div className="container-large">
            <div className="eyebrow-s text-style-allcaps">{eyebrow}</div>
            <h1 className="header-xxl">{title}</h1>
          </div>
        </div>
      </section>
    </main>
  );
}