import Link from "next/link";

import type { NavLink } from "@/data/content";

const linkClass =
  "text-caption text-cream-soft/85 transition-colors hover:text-white";

/** Grup tautan footer; tautan eksternal/protokol khusus memakai `<a>`. */
export function FooterLinks({
  groups,
}: {
  groups: Record<string, NavLink[]>;
}) {
  return (
    <div className="lg:col-span-7">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 xl:grid-cols-5">
        {Object.entries(groups).map(([group, links]) => (
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
                      className={linkClass}
                    >
                      {link.label}
                    </a>
                  ) : /^(mailto:|tel:|https?:)/.test(link.href) ? (
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={linkClass}>
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
  );
}