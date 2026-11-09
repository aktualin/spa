import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Check } from "@/components/icons";
import { CorporateInquiryForm } from "@/components/public/corporate-inquiry-form";
import { CorporateClientLogos } from "@/components/public/corporate/corporate-client-logos";
import { isCaptchaConfigured } from "@/lib/captcha";
import { getCorporatePageData } from "@/lib/content/corporate";
import { copy, getPageCopy } from "@/lib/content/page-copy";
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
  return withPageSeo("/corporate", await withPageSeo("/corporate-wellness", {}));
}

export default async function CorporatePage() {
  const [{ content, programs, steps, clients, collabPhotos }, pageCopy] =
    await Promise.all([getCorporatePageData(), getPageCopy()]);
  const picWhatsApp = corporateWhatsApp(content.pic.phone);
  // Captcha wajib di production: tanpa key lengkap formulir diganti kontak langsung
  // (server juga menolak kiriman — fail-closed).
  const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
  const formAvailable = process.env.NODE_ENV !== "production" || isCaptchaConfigured();

  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        {content.heroTitle ? (
          <Reveal as="section" className="page-hero">
            <div className="padding-global">
              <div className="container-large">
                <div className="section-header">
                  <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.hero.eyebrow")}</div>
                  <h1 className="header-xxl">{content.heroTitle}</h1>
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}

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
                  <h3 className="header-l">{copy(pageCopy, "corporate.about_title")}</h3>
                  <div className="spacer-small" />
                  {copy(pageCopy, "corporate.about_p1") ? (
                    <p className="body-m text-color-gray">
                      {copy(pageCopy, "corporate.about_p1")}
                    </p>
                  ) : null}
                  <div className="spacer-small" />
                  {copy(pageCopy, "corporate.about_p2") ? (
                    <p className="body-m text-color-gray">
                      {copy(pageCopy, "corporate.about_p2")}
                    </p>
                  ) : null}
                  <div className="spacer-medium" />
                  {copy(pageCopy, "corporate.about_quote") ? (
                    <p className="body-m text-style-italic">
                      {copy(pageCopy, "corporate.about_quote")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {content.benefits.length > 0 || content.intro ? (
        <Reveal as="section" id="benefits" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h2 className="header-l">
                  {copy(pageCopy, "corporate.benefits_title")}
                </h2>
                {content.intro ? (
                  <p className="body-m text-color-gray">{content.intro}</p>
                ) : null}
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
                      <em>{copy(pageCopy, "corporate.benefits_quote")}</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        ) : null}

        {content.solutions.length > 0 ? (
        <Reveal as="section" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.partner_eyebrow")}</div>
                <h2 className="header-l">
                  {copy(pageCopy, "corporate.partner_title")}
                </h2>
                {copy(pageCopy, "corporate.partner_description") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "corporate.partner_description")}
                  </p>
                ) : null}
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
        ) : null}

        <Reveal as="section" id="in-office" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.in_office_eyebrow")}</div>
                <h2 className="header-l">
                  {copy(pageCopy, "corporate.in_office_title")}
                </h2>
                <p className="body-m text-color-gray">{copy(pageCopy, "corporate.in_office_sample")}</p>
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
                  <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.in_spa_eyebrow")}</div>
                  <h2 className="header-l">
                    {copy(pageCopy, "corporate.in_spa_title")}
                  </h2>
                  {content.inSpaHtml ? (
                    <div
                      className="text-rich-text body-m text-color-gray w-richtext"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.inSpaHtml) }}
                    />
                  ) : (
                    <p className="body-m text-color-gray">
                      {copy(pageCopy, "corporate.in_spa_fallback")}
                    </p>
                  )}
                  <div className="spacer-small" />
                  <h3 className="header-s">{copy(pageCopy, "corporate.ideal_for")}</h3>
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
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.steps_eyebrow")}</div>
                <h2 className="header-l">
                  {copy(pageCopy, "corporate.steps_title_prefix")} {steps.length}-{" "}
                  {copy(pageCopy, "corporate.steps_title_suffix")}
                </h2>
              </div>
              <div className="w-layout-grid whats-new_list">
                {steps.map((step, idx) => (
                  <div key={step.id} className="package-card w-dyn-item">
                    <div className="package-card_body">
                      <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.step_label")} {idx + 1}</div>
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
                <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.collab_eyebrow")}</div>
                <h2 className="header-l">{copy(pageCopy, "corporate.collab_title")}</h2>
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
                  <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "corporate.inquiry_eyebrow")}</div>
                  <h2 className="header-l">{copy(pageCopy, "corporate.inquiry_title")}</h2>
                  <div className="spacer-small" />
                  {copy(pageCopy, "corporate.inquiry_description") ? (
                    <p className="body-m text-color-gray">
                      {copy(pageCopy, "corporate.inquiry_description")}
                    </p>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <CorporateInquiryForm
                    captchaSiteKey={captchaSiteKey}
                    available={formAvailable}
                    whatsappHref={picWhatsApp}
                    contactEmail={content.pic.email}
                    labels={{
                      name: copy(pageCopy, "corporate_form.name"),
                      company: copy(pageCopy, "corporate_form.company"),
                      email: copy(pageCopy, "corporate_form.email"),
                      phone: copy(pageCopy, "corporate_form.phone"),
                      message: copy(pageCopy, "corporate_form.message"),
                      messagePlaceholder: copy(pageCopy, "corporate_form.message_placeholder"),
                      consentPrefix: copy(pageCopy, "corporate_form.consent_prefix"),
                      privacyLabel: copy(pageCopy, "corporate_form.privacy_label"),
                      consentSuffix: copy(pageCopy, "corporate_form.consent_suffix"),
                      submit: copy(pageCopy, "corporate_form.submit"),
                      submitting: copy(pageCopy, "corporate_form.submitting"),
                      unavailable: copy(pageCopy, "corporate_form.unavailable"),
                      whatsapp: copy(pageCopy, "corporate_form.whatsapp"),
                      successTitle: copy(pageCopy, "corporate_form.success_title"),
                      successBody: copy(pageCopy, "corporate_form.success_body"),
                      errorName: copy(pageCopy, "corporate_form.error_name"),
                      errorEmailRequired: copy(pageCopy, "corporate_form.error_email_required"),
                      errorEmailFormat: copy(pageCopy, "corporate_form.error_email_format"),
                      errorMessage: copy(pageCopy, "corporate_form.error_message"),
                      errorConsent: copy(pageCopy, "corporate_form.error_consent"),
                      errorCaptcha: copy(pageCopy, "corporate_form.error_captcha"),
                      errorCaptchaLoad: copy(pageCopy, "corporate_form.error_captcha_load"),
                      errorIncomplete: copy(pageCopy, "corporate_form.error_incomplete"),
                      errorSend: copy(pageCopy, "corporate_form.error_send"),
                      errorNetwork: copy(pageCopy, "corporate_form.error_network"),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="section_get-in-touch is-top-off">
          <div className="get-in-touch_container">
            <div className="get-in-touch_banner">
              <h4 className="header-l">{copy(pageCopy, "corporate.banner_title")}</h4>
              <a
                href={picWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>
                  {copy(pageCopy, "corporate.talk_prefix")} {content.pic.name} ·{" "}
                  {content.pic.phone}
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
