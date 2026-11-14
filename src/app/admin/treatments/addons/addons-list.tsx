import Link from "next/link";

import { ADDON_SECTION_LABEL } from "@/lib/domain/menu-catalog";
import { formatIdr } from "@/lib/format";

import type { listTreatmentsByCategory } from "../../actions/treatments";
import { Badge } from "../../settings/_components/form-ui";

type Category = Awaited<ReturnType<typeof listTreatmentsByCategory>>[number];

/** Satu kategori add-on beserta daftar add-on dan letaknya di Menu. */
export function AddonCategorySection({ category }: { category: Category }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {category.name}
        {!category.isPublished ? <Badge tone="muted">Kategori disembunyikan</Badge> : null}
      </h2>
      {category.treatments.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">Belum ada add-on di kategori ini.</p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {category.treatments.map((addon) => (
            <li
              key={addon.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/treatments/${addon.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {addon.name}
                  </Link>
                  {addon.addonSection ? (
                    <Badge tone="muted">{ADDON_SECTION_LABEL[addon.addonSection]}</Badge>
                  ) : (
                    <Badge tone="warn">Belum ada letak — tidak tampil di Menu</Badge>
                  )}
                  {addon.isNew ? <Badge>New</Badge> : null}
                  {addon.isBestSeller ? <Badge>Best Seller</Badge> : null}
                  {!addon.isPublished ? <Badge tone="muted">Disembunyikan</Badge> : null}
                </div>
              </div>
              <p className="text-sm text-neutral-600">
                {addon.options
                  .map((o) => `${o.durationMin}m · ${formatIdr(o.priceIdr)}`)
                  .join("  |  ") || "belum ada harga"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}