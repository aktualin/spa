import { WhatsAppLink } from "@/components/public/page-parts";
import type { RetailCatalogItem } from "@/lib/content/retail";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { formatIdr } from "@/lib/format";
import { RichText } from "@/components/rich-text";

/** Kartu produk retail — pesan via WhatsApp, tanpa keranjang/checkout. */
export function ProductCard({
  product,
  copyBlocks,
}: {
  product: RetailCatalogItem;
  copyBlocks: PageCopy;
}) {
  return (
    <article className="flex flex-col gap-3">
      {product.imageUrl ? (
        <div className="image-container aspect-square overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="image-cover"
          />
        </div>
      ) : null}
      <h2 className="font-display text-title-sm">{product.name}</h2>
      <RichText value={product.description} className="text-body text-cocoa/70" />
      {product.priceIdr !== null ? (
        <span className="font-display text-title-sm">{formatIdr(product.priceIdr)}</span>
      ) : (
        <span className="text-body text-cocoa/60">{copy(copyBlocks, "retail.price_missing")}</span>
      )}
      <div className="mt-auto pt-2">
        <WhatsAppLink
          href={product.whatsappUrl}
          label={copy(copyBlocks, "retail.order_label")}
          className="btn btn-outline border-cocoa/40"
        />
      </div>
    </article>
  );
}

/** Grid produk per kelompok (highlight/kolaborasi/lainnya); kosong → null. */
export function ProductGrid({
  title,
  products,
  copyBlocks,
}: {
  title?: string;
  products: RetailCatalogItem[];
  copyBlocks: PageCopy;
}) {
  if (products.length === 0) return null;
  return (
    <div className="mt-12 first:mt-0">
      {title ? <h2 className="eyebrow mb-6 text-cocoa/60">{title}</h2> : null}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} copyBlocks={copyBlocks} />
        ))}
      </div>
    </div>
  );
}