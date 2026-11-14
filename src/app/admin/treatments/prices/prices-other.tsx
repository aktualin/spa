import Link from "next/link";

import { parsePriceLabel } from "@/lib/domain/pricing";

import { SinglePriceRow } from "./price-forms";
import type { PriceData } from "./prices-data";

/** Harga tier membership (angka diselaraskan dengan label tampil). */
export function MembershipPrices({ tiers }: { tiers: PriceData["tiers"] }) {
  return (
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
  );
}

/** Harga produk retail (kosong = tidak ditampilkan). */
export function RetailPrices({ products }: { products: PriceData["products"] }) {
  return (
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
  );
}