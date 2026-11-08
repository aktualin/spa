import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { parsePriceLabel } from "@/lib/domain/pricing";
import { prisma } from "@/lib/prisma";

import { CatalogTabs } from "../catalog-tabs";
import { OptionPriceRow, PackagePriceRow, SinglePriceRow } from "./price-forms";

export const instant = false;

export default async function AdminPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(["ADMIN", "EDITOR"]);
  const params = await searchParams;

  const [categories, packages, tiers, products] = await Promise.all([
    prisma.treatmentCategory.findMany({
      // Urutan enum CategoryKind: TREATMENT lalu ADDON.
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        kind: true,
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
    prisma.membershipTier.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, priceIdr: true, priceLabel: true },
    }),
    prisma.retailProduct.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, priceIdr: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <CatalogTabs active="prices" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Harga</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Ubah harga treatment, add-on, package, membership, dan produk
            retail. Harga dalam rupiah penuh tanpa titik, contoh: 145000.
            Perubahan langsung tampil di situs setelah disimpan.
          </p>
        </div>
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
              {category.kind === "ADDON" ? " (add-on)" : ""}
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

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Membership
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Harga di kartu membership mengikuti angka di bawah ini. Namun
            kalimat harga di banner membership homepage (contoh &ldquo;Just Rp
            1.5jt a month.&rdquo;) adalah teks terpisah — ubah juga di{" "}
            <Link href="/admin/membership/program" className="underline">
              Program membership
            </Link>{" "}
            bila harga berubah.
          </p>

          {tiers.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">Belum ada tier membership.</p>
          ) : (
            <div className="mt-2 space-y-3">
              {tiers.map((tier) => {
                // Tier lama belum punya angka: isi awal dibaca dari labelnya.
                const price = tier.priceIdr ?? (parsePriceLabel(tier.priceLabel) || null);
                return (
                  <div
                    key={tier.id}
                    className="rounded-lg border border-neutral-200 bg-white p-3"
                  >
                    <SinglePriceRow
                      kind="membership"
                      id={tier.id}
                      name={tier.name}
                      priceIdr={price === null ? "" : String(price)}
                      emptyHint={`Tampil di situs: "${tier.priceLabel}". Kosongkan untuk harga non-angka (ubah teksnya di modul Membership).`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Produk retail
          </h2>

          {products.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">
              Belum ada produk retail.{" "}
              <Link href="/admin/retail" className="underline">
                Tambah produk
              </Link>
            </p>
          ) : (
            <div className="mt-2 space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-neutral-200 bg-white p-3"
                >
                  <SinglePriceRow
                    kind="retail"
                    id={product.id}
                    name={product.name}
                    priceIdr={product.priceIdr === null ? "" : String(product.priceIdr)}
                    emptyHint="Kosongkan bila harga tidak ingin ditampilkan."
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
