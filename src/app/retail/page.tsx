import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  WhatsAppLink,
} from "@/components/public/page-parts";
import { buyMessage } from "@/components/public/wa-button";
import { getRetailProducts } from "@/lib/content/retail";
import { withPageSeo } from "@/lib/content/seo";
import { formatIdr } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/retail", {
    title: "Retail",
    description:
      "Produk perawatan KAMA Spa yang bisa dibawa pulang — minyak, scrub, dan perlengkapan ritual di rumah.",
  });
}

export default async function RetailPage() {
  const products = await getRetailProducts();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Retail"
          title="Lanjutkan ritualnya di rumah."
          description="Produk yang kami pakai di ruang rawat, tersedia untuk dibawa pulang. Pemesanan lewat WhatsApp."
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            {products.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <article key={product.slug} className="flex flex-col gap-3">
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
                    {product.isHighlight ? (
                      <span className="eyebrow text-cocoa/60">Highlight</span>
                    ) : null}
                    <h2 className="font-display text-title-sm">{product.name}</h2>
                    {product.description ? (
                      <p className="text-body text-cocoa/70">
                        {product.description}
                      </p>
                    ) : null}
                    {product.priceIdr !== null ? (
                      <span className="font-display text-title-sm">
                        {formatIdr(product.priceIdr)}
                      </span>
                    ) : null}
                    <div className="mt-auto pt-2">
                      <WhatsAppLink
                        href={waLink(
                          product.whatsappMessage ?? buyMessage(product.name),
                        )}
                        label="Pesan via WhatsApp"
                        className="btn btn-outline border-cocoa/40"
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title="Belum ada produk retail"
                description="Produk akan muncul di sini begitu dipublikasikan dari dashboard admin."
              />
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
