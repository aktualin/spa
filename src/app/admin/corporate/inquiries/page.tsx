import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listCorporateInquiries } from "../../actions/corporate";
import { formatWibDateTime } from "../../promos/_kit/schema";
import { Badge, PageHeader, StatusBanners } from "../../promos/_kit/list-ui";
import { EmailStatusBadge, InquiryStatusBadge } from "./status-badges";

export const instant = false;

const FILTERS = [
  { value: undefined, label: "Semua" },
  { value: "NEW", label: "Baru" },
  { value: "CONTACTED", label: "Sudah dihubungi" },
  { value: "CLOSED", label: "Ditutup" },
] as const;

function listHref(status: string | null | undefined, page = 1): string {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return `/admin/corporate/inquiries${qs ? `?${qs}` : ""}`;
}

export default async function AdminCorporateInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; status?: string; page?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const { rows, total, page, pageCount, status, countByStatus } = await listCorporateInquiries({
    status: params.status,
    page: params.page,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Inquiry Corporate Wellness"
        subtitle={
          <>
            {total} inquiry{status ? " pada filter ini" : ""}. Data ini memuat informasi pribadi
            (UU PDP) — hanya untuk tim, jangan dibagikan atau disalin ke luar dashboard.
          </>
        }
        action={
          <Link
            href="/admin/corporate"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Kembali ke Corporate
          </Link>
        }
      />

      <StatusBanners deleted={params.deleted} deletedLabel="Inquiry dihapus." />

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
        <p className="mt-6 text-sm text-neutral-500">Belum ada inquiry pada filter ini.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((inquiry) => (
            <li key={inquiry.id}>
              <Link
                href={`/admin/corporate/inquiries/${inquiry.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">
                    {inquiry.name}
                    {inquiry.company ? (
                      <span className="font-normal text-neutral-600"> · {inquiry.company}</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {formatWibDateTime(inquiry.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <EmailStatusBadge sentAt={inquiry.emailSentAt} error={inquiry.emailError} />
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
              </Link>
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

      <p className="mt-6 text-xs text-neutral-500">
        <Badge tone="muted">Info</Badge> Ekspor massal sengaja tidak disediakan untuk melindungi
        data pribadi pengirim.
      </p>
    </div>
  );
}
