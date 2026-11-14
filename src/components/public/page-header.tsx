import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";

/**
 * Header halaman publik baru — mengikuti pola `page-hero` di halaman lama
 * (/menu, /contact), memakai `container-kama` + tipografi Tailwind supaya
 * responsif di 390 / 768 / 1440 tanpa horizontal overflow.
 */
export function PublicPageHeader({
  eyebrow,
  title,
  description,
  imageUrl,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Gambar dari admin; tanpa nilai, header tampil seperti biasa. */
  imageUrl?: string | null;
  children?: React.ReactNode;
}) {
  const text = (
    <div className="flex max-w-[60ch] flex-col gap-4">
      <span className="eyebrow text-cocoa/60">{eyebrow}</span>
      <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
        {title}
      </h1>
      {description ? (
        <RichText value={description} className="text-lead text-cocoa/70" />
      ) : null}
      {children}
    </div>
  );

  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-20 lg:py-24">
        {imageUrl ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            {text}
            <div className="aspect-[16/11] overflow-hidden bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : (
          text
        )}
      </div>
    </Reveal>
  );
}