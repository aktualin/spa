import type { Metadata } from "next";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { getEvent } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { toPlainText } from "@/lib/domain/rich-text";
import { HeaderFallback } from "../../_components/detail-parts";
import { EventDetailContent } from "./event-detail-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "events.detail.not_found_title") || undefined };
  }
  return withPageSeo(`/events/${event.slug}`, {
    title: event.seoTitle ?? event.title,
    description: event.seoDescription ?? (toPlainText(event.description, 160) || undefined),
    openGraph: event.coverUrl
      ? { images: [{ url: event.coverUrl, alt: event.title }] }
      : undefined,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /* Slug adalah runtime data — harus dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <HeaderFallback
            eyebrow={copy(pageCopy, "events.hero.eyebrow")}
            title={copy(pageCopy, "events.detail.loading_title")}
          />
        }
      >
        <EventDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}