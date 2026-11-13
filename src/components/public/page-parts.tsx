import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "@/components/icons";
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

/** Judul section dengan subjudul opsional. */
export function PublicSectionHeader({
  eyebrow,
  title,
  description,
  imageUrl,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Gambar dari admin; tanpa nilai, judul tampil seperti biasa. */
  imageUrl?: string | null;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="flex max-w-[56ch] flex-col gap-3">
        {imageUrl ? (
          <div className="aspect-[16/9] w-full max-w-[18rem] overflow-hidden bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        {eyebrow ? <span className="eyebrow text-cocoa/60">{eyebrow}</span> : null}
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          {title}
        </h2>
        {description ? (
          <RichText value={description} className="text-body text-cocoa/70" />
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

/** Keadaan kosong — daftar yang belum ada isinya. */
export function PublicEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2 border border-cocoa/15 bg-cream px-6 py-10">
      <h3 className="font-display text-title-sm">{title}</h3>
      {description ? (
        <RichText value={description} className="text-body text-cocoa/70" />
      ) : null}
    </div>
  );
}

/** Tombol WhatsApp — link dibangun dari `wa.me`. */
export function WhatsAppLink({
  href,
  label,
  className = "btn btn-primary",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
