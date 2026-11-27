import Link from "next/link";

import { listPromos } from "../actions/promos";
import { Badge, PageHeader, StatusBanners, Thumb, primaryLinkClass } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";
import { promoStatus, promoStatusTone } from "./promo-status";

export const instant = false;

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [promos, params] = await Promise.all([listPromos(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Promos"
        subtitle={`${promos.length} promos listed.`}
        action={
          <Link href="/admin/promos/new" className={primaryLinkClass}>
            Add promo
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Promo deleted."
      />

      <div className="mt-6">
        {promos.length === 0 ? (
          <p className="text-sm text-neutral-500">No promos yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {promos.map((promo) => {
              const status = promoStatus(promo);
              return (
                <li
                  key={promo.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Thumb src={promo.bannerUrl} alt={promo.title} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/promos/${promo.id}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {promo.title}
                        </Link>
                        <Badge tone={promoStatusTone[status]}>{status}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        /{promo.slug} · {formatWibDate(promo.startDate)} –{" "}
                        {formatWibDate(promo.endDate)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-neutral-500">
                    Order {promo.sortOrder}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        Promos whose period has passed are automatically hidden from the public
        pages without needing manual deletion.
      </p>
    </div>
  );
}
