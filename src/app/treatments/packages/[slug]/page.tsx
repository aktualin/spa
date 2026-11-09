import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowLeft, Check } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { PackageCard } from "@/components/public/package-card";
import { WaLink } from "@/components/public/wa-button";
import { getCatalogSlugs, getPackage, getPackages } from "@/lib/content/catalog";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { formatDuration } from "@/lib/domain/pricing";
import { formatIdr } from "@/lib/format";
import { whatsAppHref } from "@/lib/content/whatsapp";

type PackagePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { packages } = await getCatalogSlugs();
  return packages.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) {
    const pageCopy = await getPageCopy();
    return { title: copy(pageCopy, "catalog.package.not_found_title") || undefined };
  }

  return withPageSeo(`/treatments/packages/${slug}`, {
    title: pkg.seoTitle ?? pkg.name,
    description:
      pkg.seoDescription ??
      pkg.description ??
      `${pkg.name} di KAMA Spa — isi paket, durasi, dan harga.`,
  });
}

export default async function PackagePage({ params }: PackagePageProps) {
  /* Slug adalah runtime data — dibaca di dalam Suspense boundary. */
  const pageCopy = await getPageCopy();
  return (
    <>
      <Navigation />
      <Suspense
        fallback={<PackageFallback title={copy(pageCopy, "catalog.package.loading_title")} />}
      >
        <PackageContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

function PackageFallback({ title }: { title: string }) {
  return (
    <main className="flex-1">
      <Reveal as="section" className="bg-cream-soft">
        <div className="container-kama py-14 md:py-20 lg:py-24">
          <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
            {title}
          </h1>
        </div>
      </Reveal>
    </main>
  );
}

async function PackageContent({ params }: PackagePageProps) {
  const { slug } = await params;
  const [pkg, pageCopy] = await Promise.all([getPackage(slug), getPageCopy()]);

  if (!pkg) notFound();

  const others = (await getPackages()).filter((p) => p.slug !== slug).slice(0, 3);
  const waHref = await whatsAppHref("package", {
    custom: pkg.whatsappMessage,
    values: {
      package: pkg.name,
      price: formatIdr(pkg.priceIdr),
      duration: pkg.durationMin ? formatDuration(pkg.durationMin) : null,
    },
  });

  return (
    <main className="flex-1">
        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-4">
                <Link
                  href="/treatments/packages"
                  className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy(pageCopy, "catalog.package.back")}
                </Link>
                <span className="eyebrow text-cocoa/60">{copy(pageCopy, "catalog.package.eyebrow")}</span>
                <h1 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  {pkg.name}
                </h1>
                {pkg.description ? (
                  <p className="max-w-[52ch] text-lead text-cocoa/70">
                    {pkg.description}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  {pkg.durationMin ? (
                    <span className="text-caption text-cocoa/60">
                      {formatDuration(pkg.durationMin)}
                    </span>
                  ) : null}
                  <span className="font-display text-title-sm">
                    {formatIdr(pkg.priceIdr)}
                  </span>
                </div>
                <div>
                  <WaLink href={waHref} context="package">
                    {copy(pageCopy, "catalog.package.cta_whatsapp")}
                  </WaLink>
                </div>
              </div>

              {pkg.imageUrl ? (
                <div className="image-container aspect-[4/3] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="image-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>

        {pkg.items.length > 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {copy(pageCopy, "catalog.package.includes_title")}
              </h2>
              <ul className="mt-8 flex max-w-[48rem] flex-col">
                {pkg.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 border-b border-cocoa/15 py-4"
                  >
                    <Check className="h-4 w-4 shrink-0" />
                    {item.treatmentSlug ? (
                      <Link
                        href={`/menu/${item.treatmentSlug}`}
                        className="text-body underline underline-offset-4 transition-opacity hover:opacity-70"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-body">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ) : null}

        {others.length > 0 ? (
          <Reveal as="section" className="bg-cream-soft">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                {copy(pageCopy, "catalog.package.others_title")}
              </h2>
              <div className="w-layout-grid whats-new_list mt-8">
                {others.map((other) => (
                  <PackageCard key={other.slug} pkg={other} />
                ))}
              </div>
            </div>
          </Reveal>
        ) : null}
    </main>
  );
}
