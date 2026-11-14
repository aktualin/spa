import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { PublicPageHeader } from "@/components/public/page-parts";

/**
 * Bagian bersama halaman detail publik (journal, treatment, package, event,
 * promo) — markup dipertahankan identik dengan halaman asalnya.
 */

/** Fallback Suspense halaman detail: judul saja di atas latar cream-soft. */
export function DetailTitleFallback({ title }: { title: string }) {
  return (
    <main className="flex-1">
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            {title}
          </h1>
        </div>
      </Reveal>
    </main>
  );
}

/** Fallback Suspense berbasis PublicPageHeader (eyebrow + judul). */
export function HeaderFallback({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <main className="flex-1">
      <PublicPageHeader eyebrow={eyebrow} title={title} />
    </main>
  );
}

/** Tautan kembali bergaris bawah dengan panah kiri. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}

/** Gambar sampul detail (event/promo) — rasio 16/9, dimuat eager. */
export function DetailCover({ src, alt }: { src: string; alt: string }) {
  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-10 md:py-14">
        <div className="aspect-[16/9] overflow-hidden bg-cream-card">
          <img
            src={src}
            alt={alt}
            loading="eager"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </Reveal>
  );
}