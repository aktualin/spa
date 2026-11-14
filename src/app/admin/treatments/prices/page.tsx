import { requireRole } from "@/lib/auth";

import { CatalogTabs } from "../catalog-tabs";
import { CategoryPrices, PackagePrices } from "./prices-catalog";
import { loadPriceData } from "./prices-data";
import { MembershipPrices, RetailPrices } from "./prices-other";

export const instant = false;

export default async function AdminPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(["ADMIN", "EDITOR"]);
  const params = await searchParams;

  const { categories, packages, tiers, products } = await loadPriceData();

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
        <CategoryPrices categories={categories} />
        <PackagePrices packages={packages} />
        <MembershipPrices tiers={tiers} />
        <RetailPrices products={products} />
      </div>
    </div>
  );
}