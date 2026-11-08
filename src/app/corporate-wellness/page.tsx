import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import {
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import {
  CorporateBenefits,
  CorporatePrograms,
  CorporateSolutions,
  CorporateSteps,
} from "@/components/public/corporate/corporate-parts";
import { CorporateInquiryForm } from "@/components/public/corporate-inquiry-form";
import {
  getCorporateContent,
  getCorporateInSpaItems,
  getCorporateSteps,
} from "@/lib/content/corporate";
import { withPageSeo } from "@/lib/content/seo";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { corporateWhatsApp } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/corporate-wellness", {
    title: "Corporate Wellness",
    description:
      "KAMA Corporate Wellness Solutions — program wellness di kantor, pengalaman wellness tim, dan benefit kesehatan karyawan.",
  });
}

export default async function CorporateWellnessPage() {
  const content = await getCorporateContent();
  const inSpaItems = getCorporateInSpaItems();
  const steps = getCorporateSteps();

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Corporate Wellness Solutions"
          title={content.heroTitle}
          description={content.intro ?? undefined}
        />

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-10 md:py-14">
            <div className="aspect-[16/9] overflow-hidden bg-cream-card">
              <img
                src="/img/kama/corporate/01-corporate-sign.jpg"
                alt="KAMA Spa — Corporate Wellness Solutions"
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div className="aspect-[4/5] overflow-hidden bg-cream-card">
                <img
                  src="/img/kama/corporate/02-massage.jpg"
                  alt="Corporate wellness session"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  About Us
                </h2>
                <p className="text-body text-cocoa/70">
                  <strong>KAMA Spa</strong> is a wellness sanctuary in the heart of
                  South Jakarta.
                </p>
                <p className="text-body text-cocoa/70">
                  Combining traditional healing techniques and modern wellness
                  approaches, KAMA Spa offers thoughtfully curated treatments designed
                  to restore balance, relaxation, and mindful presence.
                </p>
                <p className="text-lead text-style-italic">
                  More than relaxation — we create meaningful reset experiences.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Why Partner with KAMA?"
              title="Healthy Employees Build Stronger Companies"
              description="Employee wellness is no longer just a benefit—it has become an essential investment in building a healthier, happier, and more productive workplace."
            />
            <div className="mt-8">
              <CorporateBenefits items={content.benefits} />
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Solutions"
              title="Thoughtfully designed wellness experiences that go beyond massage."
              description="Our goal isn't simply to provide massage. We create meaningful wellness experiences for your people."
            />
            <div className="mt-8">
              <CorporateSolutions items={content.solutions} />
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="In-Office Program"
              title="A Restorative Wellness Experience at Your Workplace"
              description="Sample Programs*"
            />
            {content.inOfficeHtml ? (
              <div
                className="text-rich-text mt-8 max-w-[80ch] text-body text-cocoa/80"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(content.inOfficeHtml),
                }}
              />
            ) : (
              <div className="mt-8">
                <CorporatePrograms items={content.programs} />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div className="flex flex-col gap-4">
                <span className="eyebrow text-cocoa/60">
                  In-Spa Corporate Experience
                </span>
                <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  Bring Your Team Together Through Wellness
                </h2>
                {content.inSpaHtml ? (
                  <div
                    className="text-rich-text max-w-[70ch] text-body text-cocoa/80"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(content.inSpaHtml),
                    }}
                  />
                ) : (
                  <>
                    <p className="text-body text-cocoa/70">
                      Treat your employees to a private wellness experience at KAMA
                      Spa—designed to reward, reconnect, and recharge your team in a
                      calm and premium environment.
                    </p>
                    <h3 className="font-display text-title-sm">Ideal For:</h3>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {inSpaItems.map((item) => (
                        <li key={item} className="text-body text-cocoa/80">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="aspect-[4/5] overflow-hidden bg-cream-card">
                <img
                  src="/img/kama/corporate/05-lounge.jpg"
                  alt="KAMA Spa lounge with team enjoying refreshments"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="From Consultation to Partnership"
              title="A Simple 4-Step Collaboration Process"
            />
            <div className="mt-8">
              {content.stepsHtml ? (
                <div
                  className="text-rich-text max-w-[80ch] text-body text-cocoa/80"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(content.stepsHtml),
                  }}
                />
              ) : (
                <CorporateSteps items={steps} />
              )}
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream-soft">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <PublicSectionHeader
              eyebrow="Past Collaborations"
              title="Wellness in action — on location"
            />
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
              {[
                "/img/kama/corporate/06-collab-1.jpg",
                "/img/kama/corporate/07-collab-2.jpg",
                "/img/kama/corporate/08-collab-3.jpg",
              ].map((src) => (
                <li key={src} className="aspect-[3/5] overflow-hidden bg-cream-card">
                  <img
                    src={src}
                    alt="KAMA corporate wellness collaboration"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal as="section" className="bg-cream">
          <div className="container-kama py-14 md:py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
                  Let&apos;s build your wellness program.
                </h2>
                <p className="max-w-[52ch] text-body text-cocoa/70">
                  Ceritakan kebutuhan tim Anda — kami akan menyusun program yang
                  paling sesuai.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={corporateWhatsApp(content.picPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Talk to Roy
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  {content.picEmail ? (
                    <a
                      href={`mailto:${content.picEmail}`}
                      className="btn btn-outline border-cocoa/40"
                    >
                      {content.picEmail}
                    </a>
                  ) : null}
                </div>
                {content.picName || content.picPhone ? (
                  <p className="text-caption text-cocoa/60">
                    {[content.picName, content.picPhone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-5 bg-cream-card p-6 md:p-8">
                <h3 className="font-display text-title-sm md:text-[1.375rem]">
                  Inquiry Corporate Wellness
                </h3>
                <CorporateInquiryForm />
              </div>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
