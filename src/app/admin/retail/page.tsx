import Link from "next/link";

import { listRetailProducts } from "../actions/retail";
import { StatusBanner } from "../settings/_components/form-ui";
import { RetailProductRow } from "./retail-list";

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
            {products.length} products. Orders are placed via WhatsApp, with no
            shopping cart. The order below matches the website: Highlight/Collaboration
            products always appear first.
          </p>
        </div>
        <Link
          href="/admin/retail/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Add product
        </Link>
      </div>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Product deleted."
      />

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No retail products yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {products.map((product, index) => (
            <RetailProductRow
              key={product.id}
              product={product}
              products={products}
              index={index}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
