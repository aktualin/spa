import Link from "next/link";

import { getProgram, listTiers } from "../actions/membership";
import { Badge, PageHeader, StatusBanners, primaryLinkClass } from "../promos/_kit/list-ui";

export const instant = false;

export default async function AdminMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [tiers, program, params] = await Promise.all([
    listTiers(),
    getProgram(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Membership"
        subtitle={`${tiers.length} membership tiers.`}
        action={
          <Link href="/admin/membership/new" className={primaryLinkClass}>
            Add tier
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Membership tier deleted."
      />

      <Link
        href="/admin/membership/program"
        className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:bg-neutral-50"
      >
        <div>
          <p className="font-medium text-neutral-900">Membership program</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Title, intro, pricing sentence, main benefits, essential services, and T&amp;C
            of the /membership page — including the membership banner text on the homepage.
            {program ? "" : " Never saved (using the default text)."}
          </p>
        </div>
        <span className="text-sm text-neutral-600">Edit →</span>
      </Link>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Tiers / packages
      </h2>

      <div className="mt-3">
        {tiers.length === 0 ? (
          <p className="text-sm text-neutral-500">No membership tiers yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {tiers.map((tier) => (
              <li
                key={tier.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/membership/${tier.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {tier.name}
                    </Link>
                    {tier.isPublished ? (
                      <Badge tone="green">Published</Badge>
                    ) : (
                      <Badge tone="muted">Draft</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    /{tier.slug} · {tier.benefits.length} benefits
                  </p>
                </div>

                <p className="text-sm text-neutral-600">
                  {tier.priceLabel}
                  {tier.billingNote ? ` · ${tier.billingNote}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
