import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listHomepageSections } from "../actions/homepage";
import { StatusBanner } from "../settings/_components/form-ui";
import { BANNER_DEFAULTS } from "./homepage-banner-defaults";
import { HomepageQuickLinks } from "./homepage-quick-links";
import { HomepageSectionList } from "./homepage-section-list";

export const instant = false;

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
      <HomepageQuickLinks />

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
