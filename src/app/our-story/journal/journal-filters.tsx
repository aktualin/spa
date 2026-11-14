import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { journalListHref } from "@/lib/domain/journal";

/** Filter kategori (tombol) dan tag (chip) daftar journal. */
export function JournalFilters({
  categories,
  tags,
  category,
  tag,
  activeCategory,
  pageCopy,
}: {
  categories: string[];
  tags: string[];
  category?: string;
  tag?: string;
  activeCategory?: string;
  pageCopy: PageCopy;
}) {
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
                {copy(pageCopy, "journal.all_label")}
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
              <span className="text-caption text-cocoa/50">{copy(pageCopy, "journal.tag_label")}</span>
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
    </>
  );
}