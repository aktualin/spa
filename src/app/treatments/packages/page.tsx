import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
} from "@/components/public/page-parts";
import { PackageCard } from "@/components/public/package-card";
import { getPackages } from "@/lib/content/catalog";
import { withPageSeo } from "@/lib/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/treatments/packages", {
    title: "Spa Packages",
    description:
      "Paket dan All Day Spa KAMA — rangkaian treatment yang disusun jadi satu ritual lengkap.",
  });
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Packages"
          title="Satu ritual, dirangkai lengkap."
          description="Gabungan beberapa treatment dalam satu kunjungan — untuk waktu yang memang disediakan untuk diri sendiri."
        >
          <Link
            href="/treatments"
            className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua treatment
          </Link>
        </PublicPageHeader>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            {packages.length > 0 ? (
              <div className="w-layout-grid whats-new_list">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.slug} pkg={pkg} />
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title="Belum ada paket"
                description="Paket akan muncul di sini begitu dipublikasikan dari dashboard admin."
              />
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
