import { asset } from "../../lib/asset-url.ts";
import type { NavMegaGroup } from "./nav-types.ts";

export const megaGroups: Record<string, NavMegaGroup> = {
  services: {
    id: "services",
    label: "Service Menu",
    panel: "narrow",
    columns: [
      {
        title: "Layanan",
        links: [
          { label: "Body Massage", href: "/menu#massage" },
          { label: "Chair Services", href: "/menu#massage" },
          { label: "Add Ons", href: "/menu#body" },
          { label: "All Day Spa Packages", href: "/menu#packages" },
          { label: "Loyalty Member", href: "/membership" },
        ],
      },
    ],
    highlights: [
      {
        image: asset("img/kama/03-oil-bowl.jpg"),
        badge: "new",
        eyebrow: "Just Rp 1.5jt a month",
        label: "Join KAMA Now",
        href: "/membership",
      },
    ],
    footerLink: { label: "Lihat semua treatment", href: "/menu" },
  },
  corporate: {
    id: "corporate",
    label: "Corporate Wellness",
    panel: "narrow",
    columns: [
      {
        title: "Corporate",
        links: [
          { label: "Corporate Wellness", href: "/corporate" },
          { label: "In-Office Program", href: "/corporate#in-office" },
          { label: "In-Spa Experience", href: "/corporate#in-spa" },
          { label: "Wellness Benefits", href: "/corporate#benefits" },
        ],
      },
    ],
    highlights: [
      {
        image: asset("img/kama/05-foot-bath.jpg"),
        badge: "new",
        eyebrow: "Wellness at work",
        label: "In-Office Program",
        href: "/corporate#in-office",
      },
      {
        image: asset("img/kama/corporate/05-lounge.jpg"),
        badge: "team",
        eyebrow: "Bring your team",
        label: "In-Spa Experience",
        href: "/corporate#in-spa",
      },
    ],
    footerLink: { label: "Lihat program corporate", href: "/corporate" },
  },
};