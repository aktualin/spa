import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRight } from "@/components/icons";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { toPlainText } from "@/lib/domain/rich-text";

/**
 * Kartu detail bersama (event & promo): cover, eyebrow tanggal, judul,
 * deskripsi, dan tautan "lihat detail". `children` mengisi bagian tambahan
 * di antara judul dan deskripsi (mis. lokasi & mitra event).
 */
export async function DetailCard({
  href,
  coverUrl,
  coverAspect,
  eyebrow,
  title,
  description,
  children,
}: {
  href: string;
  coverUrl: string | null;
  /** Kelas rasio cover: "aspect-[16/10]" (event), "aspect-[16/9]" (promo). */
  coverAspect: string;
  eyebrow: string;
  title: string;
  description: string | null;
  children?: ReactNode;
}) {
  const pageCopy = await getPageCopy();
  return (
    <Link href={href} className="group flex h-full flex-col bg-cream">
      {coverUrl ? (
        <div className={`${coverAspect} overflow-hidden bg-cream-card`}>
          <img
            src={coverUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="eyebrow text-cocoa/60">{eyebrow}</span>
        <h3 className="font-display text-title-sm md:text-[1.375rem] md:leading-[1.3]">
          {title}
        </h3>
        {children}
        {description ? (
          <p className="line-clamp-3 text-body text-cocoa/70">{toPlainText(description)}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[0.9375rem] underline underline-offset-4 transition-opacity group-hover:opacity-70">
          {copy(pageCopy, "global.view_detail_label")}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}