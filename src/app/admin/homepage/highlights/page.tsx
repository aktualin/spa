import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { highlightStatus } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listHomepageHighlights } from "../../actions/homepage-highlights";
import { PageHeader, StatusBanners, primaryLinkClass } from "../../promos/_kit/list-ui";
import { HighlightListItem, type HighlightRow } from "./highlights-list";
import { HighlightNotes } from "./highlights-notes";

export const instant = false;

export default async function AdminHomepageHighlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [highlights, params] = await Promise.all([
    listHomepageHighlights(),
    searchParams,
  ]);

  const now = new Date();
  const rows: HighlightRow[] = highlights.map((highlight) => ({
    ...highlight,
    status: highlightStatus(highlight, now),
  }));
  const liveCount = rows.filter((row) => row.status === "Tayang").length;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/homepage" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Section Homepage
      </Link>

      <div className="mt-3">
        <PageHeader
          title="Highlight Homepage"
          subtitle="Kartu di section “What’s New” homepage. Urutan di daftar ini sama dengan urutan kartu di homepage."
          action={
            <Link href="/admin/homepage/highlights/new" className={primaryLinkClass}>
              Tambah highlight
            </Link>
          }
        />
      </div>

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Highlight dihapus."
      />

      <HighlightNotes rows={rows} liveCount={liveCount} />

      {rows.length > 0 ? (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((row, index) => (
            <HighlightListItem key={row.id} row={row} index={index} count={rows.length} />
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs text-neutral-500">
        Highlight dengan periode otomatis muncul saat tanggal mulai tiba dan
        hilang setelah tanggal berakhir (perubahan terlihat di homepage dalam
        beberapa menit). Section “What’s New” bisa disembunyikan seluruhnya
        dari halaman Section Homepage.
      </p>
    </div>
  );
}