import { megaGroups } from "./nav-mega-groups.ts";
import type { NavMegaGroup, NavPrimaryItem } from "./nav-types.ts";

export const nav: {
  primary: NavPrimaryItem[];
  bookNow: string;
  megaGroups: Record<string, NavMegaGroup>;
} = {
  /**
   * Header order (seed blueprint; runtime is DB-driven via MenuItem).
   * `mega` points at a key in `nav.megaGroups`. Book Now is a separate CTA
   * from SiteSettings, not a primary item.
   */
  primary: [
    { label: "Our Story", href: "/our-story" },
    { label: "Service Menu", href: "/menu", mega: "services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Corporate Wellness", href: "/corporate", mega: "corporate" },
  ],
  bookNow: "Book Now",
  megaGroups,
};