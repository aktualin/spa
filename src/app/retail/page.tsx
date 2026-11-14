import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { PublicEmptyState, PublicPageHeader } from "@/components/public/page-parts";
import { getRetailCatalog } from "@/lib/content/retail";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { ProductGrid } from "./retail-parts";

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