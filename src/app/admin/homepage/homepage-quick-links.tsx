import Link from "next/link";

/** Tautan cepat ke sub-modul homepage dari halaman Section Homepage. */
export function HomepageQuickLinks() {
  const links = [
    { href: "/admin/homepage/hero", label: "Manage Hero slides →" },
    { href: "/admin/homepage/highlights", label: "Manage “What’s New” highlights →" },
    { href: "/admin/homepage/stats", label: "Brand Intro stats →" },
    { href: "/admin/homepage/instagram", label: "Feed Instagram →" },
    { href: "/admin/our-story", label: "Edit Our Story →" },
  ];
  return (
    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          {link.label}
        </Link>
      ))}
    </p>
  );
}