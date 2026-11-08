import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { MEMBERSHIP_BANNER_DEFAULTS } from "@/components/home/hero";
import {
  BOOKING_BANNER_DEFAULTS,
  HERO_DEFAULTS,
  type BannerDefaults,
  type BannerKey,
} from "@/lib/domain/homepage-banner";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listHomepageSections } from "../actions/homepage";
import { StatusBanner } from "../settings/_components/form-ui";
import { HomepageSectionList } from "./homepage-section-list";

export const instant = false;

/** Teks/gambar bawaan banner — ditampilkan sebagai placeholder di form. */
const BANNER_DEFAULTS: Record<BannerKey, BannerDefaults> = {
  hero: HERO_DEFAULTS,
  "membership-banner": MEMBERSHIP_BANNER_DEFAULTS,
  "booking-banner": BOOKING_BANNER_DEFAULTS,
};

export default async function AdminHomepagePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ sections, missing }, params] = await Promise.all([
    listHomepageSections(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-900">
        Section Homepage
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Nyalakan/matikan tiap section, atur urutannya, dan edit teksnya. Urutan
        di sini sama dengan urutan render di homepage.
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link
          href="/admin/homepage/highlights"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Kelola highlight “What’s New” →
        </Link>
        <Link
          href="/admin/our-story"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Edit Our Story →
        </Link>
      </p>

      <StatusBanner saved={params.saved} />

      {sections.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Belum ada section homepage. Tambahkan section yang dibutuhkan di
          bawah.
        </p>
      ) : null}

      <div className="mt-6">
          <HomepageSectionList
            sections={sections.map((section) => ({
              id: section.id,
              key: section.key,
              title: section.title,
              subtitle: section.subtitle ?? "",
              bodyHtml: section.bodyHtml ?? "",
              imageUrl: section.imageUrl ?? "",
              mobileImageUrl: section.mobileImageUrl ?? "",
              imageAlt: section.imageAlt ?? "",
              ctaLabel: section.ctaLabel ?? "",
              ctaHref: section.ctaHref ?? "",
              isEnabled: section.isEnabled,
              sortOrder: section.sortOrder,
            }))}
            missing={missing}
            bannerDefaults={BANNER_DEFAULTS}
          />
      </div>
    </div>
  );
}
