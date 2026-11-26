import { getNavigationData } from "@/lib/content/navigation";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { getSiteSettings } from "@/lib/content/site";
import { officeWhatsAppHref } from "@/lib/content/whatsapp";
import { formatWhatsAppLocalDisplay } from "@/lib/domain/site-settings";
import { FooterBottom } from "./footer-bottom";
import { FooterBrand } from "./footer-brand";
import { FooterLinks } from "./footer-links";

export async function Footer() {
  const [{ footer: footerLinks }, settings, pageCopy, officeHref] =
    await Promise.all([
      getNavigationData(),
      getSiteSettings(),
      getPageCopy(),
      officeWhatsAppHref(),
    ]);
  const copyright = copy(pageCopy, "global.copyright");
  const connectEyebrow = copy(pageCopy, "global.connect_eyebrow");
  const partnershipIntro = settings.partnershipIntro || copy(pageCopy, "global.partnership_intro");
  const privacyLabel = copy(pageCopy, "global.privacy_label");
  const termsLabel = copy(pageCopy, "global.terms_label");
  // Tujuan tautan struktural footer dari Kontak & Umum; kosong → route bawaan.
  const privacyHref = settings.footerPrivacyHref || "/privacy-policy";
  const termsHref = settings.footerTermsHref || "/terms-conditions";
  // Baris WA kantor hanya dirender bila link dan nomor tampilannya valid.
  const officeDisplay = formatWhatsAppLocalDisplay(settings.officeWhatsappNumber);
  const officeWhatsApp =
    officeHref && officeDisplay ? { href: officeHref, display: officeDisplay } : null;

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
              officeWhatsApp={officeWhatsApp}
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