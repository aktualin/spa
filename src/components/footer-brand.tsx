import type { SiteSettings } from "@/lib/content/site";
import { footerSocials } from "@/lib/domain/site-settings";
import { asset } from "@/lib/asset-url";
import { Email, Facebook, Instagram, TikTok } from "./icons";

/* One icon per social platform — never a generic link glyph. */
const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  facebook: Facebook,
  email: Email,
} as const;

/** Kolom brand footer: lockup, sosial, tagline, dan email partnership. */
export function FooterBrand({
  settings,
  connectEyebrow,
  partnershipIntro,
}: {
  settings: SiteSettings;
  connectEyebrow: string;
  partnershipIntro: string;
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

        {/* Social + partnership — the icon matches the platform. */}
        <div className="flex flex-wrap items-center gap-3">
          {socials.map((social) => {
            const Icon = socialIcons[social.icon];
            return (
              <a
                key={social.label}
                href={social.href}
                target={social.icon === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-soft/40 transition-colors hover:bg-cream-soft hover:text-cocoa"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>

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