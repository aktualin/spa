import Link from "next/link";

import type { SiteSettings } from "@/lib/content/site";
import { ArrowRight } from "./icons";

/** Membership call-to-action di bagian atas footer. */
export function FooterMembershipCta({
  settings,
  learnHref,
  joinHref,
}: {
  settings: SiteSettings;
  learnHref: string;
  joinHref: string | null;
}) {
  if (
    !settings.footerMembershipTitle &&
    !settings.footerMembershipLearnLabel &&
    !settings.footerMembershipJoinLabel
  ) {
    return null;
  }

  return (
    <section className="bg-cream-card">
      <div className="container-kama">
        <div className="flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:justify-between md:py-14">
          {settings.footerMembershipTitle ? (
            <h2 className="max-w-[22ch] font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              {settings.footerMembershipTitle}
            </h2>
          ) : null}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {settings.footerMembershipLearnLabel ? (
              <Link
                href={learnHref}
                className="btn btn-outline whitespace-nowrap border-cocoa/40"
              >
                {settings.footerMembershipLearnLabel}
              </Link>
            ) : null}
            {/* Nomor WhatsApp belum diatur → tombol join disembunyikan. */}
            {settings.footerMembershipJoinLabel && joinHref ? (
              <a
                href={joinHref}
                data-wa-context="membership"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary whitespace-nowrap"
              >
                {settings.footerMembershipJoinLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}