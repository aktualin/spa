import Link from "next/link";

import type { listCorporateInquiries } from "../../actions/corporate";
import { listHref } from "./inquiries-list";

const FILTERS = [
  { value: undefined, label: "Semua" },
  { value: "NEW", label: "Baru" },
  { value: "CONTACTED", label: "Sudah dihubungi" },
  { value: "CLOSED", label: "Ditutup" },
] as const;

type InquiryData = Awaited<ReturnType<typeof listCorporateInquiries>>;

/** Tab filter status inquiry dengan jumlah per status. */
export function InquiryFilters({
  status,
  countByStatus,
}: {
  status: InquiryData["status"];
  countByStatus: InquiryData["countByStatus"];
}) {
  return (
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
  );
}