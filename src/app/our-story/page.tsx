import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { PublicPageHeader } from "@/components/public/page-parts";
import { getOurStory } from "@/lib/content/our-story";
import { getJournalPosts } from "@/lib/content/journal";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { OurStoryJournal, StoryProseSection } from "./our-story-parts";

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

        <StoryProseSection
          eyebrow={copy(pageCopy, "our_story.philosophy_eyebrow")}
          title={copy(pageCopy, "our_story.philosophy_title")}
          html={story.philosophyHtml}
          sectionClassName="bg-cream"
        />
        <StoryProseSection
          eyebrow={copy(pageCopy, "our_story.values_eyebrow")}
          title={copy(pageCopy, "our_story.values_title")}
          html={story.valuesHtml}
          sectionClassName="bg-cream-soft"
        />

        <OurStoryJournal latest={latest} pageCopy={pageCopy} />
      </main>
      <Footer />
    </>
  );
}