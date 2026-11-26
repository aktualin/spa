import { getNavigationData } from "@/lib/content/navigation";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { getSiteSettings } from "@/lib/content/site";
import { whatsAppHref } from "@/lib/content/whatsapp";
import { FooterBottom } from "./footer-bottom";
import { FooterBrand } from "./footer-brand";
import { FooterLinks } from "./footer-links";

export async function Footer() {
  const [{ footer: footerLinks }, settings, pageCopy, joinHref] =
    await Promise.all([
      getNavigationData(),
      getSiteSettings(),
      getPageCopy(),
      whatsAppHref("membership"),
    ]);
  const copyright = copy(pageCopy, "global.copyright");
  const connectEyebrow = copy(pageCopy, "global.connect_eyebrow");
  const partnershipIntro = settings.partnershipIntro || copy(pageCopy, "global.partnership_intro");
  const privacyLabel = copy(pageCopy, "global.privacy_label");
  const termsLabel = copy(pageCopy, "global.terms_label");
  // Tujuan tautan struktural footer dari Kontak & Umum; kosong → route bawaan.
  const learnHref = settings.footerMembershipLearnHref || "/membership";
  const privacyHref = settings.footerPrivacyHref || "/privacy-policy";
  const termsHref = settings.footerTermsHref || "/terms-conditions";

  return (
    <footer id="footer" className="mt-auto">
      {/* Main footer */}
      <section className="bg-cocoa text-cream-soft">
        <div className="container-kama">
          <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
            <FooterBrand
              settings={settings}
              connectEyebrow={connectEyebrow}
              partnershipIntro={partnershipIntro}
            />
            <FooterLinks groups={footerLinks} />
          </div>
        </div>
      </section>

      <FooterBottom
        copyright={copyright}
        privacyLabel={privacyLabel}
        privacyHref={privacyHref}
        termsLabel={termsLabel}
        termsHref={termsHref}
      />
    </footer>
  );
}