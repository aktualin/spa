import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  WhatsAppLink,
} from "@/components/public/page-parts";
import { getRetailCatalog, type RetailCatalogItem } from "@/lib/content/retail";
import { copy, getPageCopy, type PageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { formatIdr } from "@/lib/format";

function ProductCard({
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
      {product.description ? (
        <p className="whitespace-pre-line text-body text-cocoa/70">{product.description}</p>
      ) : null}
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

function ProductGrid({
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

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/retail", {});
}

export default async function RetailPage() {
  // Katalog saja — tanpa keranjang/checkout; setiap produk dipesan via WhatsApp.
  const [products, pageCopy] = await Promise.all([getRetailCatalog(), getPageCopy()]);
  const highlights = products.filter((p) => p.isHighlight);
  const collaborations = products.filter((p) => p.isCollaboration);
  // Sisanya agar produk tidak tampil dua kali di halaman yang sama.
  const others = products.filter((p) => !p.isHighlight && !p.isCollaboration);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "retail.hero.eyebrow")}
          title={copy(pageCopy, "retail.hero.title")}
          description={copy(pageCopy, "retail.hero.description")}
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            {products.length > 0 ? (
              <>
                <ProductGrid
                  title={
                    highlights.length > 0
                      ? copy(pageCopy, "retail.highlight_title")
                      : undefined
                  }
                  products={highlights}
                  copyBlocks={pageCopy}
                />
                <ProductGrid
                  title={copy(pageCopy, "retail.collaboration_title")}
                  products={collaborations}
                  copyBlocks={pageCopy}
                />
                <ProductGrid
                  title={
                    highlights.length > 0 || collaborations.length > 0
                      ? copy(pageCopy, "retail.other_title")
                      : undefined
                  }
                  products={others}
                  copyBlocks={pageCopy}
                />
              </>
            ) : (
              <PublicEmptyState
                title={copy(pageCopy, "retail.empty_title")}
                description={copy(pageCopy, "retail.empty_description")}
              />
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
