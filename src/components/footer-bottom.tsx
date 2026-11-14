import Link from "next/link";

import { CopyrightYear } from "./copyright-year";

/** Baris paling bawah: copyright + tautan privacy & terms. */
export function FooterBottom({
  copyright,
  privacyLabel,
  privacyHref,
  termsLabel,
  termsHref,
}: {
  copyright: string;
  privacyLabel: string;
  privacyHref: string;
  termsLabel: string;
  termsHref: string;
}) {
  return (
    <section className="border-t border-cocoa/20 bg-cocoa text-cream-soft">
      <div className="container-kama">
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-caption text-cream-soft/70">
            <CopyrightYear text={copyright} />
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            {privacyLabel ? (
              <Link
                href={privacyHref}
                className="text-caption text-cream-soft/70 transition-colors hover:text-white"
              >
                {privacyLabel}
              </Link>
            ) : null}
            {termsLabel ? (
              <Link
                href={termsHref}
                className="text-caption text-cream-soft/70 transition-colors hover:text-white"
              >
                {termsLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}