import Link from "next/link";

import { canMoveRetail } from "@/lib/domain/retail";
import { formatIdr } from "@/lib/format";

import {
  moveRetailAction,
  toggleRetailPublishedAction,
  type listRetailProducts,
} from "../actions/retail";
import { SmallSubmit } from "../promos/_kit/form-ui";
import { Badge } from "../settings/_components/form-ui";

type Product = Awaited<ReturnType<typeof listRetailProducts>>[number];

/** Satu baris produk retail: harga, urutan, dan tombol tampil/sembunyi. */
export function RetailProductRow({
  product,
  products,
  index,
}: {
  product: Product;
  products: Product[];
  index: number;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
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
  );
}