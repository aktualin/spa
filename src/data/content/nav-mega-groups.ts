import { asset } from "../../lib/asset-url.ts";
import type { NavMegaGroup } from "./nav-types.ts";

export const megaGroups: Record<string, NavMegaGroup> = {
  services: {
    id: "services",
    label: "Menu",
    panel: "wide",
    columns: [
      {
        title: "Treatments",
        links: [
          { label: "Massage", href: "/menu#massage" },
          { label: "Body & Scrub", href: "/menu#body" },
          { label: "Face Ritual", href: "/menu#face" },
          { label: "Head & Scalp", href: "/menu#head" },
          { label: "Bath Ritual", href: "/menu#bath" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "All Day Spa Packages", href: "/menu#packages" },
          { label: "Membership", href: "/membership" },
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
      {
        image: asset("img/kama/06-bride.jpg"),
        badge: "new",
        eyebrow: "2 – 4 hour rituals",
        label: "All Day Spa",
        href: "/menu#packages",
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