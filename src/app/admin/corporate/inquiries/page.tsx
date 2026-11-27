import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listCorporateInquiries } from "../../actions/corporate";
import { Badge, PageHeader, StatusBanners } from "../../promos/_kit/list-ui";
import { InquiryFilters } from "./inquiries-filters";
import { InquiryList, InquiryPagination } from "./inquiries-list";

export const instant = false;

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
        title="Corporate Wellness Inquiries"
        subtitle={
          <>
            {total} inquiries{status ? " under this filter" : ""}. This data contains personal
            information (PDP Law) — for the team only; do not share or copy it outside the dashboard.
          </>
        }
        action={
          <Link
            href="/admin/corporate"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Back to Corporate
          </Link>
        }
      />

      <StatusBanners deleted={params.deleted} deletedLabel="Inquiry deleted." />

      <InquiryFilters status={status} countByStatus={countByStatus} />

      <InquiryList rows={rows} />

      <InquiryPagination page={page} pageCount={pageCount} status={status} />

      <p className="mt-6 text-xs text-neutral-500">
        <Badge tone="muted">Info</Badge> Bulk export is deliberately not provided in order to
        protect senders' personal data.
      </p>
    </div>
  );
}