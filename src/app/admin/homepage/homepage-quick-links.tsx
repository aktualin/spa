import Link from "next/link";

/** Tautan cepat ke sub-modul homepage dari halaman Section Homepage. */
export function HomepageQuickLinks() {
  const links = [
    { href: "/admin/homepage/hero", label: "Kelola slide Hero →" },
    { href: "/admin/homepage/highlights", label: "Kelola highlight “What’s New” →" },
    { href: "/admin/homepage/stats", label: "Statistik Brand Intro →" },
    { href: "/admin/homepage/reviews", label: "Ulasan →" },
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