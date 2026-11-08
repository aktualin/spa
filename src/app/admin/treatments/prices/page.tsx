import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { OptionPriceRow, PackagePriceRow } from "./price-forms";

export const instant = false;

export default async function AdminPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(["ADMIN", "EDITOR"]);
  const params = await searchParams;

  const [categories, packages] = await Promise.all([
    prisma.treatmentCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        treatments: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            options: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                label: true,
                durationMin: true,
                priceIdr: true,
              },
            },
          },
        },
      },
    }),
    prisma.package.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, durationMin: true, priceIdr: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Harga</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Ubah harga &amp; durasi setiap pilihan durasi treatment, serta harga
            package. Harga dalam rupiah penuh tanpa titik, contoh: 145000.
          </p>
        </div>
        <Link
          href="/admin/treatments"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          Kembali ke treatments
        </Link>
      </div>

      {params.saved ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Harga tersimpan.
        </p>
      ) : null}

      <div className="mt-6 space-y-8">
        {categories.map((category) => (
          <section key={category.id}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {category.name}
            </h2>

            {category.treatments.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">
                Belum ada treatment di kategori ini.
              </p>
            ) : (
              <div className="mt-2 space-y-4">
                {category.treatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="rounded-lg border border-neutral-200 bg-white p-4"
                  >
                    <Link
                      href={`/admin/treatments/${treatment.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {treatment.name}
                    </Link>

                    {treatment.options.length === 0 ? (
                      <p className="mt-2 text-sm text-neutral-500">
                        Belum ada opsi durasi/harga.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {treatment.options.map((option) => (
                          <OptionPriceRow
                            key={option.id}
                            optionId={option.id}
                            label={option.label}
                            durationMin={String(option.durationMin)}
                            priceIdr={String(option.priceIdr)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Package
          </h2>

          {packages.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">Belum ada package.</p>
          ) : (
            <div className="mt-2 space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-lg border border-neutral-200 bg-white p-3"
                >
                  <PackagePriceRow
                    packageId={pkg.id}
                    name={pkg.name}
                    durationMin={pkg.durationMin ? String(pkg.durationMin) : ""}
                    priceIdr={String(pkg.priceIdr)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
