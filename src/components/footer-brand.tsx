import type { SiteSettings } from "@/lib/content/site";
import { footerSocials } from "@/lib/domain/site-settings";
import { asset } from "@/lib/asset-url";
import { FooterConnect, type OfficeWhatsApp } from "./footer-connect";

/** Kolom brand footer: lockup, sosial + WA kantor, tagline, dan email partnership. */
export function FooterBrand({
  settings,
  connectEyebrow,
  partnershipIntro,
  officeWhatsApp,
}: {
  settings: SiteSettings;
  connectEyebrow: string;
  partnershipIntro: string;
  officeWhatsApp: OfficeWhatsApp | null;
}) {
  // Ikon sosial dari Kontak & Umum; field kosong tidak ditampilkan.
  const socials = footerSocials(settings);

  return (
    <div className="lg:col-span-5">
      <div className="flex flex-col gap-5">
        <img
          src={settings.logoLockupUrl || asset("img/kama/logo-kama-light.png")}
          alt={settings.brandLogoAlt || "KAMA Spa"}
          loading="lazy"
          className="h-9 w-auto self-start md:h-10"
        />

        {connectEyebrow ? (
          <span className="eyebrow text-cream-soft/70">{connectEyebrow}</span>
        ) : null}

        {/* Sosial + WhatsApp kantor — ikon cocok per platform (footer-connect.tsx). */}
        <FooterConnect socials={socials} officeWhatsApp={officeWhatsApp} />

        {settings.footerTagline ? (
          <p className="max-w-[46ch] font-display text-title-lg text-cream-soft md:text-[1.75rem] md:leading-[1.4]">
            {settings.footerTagline}
          </p>
        ) : null}

        {/* Partnership enquiries go straight to the e-mail. */}
        {settings.partnershipEmail ? (
          <p className="text-caption text-cream-soft/70">
            {partnershipIntro ? `${partnershipIntro} ` : null}
            <a
              href={`mailto:${settings.partnershipEmail}`}
              className="underline underline-offset-4 transition-colors hover:text-white"
            >
              {settings.partnershipEmail}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}