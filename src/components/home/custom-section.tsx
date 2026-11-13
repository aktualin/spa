import Link from "next/link";

import { ArrowRightThin } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import type { HomepageSection } from "@/lib/content/homepage";
import { isSafeCtaHref, isSafeImageUrl } from "@/lib/domain/homepage-banner";

/**
 * Section konten bebas buatan admin (key `custom-…`, lihat
 * `src/app/admin/homepage/homepage-sections.ts`): judul, subjudul, isi
 * berformat HTML, gambar opsional, dan tombol. Dengan gambar, teks dan
 * gambar berdampingan di desktop; tanpa gambar, teks satu kolom.
 */
export function CustomSection({ section }: { section: HomepageSection }) {
  const title = section.title?.trim() || null;
  const subtitle = section.subtitle?.trim() || null;
  const imageUrl = section.imageUrl && isSafeImageUrl(section.imageUrl) ? section.imageUrl : null;
  const ctaLabel = section.ctaLabel?.trim() || null;
  const ctaHref = section.ctaHref && isSafeCtaHref(section.ctaHref) ? section.ctaHref : null;
  const hasBody = Boolean(section.bodyHtml?.trim());

  if (!title && !subtitle && !hasBody && !imageUrl) return null;

  return (
    <Reveal as="section" id={section.key} className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className={imageUrl ? "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16" : "max-w-[70ch]"}>
          <div className="flex min-w-0 flex-col gap-4">
            {title ? (
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">{title}</h2>
            ) : null}
            {subtitle ? <p className="text-lead text-cocoa/70">{subtitle}</p> : null}
            <RichText value={section.bodyHtml} className="max-w-[65ch] text-body text-cocoa/80" />
            {ctaLabel && ctaHref ? (
              <div className="pt-2">
                <Link href={ctaHref} className="btn btn-outline border-cocoa/40">
                  {ctaLabel}
                  <ArrowRightThin className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>

          {imageUrl ? (
            <div className="image-container aspect-[4/3] w-full overflow-hidden">
              {/* URL eksternal dari bucket S3, jadi <img> biasa. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={section.imageAlt ?? ""} loading="lazy" className="image-cover" />
            </div>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
