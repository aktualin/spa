import Link from "next/link";

import { Badge, StatusBanner } from "../../settings/_components/form-ui";
import { InquiryList } from "./inquiry-list";
import { listCorporateInquiries } from "../../actions/corporate";

export const instant = false;

const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Sudah dihubungi",
  CLOSED: "Ditutup",
};

export default async function AdminCorporateInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; status?: string }>;
}) {
  const params = await searchParams;
  const inquiries = await listCorporateInquiries(params.status);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Inquiry Corporate Wellness
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {inquiries.length} inquiry. Data ini mengandung informasi pribadi
            (UU PDP) — jangan dibagikan di luar tim.
          </p>
        </div>
        <Link
          href="/admin/corporate"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Kembali ke konten
        </Link>
      </div>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        savedText="Status inquiry diperbarui."
        deletedText="Inquiry dihapus."
      />

      <nav className="mt-6 flex flex-wrap gap-2">
        <FilterLink href="/admin/corporate/inquiries" active={!params.status}>
          Semua
        </FilterLink>
        <FilterLink
          href="/admin/corporate/inquiries?status=NEW"
          active={params.status === "NEW"}
        >
          Baru
        </FilterLink>
        <FilterLink
          href="/admin/corporate/inquiries?status=CONTACTED"
          active={params.status === "CONTACTED"}
        >
          Sudah dihubungi
        </FilterLink>
        <FilterLink
          href="/admin/corporate/inquiries?status=CLOSED"
          active={params.status === "CLOSED"}
        >
          Ditutup
        </FilterLink>
      </nav>

      {inquiries.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Belum ada inquiry pada filter ini.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">
                    {inquiry.name}
                    {inquiry.company ? (
                      <span className="font-normal text-neutral-600">
                        {" "}
                        · {inquiry.company}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {inquiry.email}
                    {inquiry.phone ? ` · ${inquiry.phone}` : ""} ·{" "}
                    {formatWaktu(inquiry.createdAt)}
                  </p>
                </div>
                <Badge
                  tone={
                    inquiry.status === "NEW"
                      ? "warn"
                      : inquiry.status === "CLOSED"
                        ? "muted"
                        : "default"
                  }
                >
                  {STATUS_LABEL[inquiry.status] ?? inquiry.status}
                </Badge>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
                {inquiry.message}
              </p>
              {inquiry.notes ? (
                <p className="mt-2 text-xs text-neutral-500">
                  Catatan: {inquiry.notes}
                </p>
              ) : null}
              <InquiryList inquiryId={inquiry.id} status={inquiry.status} notes={inquiry.notes ?? ""} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Format tanggal Indonesia tanpa `new Date()` (aman untuk cacheComponents). */
function formatWaktu(value: Date): string {
  const iso = value.toISOString();
  const tanggal = iso.slice(0, 10).split("-").reverse().join("/");
  const jam = iso.slice(11, 16);
  return `${tanggal} ${jam} WIB`;
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white"
          : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
      }
    >
      {children}
    </Link>
  );
}
