import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Check } from "@/components/icons";
import { CorporateInquiryForm } from "@/components/public/corporate-inquiry-form";
import { CorporateClientLogos } from "@/components/public/corporate/corporate-client-logos";
import { isCaptchaConfigured } from "@/lib/captcha";
import { getCorporatePageData } from "@/lib/content/corporate";
import { withPageSeo } from "@/lib/content/seo";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { corporateWhatsApp } from "@/lib/whatsapp";
import { Reveal } from "@/components/reveal";

/*
 * Halaman Corporate Wellness (desain asli). Isi dibaca dari database lewat
 * `getCorporatePageData()` dengan fallback statis identik — tampilan tidak
 * berubah sebelum admin mengubah apa pun. `/corporate-wellness` dialihkan ke
 * sini, jadi override SEO lama untuk path itu tetap dipakai bila `/corporate`
 * belum punya override sendiri.
 */
export async function generateMetadata(): Promise<Metadata> {
  const defaults: Metadata = {
    title: "Corporate Wellness",
    description:
      "KAMA Corporate Wellness Solutions — program wellness di kantor, pengalaman wellness tim, dan benefit kesehatan karyawan.",
  };
  return withPageSeo("/corporate", await withPageSeo("/corporate-wellness", defaults));
}

export default async function CorporatePage() {
  const { content, programs, steps, clients, collabPhotos } = await getCorporatePageData();
  const picWhatsApp = corporateWhatsApp(content.pic.phone);
  // Captcha wajib di production: tanpa key lengkap formulir diganti kontak langsung
  // (server juga menolak kiriman — fail-closed).
  const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
  const formAvailable = process.env.NODE_ENV !== "production" || isCaptchaConfigured();

  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">Corporate Wellness Solutions</div>
                <h1 className="header-xxl">{content.heroTitle}</h1>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="padding-global">
          <div className="container-large">
            <div className="image-container" style={{ aspectRatio: "16 / 9" }}>
              <img
                src="/img/kama/corporate/01-corporate-sign.jpg"
                alt="KAMA Spa — Corporate Wellness Solutions"
                className="image-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>

        <Reveal as="section" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="corporate-split">
                <div>
                  <div className="image-container" style={{ aspectRatio: "4 / 5" }}>
                    <img
                      src="/img/kama/corporate/02-massage.jpg"
                      alt="Corporate wellness session"
                      className="image-cover"
                      loading="eager"
                    />
                  </div>
                </div>
                <div style={{ maxWidth: "34rem" }}>
                  <h3 className="header-l">About Us</h3>
                  <div className="spacer-small" />
                  <p className="body-m text-color-gray">
                    <strong>KAMA Spa</strong> is a wellness sanctuary in the heart of South
                    Jakarta.
                  </p>
                  <div className="spacer-small" />
                  <p className="body-m text-color-gray">
                    Combining traditional healing techniques and modern wellness
                    approaches, KAMA Spa offers thoughtfully curated treatments designed
                    to restore balance, relaxation, and mindful presence.
                  </p>
                  <div className="spacer-medium" />
                  <p className="body-m text-style-italic">
                    More than relaxation — we create meaningful reset experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" id="benefits" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h2 className="header-l">
                  Healthy Employees Build Stronger Companies
                </h2>
                <p className="body-m text-color-gray">{content.intro}</p>
              </div>
              <div className="layout-row gap-large">
                <ul className="benefit-list sizing-grow">
                  {content.benefits.map((b, bi) => (
                    <li key={`${bi}-${b}`} className="benefit-list_item">
                      <span className="benefit-list_icon">
                        <Check />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="sizing-grow">
                  <div className="text-rich-text header-l w-richtext">
                    <p>
                      <em>
                        Wellness is not an expense. It&apos;s an investment in your people.
                      </em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">Why Partner with KAMA?</div>
                <h2 className="header-l">
                  Thoughtfully designed wellness experiences that go beyond massage.
                </h2>
                <p className="body-m text-color-gray">
                  Our goal isn&apos;t simply to provide massage. We create meaningful wellness
                  experiences for your people.
                </p>
              </div>

              <div className="w-layout-grid whats-new_list">
                {content.solutions.map((sol, si) => (
                  <div key={`${si}-${sol.title}`} className="package-card w-dyn-item">
                    <div className="package-card_body">
                      <h3 className="header-s">{sol.title}</h3>
                      <ul className="benefit-list">
                        {sol.items.map((item, ii) => (
                          <li key={`${ii}-${item}`} className="benefit-list_item">
                            <span className="benefit-list_icon">
                              <Check />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" id="in-office" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">In-Office Program</div>
                <h2 className="header-l">
                  A Restorative Wellness Experience at Your Workplace
                </h2>
                <p className="body-m text-color-gray">Sample Programs*</p>
              </div>

              {programs.length > 0 ? (
              <div className="w-layout-grid whats-new_list">
                {programs.map((prog) => (
                  <div key={prog.id} className="package-card w-dyn-item">
                    {prog.imageUrl ? (
                      <div className="package-card_image image-container">
                        <img
                          src={prog.imageUrl}
                          alt={prog.name}
                          className="image-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="package-card_body">
                      <div className="eyebrow-s text-style-allcaps">{prog.name}</div>
                      {prog.description ? (
                        <div className="body-m text-color-gray">{prog.description}</div>
                      ) : null}
                      <ul className="benefit-list">
                        {prog.features.map((f, fi) => (
                          <li key={`${fi}-${f}`} className="benefit-list_item">
                            <span className="benefit-list_icon">
                              <Check />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              ) : null}
              {content.inOfficeHtml ? (
                <>
                  <div className="spacer-medium" />
                  <div
                    className="text-rich-text body-m text-color-gray w-richtext"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.inOfficeHtml) }}
                  />
                </>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal as="section" id="in-spa" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="corporate-split">
                <div>
                  <div className="eyebrow-s text-style-allcaps">In-Spa Corporate Experience</div>
                  <h2 className="header-l">
                    Bring Your Team Together Through Wellness
                  </h2>
                  {content.inSpaHtml ? (
                    <div
                      className="text-rich-text body-m text-color-gray w-richtext"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.inSpaHtml) }}
                    />
                  ) : (
                    <p className="body-m text-color-gray">
                      Treat your employees to a private wellness experience at KAMA
                      Spa—designed to reward, reconnect, and recharge your team in a calm
                      and premium environment.
                    </p>
                  )}
                  <div className="spacer-small" />
                  <h3 className="header-s">Ideal For:</h3>
                  <ul className="benefit-list">
                    {content.inSpaItems.map((i, ii) => (
                      <li key={`${ii}-${i}`} className="benefit-list_item">
                        <span className="benefit-list_icon">
                          <Check />
                        </span>
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="image-container" style={{ aspectRatio: "4 / 5" }}>
                    <img
                      src="/img/kama/corporate/05-lounge.jpg"
                      alt="KAMA Spa lounge with team enjoying refreshments"
                      className="image-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {steps.length > 0 ? (
        <Reveal as="section" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">From Consultation to Partnership</div>
                <h2 className="header-l">A Simple {steps.length}-Step Collaboration Process</h2>
              </div>
              <div className="w-layout-grid whats-new_list">
                {steps.map((step, idx) => (
                  <div key={step.id} className="package-card w-dyn-item">
                    <div className="package-card_body">
                      <div className="eyebrow-s text-style-allcaps">Step {idx + 1}</div>
                      <h3 className="header-s">{step.title}</h3>
                      {step.body ? (
                        <div className="body-m text-color-gray">{step.body}</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              {content.stepsHtml ? (
                <>
                  <div className="spacer-medium" />
                  <div
                    className="text-rich-text body-m text-color-gray w-richtext"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.stepsHtml) }}
                  />
                </>
              ) : null}
            </div>
          </div>
        </Reveal>
        ) : null}

        {collabPhotos.length > 0 || clients.length > 0 ? (
        <Reveal as="section" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">Past Collaborations</div>
                <h2 className="header-l">Wellness in action — on location</h2>
              </div>
              {clients.length > 0 ? <CorporateClientLogos clients={clients} /> : null}
              {collabPhotos.length > 0 ? (
              <div className="corporate-split split-3">
                {collabPhotos.map((photo, pi) => (
                  <div key={`${pi}-${photo.src}`}>
                    <div className="image-container" style={{ aspectRatio: "3 / 5" }}>
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="image-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
              ) : null}
            </div>
          </div>
        </Reveal>
        ) : null}

        <Reveal as="section" id="inquiry" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="corporate-split">
                <div style={{ maxWidth: "34rem" }}>
                  <div className="eyebrow-s text-style-allcaps">Corporate Inquiry</div>
                  <h2 className="header-l">Tell us about your team.</h2>
                  <div className="spacer-small" />
                  <p className="body-m text-color-gray">
                    Share a few details and our corporate team will get back to you with a
                    program tailored to your company.
                  </p>
                </div>
                <div className="min-w-0">
                  <CorporateInquiryForm
                    captchaSiteKey={captchaSiteKey}
                    available={formAvailable}
                    whatsappHref={picWhatsApp}
                    contactEmail={content.pic.email}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="section_get-in-touch is-top-off">
          <div className="get-in-touch_container">
            <div className="get-in-touch_banner">
              <h4 className="header-l">Let&apos;s build your wellness program.</h4>
              <a
                href={picWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>
                  Talk to {content.pic.name} · {content.pic.phone}
                </div>
                <div className="button_icon w-embed">
                  <ArrowRight />
                </div>
              </a>
              <a
                href={`mailto:${content.pic.email}`}
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>{content.pic.email}</div>
                <div className="button_icon w-embed">
                  <ArrowRight />
                </div>
              </a>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
