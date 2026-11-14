import Link from "next/link";

import { formatIdr } from "@/lib/format";

import type { listPackages } from "../../actions/packages";

type Package = Awaited<ReturnType<typeof listPackages>>[number];

/** Satu baris package: nama, isi, durasi, dan harga. */
export function PackageRow({ pkg }: { pkg: Package }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/treatments/packages/${pkg.id}`}
            className="font-medium text-neutral-900 hover:underline"
          >
            {pkg.name}
          </Link>
          {!pkg.isPublished ? (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600">
              Draf
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          /{pkg.slug} ·{" "}
          {pkg.items.length > 0
            ? pkg.items
                .map(
                  (item) =>
                    item.treatment?.name ?? item.label ?? "—",
                )
                .join(", ")
            : "belum ada isi"}
        </p>
      </div>

      <p className="text-sm text-neutral-600">
        {pkg.durationMin ? `${pkg.durationMin} m · ` : ""}
        {formatIdr(pkg.priceIdr)}
      </p>
    </li>
  );
}