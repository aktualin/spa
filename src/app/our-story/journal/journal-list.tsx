import { Reveal } from "@/components/reveal";
import { PublicEmptyState } from "@/components/public/page-parts";
import {
  getJournalCategories,
  getJournalPosts,
  getJournalTags,
} from "@/lib/content/journal";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { parseJournalFilter } from "@/lib/domain/journal";
import { JournalCard } from "./journal-card";
import { JournalFilters } from "./journal-filters";

type JournalPageProps = {
  searchParams: Promise<{ category?: string | string[]; tag?: string | string[] }>;
};

/** Daftar artikel + filter — query string dibaca di dalam Suspense. */
export async function JournalList({ searchParams }: JournalPageProps) {
  const { category, tag } = parseJournalFilter(await searchParams);
  const [posts, categories, tags, pageCopy] = await Promise.all([
    getJournalPosts({ category, tag }),
    getJournalCategories(),
    getJournalTags(),
    getPageCopy(),
  ]);
  const activeCategory = categories.find(
    (name) => name.toLowerCase() === category?.toLowerCase(),
  );

  return (
    <>
      <JournalFilters
        categories={categories}
        tags={tags}
        category={category}
        tag={tag}
        activeCategory={activeCategory}
        pageCopy={pageCopy}
      />

      <Reveal as="section" className="bg-cream">
        <div className="container-kama py-14 md:py-16 lg:py-20">
          {posts.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <JournalCard key={post.slug} post={post} pageCopy={pageCopy} />
              ))}
            </div>
          ) : (
            <PublicEmptyState
              title={
                category || tag
                  ? copy(pageCopy, "journal.empty_filtered_title")
                  : copy(pageCopy, "journal.empty_title")
              }
              description={copy(pageCopy, "journal.empty_description")}
            />
          )}
        </div>
      </Reveal>
    </>
  );
}