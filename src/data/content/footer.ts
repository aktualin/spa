/**
 * Kolom footer mencerminkan navbar: Services = kolom dropdown Service Menu,
 * Corporate = kolom dropdown Corporate Wellness, About = item top-level
 * navbar + Contact. Tanpa tautan membership; email kolaborasi tetap pada
 * baris bawah footer (`footer-brand`), bukan sebagai item kolom.
 */
export const footerLinks = {
  Services: [
    { label: "Body Massage", href: "/menu#massage" },
    { label: "Chair Services", href: "/menu#massage" },
    { label: "Add Ons", href: "/menu#body" },
    { label: "All Day Spa Packages", href: "/menu#packages" },
  ],
  Corporate: [
    { label: "Corporate Wellness", href: "/corporate" },
    { label: "In-Office Program", href: "/corporate#in-office" },
    { label: "In-Spa Experience", href: "/corporate#in-spa" },
    { label: "Wellness Benefits", href: "/corporate#benefits" },
  ],
  About: [
    { label: "Our Story", href: "/our-story" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
};

export const footerTagline =
  "Powered by traditional healing wisdom and a high-touch philosophy, KAMA is out to change the wellness industry — one deep exhale at a time.";