import { asset } from "../../lib/asset-url.ts";

/* ---------- Home content ---------- */

export const heroStats = [
  { value: "12", label: "years of care" },
  { value: "40+", label: "signature treatments" },
  { value: "3", label: "Jakarta locations" },
];

export const journalPosts = [
  {
    kind: "treatment",
    slug: "javanese-massage-roots",
    href: "/menu#massage",
    tag: "Massage",
    title: "The Roots of Javanese Healing: Sukma Laya",
    excerpt:
      "Discover the ancient rhythm of Javanese massage — deep rhythmic pressure, acupressure, and a philosophy of restoring the body's natural balance.",
    image: asset("img/kama/corporate/11-footwash.jpg"),
  },
  {
    kind: "treatment",
    slug: "corporate-wellness-jakarta",
    href: "/corporate",
    tag: "Corporate",
    title: "Wellness at Work: A Guide to Corporate Wellness in Jakarta",
    excerpt:
      "Employee wellness is no longer just a benefit. Here is how leading teams in Jakarta build engagement, focus, and retention through meaningful reset experiences.",
    image: asset("img/kama/corporate/10-inoffice-massage.jpg"),
  },
  {
    kind: "treatment",
    slug: "pre-wedding-ritual",
    href: "/menu#packages",
    tag: "Package",
    title: "Karuna: A Soulful Pre-Wedding Journey",
    excerpt:
      "A four-hour ritual designed to comfort the body, calm the mind, and illuminate the inner glow of every bride-to-be.",
    image: asset("img/kama/06-bride.jpg"),
  },
];
