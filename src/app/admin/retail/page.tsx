import Link from "next/link";

import { canMoveRetail } from "@/lib/domain/retail";
import { formatIdr } from "@/lib/format";

import {
  listRetailProducts,
  moveRetailAction,
  toggleRetailPublishedAction,
} from "../actions/retail";
import { SmallSubmit } from "../promos/_kit/form-ui";
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
            keranjang belanja. Urutan di bawah sama dengan di website: produk
            Highlight/Kolaborasi selalu tampil lebih dulu.
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
          {products.map((product, index) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="size-12 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="size-12 shrink-0 rounded bg-neutral-100" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/retail/${product.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {product.name}
                    </Link>
                    {product.isHighlight ? <Badge>Highlight/Kolaborasi</Badge> : null}
                    {!product.isPublished ? <Badge tone="muted">Disembunyikan</Badge> : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    /{product.slug} ·{" "}
                    {product.priceIdr === null
                      ? "Hubungi kami (tanpa harga)"
                      : formatIdr(product.priceIdr)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <form action={moveRetailAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="direction" value="up" />
                    <SmallSubmit
                      title={`Naikkan urutan ${product.name}`}
                      disabled={!canMoveRetail(products, index, "up")}
                    >
                      ↑
                    </SmallSubmit>
                  </form>
                  <form action={moveRetailAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="direction" value="down" />
                    <SmallSubmit
                      title={`Turunkan urutan ${product.name}`}
                      disabled={!canMoveRetail(products, index, "down")}
                    >
                      ↓
                    </SmallSubmit>
                  </form>
                </div>
                <form action={toggleRetailPublishedAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <SmallSubmit
                    title={
                      product.isPublished
                        ? `Sembunyikan ${product.name} dari website`
                        : `Tampilkan ${product.name} di website`
                    }
                  >
                    {product.isPublished ? "Sembunyikan" : "Tampilkan"}
                  </SmallSubmit>
                </form>
                <Link
                  href={`/admin/retail/${product.id}`}
                  className="text-neutral-800 underline"
                >
                  Ubah
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
