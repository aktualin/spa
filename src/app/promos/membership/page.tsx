import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Check } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { getMembershipTiers } from "@/lib/content/membership";
import { withPageSeo } from "@/lib/content/seo";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { MEMBER_MESSAGE, waLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/promos/membership", {
    title: "Membership",
    description:
      "KAMA Membership — paket keanggotaan dengan essential service bulanan, harga anggota untuk seluruh menu, dan benefit khusus.",
  });
}

export default async function PromosMembershipPage() {
  const tiers = await getMembershipTiers();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Membership"
          title="KAMA Membership."
          description="Pastikan waktu me-time Anda selalu tercatat. Setiap bulan Anda mendapat kredit untuk satu essential service, harga yang lebih ringan, serta penawaran khusus untuk anggota KAMA."
        >
          <div className="button-group mt-4 flex flex-wrap gap-3">
            <a
              href={waLink(MEMBER_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Join KAMA Now
            </a>
            <Link href="/menu" className="btn btn-outline border-cocoa/40">
              Lihat Menu
            </Link>
          </div>
        </PublicPageHeader>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Membership Plans"
              title="Pilih yang paling sesuai dengan ritme Anda."
            />
            {tiers.length > 0 ? (
              <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {tiers.map((tier) => (
                  <li key={tier.id} className="flex h-full flex-col bg-cream-card p-6">
                    <div className="flex flex-col gap-2">
                      <span className="eyebrow text-cocoa/60">{tier.name}</span>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-display text-title md:text-[1.75rem]">
                          {tier.priceLabel}
                        </span>
                        {tier.billingNote ? (
                          <span className="caption-s text-cocoa/60">
                            {tier.billingNote}
                          </span>
                        ) : null}
                      </div>
                      {tier.summary ? (
                        <p className="text-body text-cocoa/70">{tier.summary}</p>
                      ) : null}
                    </div>

                    {tier.benefits.length > 0 ? (
                      <ul className="mt-5 flex flex-col gap-2">
                        {tier.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 text-body">
                            <span className="mt-1 shrink-0">
                              <Check className="h-4 w-4" />
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {tier.terms ? (
                      <div
                        className="mt-5 border-t border-cocoa/15 pt-4 text-body text-cocoa/70"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(plainTextToHtml(tier.terms)) }}
                      />
                    ) : null}

                    <a
                      href={waLink(MEMBER_MESSAGE)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline mt-6 border-cocoa/40"
                    >
                      Join Now
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8">
                <PublicEmptyState
                  title="Belum ada paket membership"
                  description="Paket membership akan tampil di sini setelah dipublikasikan."
                />
              </div>
            )}
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
