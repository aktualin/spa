import { membershipServices } from "../membership-services.ts";

/* ---------- Membership ---------- */

export const membership = {
  eyebrow: "Membership",
  title:
    "More than a membership — a holistic spa ritual woven into your everyday life.",
  intro:
    "Make every me-time moment count. Each month brings credit for one essential service, member prices across the menu, and offers reserved for KAMA members.",
  price: "Just Rp 1,500,000 a month.",
  benefits: [
    {
      title: "One essential service every month",
      body: "One treatment from our Essential Services list is included in your membership price. Enjoy it without a second thought.",
    },
    {
      title: "Additional services at member prices",
      body: "Every further essential service is available at a lighter member price, so upgrading your routine is always easy.",
    },
    {
      title: "Savings across the entire menu",
      body: "Enjoy member prices on every treatment, including All Day Spa packages and face rituals.",
    },
    {
      title: "10% off retail products",
      body: "Save on high-quality products for your at-home care routine.",
    },
  ],
  servicesIntro:
    "As a member, you gain exclusive access to KAMA's essential services — treatments tailored to your wellness needs.",
  services: membershipServices,
  plans: [
    {
      name: "Individual",
      price: "Rp 1,500,000",
      billed: "Billed monthly",
      note: "Our most popular choice, just for you.",
      features: [
        "One essential service every month, included in your membership price",
        "No long-term commitment",
        "Additional essential services at member prices",
        "Significant savings on every All Day Spa package",
        "Share your credit for an additional Rp 100,000",
        "10% off retail product purchases",
        "Rp 250,000 bonus when you refer a new member",
        "Birthday benefit: a free add-on worth up to Rp 250,000",
      ],
    },
    {
      name: "Family",
      price: "Rp 1,500,000",
      billed: "Billed monthly",
      note: "Everything in Individual, plus extras for the family.",
      features: [
        "All Individual plan benefits",
        "Member prices across the entire treatment menu",
        "One-time registration fee of Rp 290,000 for up to three family members",
        "Birthday benefits for every family member",
        "Farewell days and members-only events",
      ],
    },
    {
      name: "KAMA Team",
      price: "Custom",
      billed: "Tailored for companies",
      note: "Give your team a complete wellness life.",
      features: [
        "Membership for the whole team at special rates",
        "Priority booking and shared scheduling",
        "On-site wellness programs and shared team experiences",
        "Team wellness summaries for your company",
      ],
    },
  ],
};
