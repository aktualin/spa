import { Instagram } from "@/components/icons";

export type InstagramGridItem = {
  key: string;
  src: string;
  alt: string;
  href: string | null;
  /** Aria tautan foto; placeholder {n} sudah diisi pemanggil. */
  label: string;
};

/**
 * Grid foto Instagram (feed live maupun postingan admin): kotak persegi
 * dengan overlay ikon saat hover. Dipakai SocialsSection & GalleryTeaser;
 * `rel` tautan mengikuti konteks masing-masing pemanggil.
 */
export function InstagramGrid({
  items,
  rel = "noopener noreferrer",
}: {
  items: InstagramGridItem[];
  rel?: string;
}) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
      {items.map((item) => (
        <li key={item.key} className="group relative aspect-square overflow-hidden bg-cream">
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel={rel}
              aria-label={item.label}
              className="absolute inset-0 z-10"
            />
          ) : null}
          <img
            src={item.src}
            alt={item.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cocoa/0 opacity-0 transition-opacity duration-300 group-hover:bg-cocoa/40 group-hover:opacity-100">
            <Instagram className="h-6 w-6 text-white" />
          </span>
        </li>
      ))}
    </ul>
  );
}