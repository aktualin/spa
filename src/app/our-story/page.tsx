import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { getOurStory } from "@/lib/content/our-story";
import { getJournalPosts } from "@/lib/content/journal";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { sanitizeHtml } from "@/lib/domain/sanitize";

export async function generateMetadata(): Promise<Metadata> {
  const story = await getOurStory();
  const pageCopy = await getPageCopy();

  return withPageSeo("/our-story", {
    title: story?.seoTitle ?? copy(pageCopy, "our_story.hero.eyebrow") ?? undefined,
    description: story?.seoDescription ?? undefined,
  });
}

export default async function OurStoryPage() {
  const [story, posts, pageCopy] = await Promise.all([
    getOurStory(),
    getJournalPosts(),
    getPageCopy(),
  ]);
  const latest = posts.slice(0, 3);

  if (!story) {
    return (
      <>
        <Navigation />
        <main className="flex-1">
          <PublicPageHeader
            eyebrow={copy(pageCopy, "our_story.hero.eyebrow")}
            title={copy(pageCopy, "our_story.missing_title")}
            description={copy(pageCopy, "our_story.missing_description")}
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "our_story.hero.eyebrow")}
          title={story.heroTitle}
          description={copy(pageCopy, "our_story.hero.description")}
        />

        {story.heroImageUrl ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-10 md:py-12">
              <div className="image-container aspect-[16/9] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.heroImageUrl}
                  alt={story.heroTitle}
                  className="image-cover"
                />
              </div>
            </div>
          </Reveal>
        ) : null}

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow={copy(pageCopy, "our_story.philosophy_eyebrow")}
              title={copy(pageCopy, "our_story.philosophy_title")}
            />
            <div
              className="kama-prose text-rich-text mt-8 max-w-[70ch] text-body text-cocoa/80"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(story.philosophyHtml),
              }}
            />
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow={copy(pageCopy, "our_story.values_eyebrow")}
              title={copy(pageCopy, "our_story.values_title")}
            />
            <div
              className="kama-prose text-rich-text mt-8 max-w-[70ch] text-body text-cocoa/80"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(story.valuesHtml),
              }}
            />
          </div>
        </Reveal>

        {latest.length > 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <PublicSectionHeader
                eyebrow={copy(pageCopy, "our_story.journal_eyebrow")}
                title={copy(pageCopy, "our_story.journal_title")}
                description={copy(pageCopy, "our_story.journal_description")}
                action={{
                  label: copy(pageCopy, "our_story.journal_cta"),
                  href: "/our-story/journal",
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
        ) : null}
      </main>
      <Footer />
    </>
  );
}
