import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { PromoGrid } from "@/components/public/promos/promo-parts";
import { getActivePromos } from "@/lib/content/promos";
import { withPageSeo } from "@/lib/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/promos", {
    title: "Promos",
    description:
      "Promo dan penawaran khusus KAMA Spa yang sedang berjalan — termasuk membership dan paket treatment.",
  });
}

export default async function PromosPage() {
  const promos = await getActivePromos();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Promos"
          title="Penawaran yang sedang berjalan."
          description="Promo aktif di KAMA Spa — berlaku selama periode yang tertera."
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Active Promos"
              title="Sedang berlangsung"
              description="Promo yang masih bisa dipakai hari ini."
            />
            {promos.length > 0 ? (
              <PromoGrid promos={promos} />
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title="Belum ada promo aktif"
                  description="Nantikan promo berikutnya — daftar ini terisi otomatis begitu promo dipublikasikan."
                />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="flex flex-col items-start gap-5 bg-cream-card px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  KAMA Membership
                </h2>
                <p className="max-w-[52ch] text-body text-cocoa/70">
                  Satu kredit essential service setiap bulan, harga anggota untuk seluruh
                  menu, dan benefit khusus lainnya.
                </p>
              </div>
              <Link
                href="/promos/membership"
                className="btn btn-outline shrink-0 border-cocoa/40"
              >
                Lihat Membership
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
