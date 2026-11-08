import Link from "next/link";

import { formatIdr } from "@/lib/format";

import { listRetailProducts } from "../actions/retail";
import { Badge, StatusBanner } from "../settings/_components/form-ui";

export const instant = false;

export default async function AdminRetailPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [products, params] = await Promise.all([
    listRetailProducts(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">KAMA Retail</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {products.length} produk. Pemesanan dilakukan lewat WhatsApp, tanpa
            keranjang belanja.
          </p>
        </div>
        <Link
          href="/admin/retail/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah produk
        </Link>
      </div>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Produk dihapus."
      />

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Belum ada produk retail.</p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/retail/${product.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {product.name}
                  </Link>
                  {product.isHighlight ? <Badge>Highlight</Badge> : null}
                  {!product.isPublished ? <Badge tone="muted">Draf</Badge> : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  /{product.slug} · urutan {product.sortOrder}
                </p>
              </div>
              <p className="text-sm text-neutral-600">
                {product.priceIdr === null
                  ? "harga via WhatsApp"
                  : formatIdr(product.priceIdr)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
