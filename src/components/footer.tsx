import Link from "next/link";
import { ArrowRight, Email, Facebook, Instagram, TikTok } from "./icons";
import { CopyrightYear } from "./copyright-year";
import { getNavigationData } from "@/lib/content/navigation";
import { getSiteSettings, getWhatsAppTemplate } from "@/lib/content/site";
import { footerSocials } from "@/lib/domain/site-settings";
import { MEMBER_MESSAGE, waLink } from "@/lib/whatsapp";

/* One icon per social platform — never a generic link glyph. */
const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  facebook: Facebook,
  email: Email,
} as const;

export async function Footer() {
  const [{ footer: footerLinks }, settings, memberTemplate] = await Promise.all([
    getNavigationData(),
    getSiteSettings(),
    getWhatsAppTemplate("membership"),
  ]);
  // Ikon sosial dari Kontak & Umum; field kosong tidak ditampilkan.
  const socials = footerSocials(settings);
  return (
    <footer id="footer" className="mt-auto">
      {/* Membership call-to-action */}
      <section className="bg-cream-card">
        <div className="container-kama">
          <div className="flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:justify-between md:py-14">
            <h2 className="max-w-[22ch] font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              Become a KAMA Member for Rp 1.5jt a month
            </h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/membership"
                className="btn btn-outline whitespace-nowrap border-cocoa/40"
              >
                Learn More
              </Link>
              <a
                href={waLink(memberTemplate ?? MEMBER_MESSAGE, settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary whitespace-nowrap"
              >
                Join KAMA Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main footer */}
      <section className="bg-cocoa text-cream-soft">
        <div className="container-kama">
          <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
            {/* Brand + tagline */}
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-5">
                <span className="eyebrow text-cream-soft/70">Connect with us</span>

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
                <p className="text-caption text-cream-soft/70">
                  Kolaborasi dan partnership:{" "}
                  <a
                    href="mailto:marketing@kamaspa.id"
                    className="underline underline-offset-4 transition-colors hover:text-white"
                  >
                    marketing@kamaspa.id
                  </a>
                </p>
              </div>
            </div>

            {/* Link groups */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 xl:grid-cols-5">
                {Object.entries(footerLinks).map(([group, links]) => (
                  <div key={group} className="flex flex-col gap-4">
                    <span className="eyebrow text-cream-soft/60">{group}</span>
                    <ul className="flex flex-col gap-2.5">
                      {links.map((link) => (
                        <li key={link.label}>
                          {link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-caption text-cream-soft/85 transition-colors hover:text-white"
                            >
                              {link.label}
                            </a>
                          ) : /^(mailto:|tel:|https?:)/.test(link.href) ? (
                            <a
                              href={link.href}
                              className="text-caption text-cream-soft/85 transition-colors hover:text-white"
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-caption text-cream-soft/85 transition-colors hover:text-white"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <section className="border-t border-cocoa/20 bg-cocoa text-cream-soft">
        <div className="container-kama">
          <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-caption text-cream-soft/70">
              <CopyrightYear />
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/privacy-policy"
                className="text-caption text-cream-soft/70 transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-conditions"
                className="text-caption text-cream-soft/70 transition-colors hover:text-white"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
