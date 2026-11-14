import Link from "next/link";

import type { listCorporateInquiries } from "../../actions/corporate";
import { formatWibDateTime } from "../../promos/_kit/schema";
import { EmailStatusBadge, InquiryStatusBadge } from "./status-badges";

export function listHref(status: string | null | undefined, page = 1): string {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return `/admin/corporate/inquiries${qs ? `?${qs}` : ""}`;
}

type InquiryData = Awaited<ReturnType<typeof listCorporateInquiries>>;

/** Daftar inquiry ringkas (nama, perusahaan, tanggal, status email & inquiry). */
export function InquiryList({ rows }: { rows: InquiryData["rows"] }) {
  if (rows.length === 0) {
    return <p className="mt-6 text-sm text-neutral-500">Belum ada inquiry pada filter ini.</p>;
  }
  return (
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
  );
}

/** Navigasi halaman sebelumnya/berikutnya. */
export function InquiryPagination({
  page,
  pageCount,
  status,
}: {
  page: number;
  pageCount: number;
  status: InquiryData["status"];
}) {
  if (pageCount <= 1) return null;
  return (
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
  );
}