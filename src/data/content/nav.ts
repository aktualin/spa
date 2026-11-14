import { megaGroups } from "./nav-mega-groups.ts";
import type { NavMegaGroup, NavPrimaryItem } from "./nav-types.ts";

export const nav: {
  primary: NavPrimaryItem[];
  bookNow: string;
  megaGroups: Record<string, NavMegaGroup>;
} = {
  /**
   * Header order matters: the dropdown groups come first, the plain links
   * after. `mega` points at a key in `nav.megaGroups`.
   */
  primary: [
    { label: "Menu", href: "/menu", mega: "services" },
    { label: "Corporate Wellness", href: "/corporate", mega: "corporate" },
    { label: "Contact", href: "/contact" },
    {
      label: "Service Menu",
      href: "https://drive.google.com/file/d/1UfW-JFOno47KCLi-PwID4XdrCDHkwIfc/view?usp=sharing",
      external: true,
    },
  ],
  bookNow: "Book Now",
  megaGroups,
};