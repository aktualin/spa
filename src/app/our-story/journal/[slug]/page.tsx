import type { Metadata } from "next";
import { Suspense } from "react";
import { DeferredNavigation } from "@/components/public/deferred-navigation";
import { Footer } from "@/components/footer";
import { fillCopy } from "@/components/copy-text";
import { getJournalPost } from "@/lib/content/journal";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { journalPath } from "@/lib/domain/journal";
import { DetailTitleFallback } from "../../../_components/detail-parts";
import { JournalPostContent } from "./journal-post-content";

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
  const [post, pageCopy] = await Promise.all([getJournalPost(slug), getPageCopy()]);

  if (!post) {
    return { title: copy(pageCopy, "journal.detail.not_found_title") || undefined };
  }

  const path = journalPath(post.slug);
  const title = post.seoTitle ?? post.title;
  const description =
    post.seoDescription ??
    post.excerpt ??
    fillCopy(
      copy(pageCopy, "journal.seo_description") || "{title} — Journal KAMA Spa.",
      { title: post.title },
    );
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

export default async function JournalPostPage({ params }: JournalPostPageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <DeferredNavigation />
      <Suspense
        fallback={
          <DetailTitleFallback title={copy(pageCopy, "journal.detail.loading_title")} />
        }
      >
        <JournalPostContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}