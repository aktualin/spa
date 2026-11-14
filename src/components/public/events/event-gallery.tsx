import { Reveal } from "@/components/reveal";
import type { PublicEvent } from "@/lib/content/events";
import { copy, getPageCopy } from "@/lib/content/page-copy";

/** Galeri foto event di halaman detail; tanpa foto → tidak dirender. */
export async function EventGallery({ event }: { event: PublicEvent }) {
  if (event.photos.length === 0) return null;
  const pageCopy = await getPageCopy();
  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          {copy(pageCopy, "events.detail.gallery_title")}
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {event.photos.map((photo) => (
            <li
              key={photo.id}
              className="flex flex-col gap-2 bg-cream p-3"
            >
              <div className="aspect-square overflow-hidden bg-cream-card">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption ?? event.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              {photo.caption ? (
                <span className="caption-s text-cocoa/70">{photo.caption}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}