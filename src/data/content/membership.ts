import { membershipServices } from "../membership-services.ts";

export type MembershipService = {
  name: string;
  description: string;
};

export type MembershipData = {
  eyebrow: string;
  title: string;
  price: string;
  body: string;
  cta: string;
  href: string;
  servicesIntro: string;
  services: MembershipService[];
};

export const membership: MembershipData = {
  eyebrow: "membership",
  title: "KAMA Membership.",
  price: "Just Rp 1.5jt a month.",
  body: "Make sure your me-time is always accounted for. You get a credit for one essential service a month, lower prices, special offers, and more.",
  cta: "Join KAMA Now",
  href: "/membership",
  servicesIntro: "Your monthly credit can be used for any of these essential services:",
  services: membershipServices,
};