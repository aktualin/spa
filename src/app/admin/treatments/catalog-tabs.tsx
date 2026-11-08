import Link from "next/link";

const TABS = [
  { key: "treatments", label: "Treatments", href: "/admin/treatments" },
  { key: "addons", label: "Add-on", href: "/admin/treatments/addons" },
  { key: "categories", label: "Kategori", href: "/admin/treatments/categories" },
  { key: "packages", label: "Packages", href: "/admin/treatments/packages" },
  { key: "prices", label: "Harga", href: "/admin/treatments/prices" },
] as const;

export type CatalogTabKey = (typeof TABS)[number]["key"];

/** Navigasi antarbagian katalog, dipasang di atas setiap halaman daftar. */
export function CatalogTabs({ active }: { active: CatalogTabKey }) {
  return (
    <nav aria-label="Bagian katalog" className="mb-6 flex flex-wrap gap-1 border-b border-neutral-200">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={`-mb-px border-b-2 px-3 py-2 text-sm ${
            tab.key === active
              ? "border-neutral-900 font-medium text-neutral-900"
              : "border-transparent text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
