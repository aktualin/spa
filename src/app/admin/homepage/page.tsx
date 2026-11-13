import Link from "next/link";

import { requireRole } from "@/lib/auth";
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
  "membership-banner": {
    title: "KAMA Membership.",
    subtitle: "",
    imageUrl: "",
    imageAlt: "",
    ctaLabel: "Join KAMA Now",
    ctaHref: "/membership",
  },
  "booking-banner": BOOKING_BANNER_DEFAULTS,
};

export default async function AdminHomepagePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
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
          href="/admin/homepage/hero"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Kelola slide Hero →
        </Link>
        <Link
          href="/admin/homepage/highlights"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Kelola highlight “What’s New” →
        </Link>
        <Link
          href="/admin/homepage/stats"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Statistik Brand Intro →
        </Link>
        <Link
          href="/admin/homepage/reviews"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Ulasan →
        </Link>
        <Link
          href="/admin/homepage/instagram"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Feed Instagram →
        </Link>
        <Link
          href="/admin/our-story"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Edit Our Story →
        </Link>
      </p>

      <StatusBanner saved={params.saved} deleted={params.deleted} deletedText="Section konten dihapus." />
      {params.error === "custom-name" ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Nama section konten wajib berisi huruf atau angka.
        </p>
      ) : null}

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
