/**
 * Asal konten section non-banner. Section ini tidak memakai isian teks/gambar
 * `HomepageSection` (hanya tampil/sembunyi & urutan), jadi admin diarahkan
 * ke tempat kontennya diatur.
 */
export const SECTION_SOURCE: Record<
  string,
  { text: string; link?: { href: string; label: string } }
> = {
  "whats-new": {
    text: "The “What’s New” cards are managed in Homepage Highlights (image, label, title, link, display period). The section title, description, and button are filled in below — parts left empty are not shown on the homepage.",
    link: { href: "/admin/homepage/highlights", label: "Manage highlights" },
  },
  "brand-intro": {
    text: "The “KAMA at a glance” number boxes are managed in Brand Intro stats. The full brand story is managed on the Our Story page.",
    link: { href: "/admin/homepage/stats", label: "Manage stats" },
  },
  "signature-treatments": {
    text: "Shows up to 6 treatments marked as best seller in the Treatments module. The section is hidden while there are none.",
    link: { href: "/admin/treatments", label: "Open Treatments" },
  },
  "promo-highlight": {
    text: "Shows the first active promo from the Promos module; if there is none, the nearest event from the Events module.",
    link: { href: "/admin/promos", label: "Open Promos" },
  },
  "gallery-teaser": {
    text: "Shows photos from the Gallery module (or the Instagram feed when a token is available).",
    link: { href: "/admin/gallery", label: "Open Gallery" },
  },
  footer: {
    text: "The footer content applies site-wide. This switch only hides the footer ON THE HOMEPAGE — other pages still show the footer. When the homepage footer is turned off, the call-to-action button in What’s New is hidden too, because its destination is in the footer. The footer is always at the very bottom, so it is not part of the ordering.",
  },
};