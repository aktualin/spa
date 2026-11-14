import Link from "next/link";
import { Check } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { PackageCard } from "@/components/public/package-card";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { CatalogPackage } from "@/lib/content/catalog";

/** Daftar isi paket; item bertautan ke /menu/[slug] bila ada treatment-nya. */
export function PackageIncludes({
  items,
  pageCopy,
}: {
  items: CatalogPackage["items"];
  pageCopy: PageCopy;
}) {
  if (items.length === 0) return null;

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          {copy(pageCopy, "catalog.package.includes_title")}
        </h2>
        <ul className="mt-8 flex max-w-[48rem] flex-col">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-3 border-b border-cocoa/15 py-4"
            >
              <Check className="h-4 w-4 shrink-0" />
              {item.treatmentSlug ? (
                <Link
                  href={`/menu/${item.treatmentSlug}`}
                  className="text-body underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-body">{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/** Paket lain yang tersedia (maks. 3, tanpa paket yang dibuka). */
export function OtherPackages({
  others,
  pageCopy,
}: {
  others: CatalogPackage[];
  pageCopy: PageCopy;
}) {
  if (others.length === 0) return null;

  return (
    <Reveal as="section" className="bg-cream-soft">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
          {copy(pageCopy, "catalog.package.others_title")}
        </h2>
        <div className="w-layout-grid whats-new_list mt-8">
          {others.map((other) => (
            <PackageCard key={other.slug} pkg={other} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}