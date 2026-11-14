import { ArrowRight, Check } from "@/components/icons";
import { RichText } from "@/components/rich-text";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { membershipPriceText, type MembershipTier } from "@/lib/content/membership";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { sanitizeHtml } from "@/lib/domain/sanitize";

/** Kartu tier membership di halaman promo — harga, benefit, terms, join. */
export function MembershipTierCard({
  tier,
  memberHref,
  pageCopy,
}: {
  tier: MembershipTier;
  memberHref: string | null;
  pageCopy: PageCopy;
}) {
  return (
    <li className="flex h-full flex-col bg-cream-card p-6">
      <div className="flex flex-col gap-2">
        <span className="eyebrow text-cocoa/60">{tier.name}</span>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-title md:text-[1.75rem]">
            {membershipPriceText(tier)}
          </span>
          {tier.billingNote ? (
            <span className="caption-s text-cocoa/60">
              {tier.billingNote}
            </span>
          ) : null}
        </div>
        {tier.summary ? (
          <RichText value={tier.summary} className="text-body text-cocoa/70" />
        ) : null}
      </div>

      {tier.benefits.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-2">
          {tier.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-body">
              <span className="mt-1 shrink-0">
                <Check className="h-4 w-4" />
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {tier.terms ? (
        <div
          className="kama-prose mt-5 border-t border-cocoa/15 pt-4 text-body text-cocoa/70"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(plainTextToHtml(tier.terms)) }}
        />
      ) : null}

      {memberHref ? (
        <a
          href={memberHref}
          data-wa-context="membership"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline mt-6 border-cocoa/40"
        >
          {copy(pageCopy, "promos.membership.join_now_label")}
          <ArrowRight className="h-4 w-4" />
        </a>
      ) : null}
    </li>
  );
}