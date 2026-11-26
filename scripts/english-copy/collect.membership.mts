/** Copy membership: program, tier (match sortOrder agar rename slug terpair), gift card. */
import { membership as homeMembership } from "../../src/data/content.ts";
import { membership as pageMembership } from "../../src/data/pages.ts";
import { staticMembershipProgram } from "../../src/lib/domain/membership.ts";
import { staticGiftCard } from "../../src/lib/domain/gift-card.ts";
import { slugify } from "../../src/lib/domain/slug.ts";
import { row, type CopyRow } from "./collect.types.mts";

export function membershipProgram(): CopyRow[] {
  const p = staticMembershipProgram();
  return [row("MembershipProgram", { id: "singleton" }, {
    eyebrow: p.eyebrow,
    title: p.title,
    intro: p.intro,
    priceHeadline: p.priceHeadline,
    bannerBody: p.bannerBody,
    bannerCtaLabel: homeMembership.cta,
    bannerCtaHref: homeMembership.href,
    servicesIntro: p.servicesIntro,
    termsHtml: p.termsHtml,
    benefits: p.benefits,
    services: p.services,
  })];
}

export function membershipTiers(): CopyRow[] {
  return pageMembership.plans.map((plan, i) =>
    row("MembershipTier", { sortOrder: i }, {
      slug: slugify(plan.name),
      name: plan.name,
      priceLabel: plan.price,
      billingNote: plan.billed,
      summary: plan.note,
      benefits: plan.features,
    }),
  );
}

export function giftCard(): CopyRow[] {
  const g = staticGiftCard();
  return [row("GiftCardInfo", { id: "singleton" }, {
    title: g.title,
    subtitle: g.subtitle,
    bodyHtml: g.bodyHtml,
    termsHtml: g.termsHtml,
    whatsappMessage: g.whatsappMessage,
  })];
}
