import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { JournalPost } from "@/lib/content/journal";

/** Artikel lain di bawah isi artikel (maks. 3, tanpa artikel yang dibuka). */
export function JournalPostOthers({
  others,
  pageCopy,
}: {
  others: JournalPost[];
  pageCopy: PageCopy;
}) {
  if (others.length === 0) return null;

  return (
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
  );
}