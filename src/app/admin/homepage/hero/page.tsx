import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listHeroSlides } from "../../actions/hero-slides";
import { PageHeader, StatusBanners, primaryLinkClass } from "../../promos/_kit/list-ui";
import { HeroSlideListItem } from "./hero-slides-list";

export const instant = false;

export default async function AdminHeroSlidesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [slides, params] = await Promise.all([
    listHeroSlides(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/homepage" className="text-sm text-neutral-600 hover:underline">
        ← Back to Homepage Sections
      </Link>

      <div className="mt-3">
        <PageHeader
          title="Hero Slides"
          subtitle="Media slider at the very top of the homepage. The hero text, eyebrow, and button are still managed in Homepage Sections."
          action={
            <Link href="/admin/homepage/hero/new" className={primaryLinkClass}>
              Add slide
            </Link>
          }
        />
      </div>

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Slide deleted."
      />

      <p className="mt-4 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
        Published slides appear in order, following this list. While the slide
        table is still empty, the hero uses the fallback image from Homepage Sections.
        Once there are slides, the fallback image is no longer used.
      </p>

      {slides.length === 0 ? (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No slides yet. The hero currently shows the fallback image from
          Homepage Sections. Add at least one slide to enable
          the slider.
        </p>
      ) : null}

      {slides.length > 0 ? (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {slides.map((row, index) => (
            <HeroSlideListItem key={row.id} row={row} index={index} count={slides.length} />
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs text-neutral-500">
        Videos use direct file URLs (.mp4/.webm), not YouTube/Vimeo page
        links. The poster is required so the hero still appears while the video
        has not loaded or autoplay is blocked. Changes appear on the homepage
        within a few minutes.
      </p>
    </div>
  );
}