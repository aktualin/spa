import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listHomepageSections } from "../actions/homepage";
import { StatusBanner } from "../settings/_components/form-ui";
import { HomepageSectionList } from "./homepage-section-list";

export const instant = false;

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
              isEnabled: section.isEnabled,
              sortOrder: section.sortOrder,
            }))}
            missing={missing}
          />
      </div>
    </div>
  );
}
