import Link from "next/link";

import { listTiers } from "../actions/membership";
import { Badge, PageHeader, StatusBanners, primaryLinkClass } from "../promos/_kit/list-ui";

export const instant = false;

export default async function AdminMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [tiers, params] = await Promise.all([listTiers(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Membership"
        subtitle={`${tiers.length} tier membership.`}
        action={
          <Link href="/admin/membership/new" className={primaryLinkClass}>
            Tambah tier
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Tier membership dihapus."
      />

      <div className="mt-6">
        {tiers.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada tier membership.</p>
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
                      <Badge tone="green">Tayang</Badge>
                    ) : (
                      <Badge tone="muted">Draf</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    /{tier.slug} · {tier.benefits.length} benefit
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
