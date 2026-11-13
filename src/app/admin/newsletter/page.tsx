import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { canSendNewsletterCampaign, listNewsletterCampaigns } from "../actions/newsletter";
import { Badge, PageHeader, primaryLinkClass, StatusBanners } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { SendCampaignButton } from "./send-campaign-button";

export const instant = false;

const FILTERS = [
  { value: undefined, label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENDING", label: "Mengirim" },
  { value: "SENT", label: "Terkirim" },
  { value: "FAILED", label: "Gagal" },
] as const;

const statusTone = {
  DRAFT: "muted",
  SENDING: "blue",
  SENT: "green",
  FAILED: "red",
} as const;

function listHref(status: string | null | undefined, page = 1): string {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return `/admin/newsletter${qs ? `?${qs}` : ""}`;
}

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; status?: string; page?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const [{ rows, total, page, pageCount, status, countByStatus }, canSend] = await Promise.all([
    listNewsletterCampaigns({ status: params.status, page: params.page }),
    canSendNewsletterCampaign(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Newsletter"
        subtitle={`${total} kampanye${status ? " pada filter ini" : ""}.`}
        action={
          <div className="flex gap-2">
            <Link
              href="/admin/newsletter/subscribers"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Subscriber
            </Link>
            <Link href="/admin/newsletter/settings" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50">
              Pengaturan
            </Link>
            <Link href="/admin/newsletter/new" className={primaryLinkClass}>
              Tulis kampanye
            </Link>
          </div>
        }
      />

      <StatusBanners saved={params.saved} deleted={params.deleted} deletedLabel="Kampanye dihapus." />

      <nav aria-label="Filter status" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (filter.value ?? null) === status;
          const count = filter.value ? countByStatus[filter.value] : null;
          return (
            <Link
              key={filter.label}
              href={listHref(filter.value)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white"
                  : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
              }
            >
              {filter.label}
              {count !== null ? ` (${count})` : ""}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Belum ada kampanye pada filter ini.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((campaign) => (
            <li key={campaign.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <Link href={`/admin/newsletter/${campaign.id}`} className="min-w-0 flex-1 hover:underline">
                <p className="font-medium text-neutral-900">{campaign.subject}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {formatWibDateTime(campaign.createdAt)}
                  {campaign.status !== "DRAFT"
                    ? ` · ${campaign.successCount}/${campaign.recipientCount} terkirim`
                    : ""}
                </p>
              </Link>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone[campaign.status]}>{campaign.status}</Badge>
                {canSend && campaign.status === "DRAFT" ? (
                  <SendCampaignButton campaignId={campaign.id} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 ? (
        <nav aria-label="Halaman" className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={listHref(status, page - 1)} className="text-neutral-700 hover:underline">
              ← Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-neutral-500">
            Halaman {page} dari {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={listHref(status, page + 1)} className="text-neutral-700 hover:underline">
              Berikutnya →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
