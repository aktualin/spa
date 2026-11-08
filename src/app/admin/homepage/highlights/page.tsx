import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { highlightStatus, type HighlightStatus } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  importDefaultHighlightsAction,
  listHomepageHighlights,
  moveHomepageHighlightAction,
  toggleHomepageHighlightAction,
} from "../../actions/homepage-highlights";
import { SmallSubmit } from "../../promos/_kit/form-ui";
import {
  Badge,
  PageHeader,
  StatusBanners,
  Thumb,
  primaryLinkClass,
  type BadgeTone,
} from "../../promos/_kit/list-ui";
import { formatWibDate } from "../../promos/_kit/schema";

export const instant = false;

const STATUS_TONE: Record<HighlightStatus, BadgeTone> = {
  Draf: "muted",
  Terjadwal: "blue",
  Berakhir: "red",
  Tayang: "green",
};

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
  const rows = highlights.map((highlight) => ({
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

      {rows.length === 0 ? (
        <div className="mt-6 space-y-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            Belum ada highlight. Saat ini “What’s New” menampilkan 3 kartu
            bawaan situs. Begitu highlight pertama disimpan, kartu bawaan
            <strong> diganti seluruhnya</strong> oleh highlight dari daftar ini.
          </p>
          <p>
            Agar tampilan tidak berubah, salin dulu 3 kartu bawaan menjadi
            highlight, lalu ubah/tambah sesuai kebutuhan.
          </p>
          <form action={importDefaultHighlightsAction}>
            <SmallSubmit>Salin 3 kartu bawaan</SmallSubmit>
          </form>
        </div>
      ) : liveCount === 0 ? (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tidak ada highlight yang sedang tayang, jadi section “What’s New”
          tampil tanpa kartu. Terbitkan minimal satu highlight, atau matikan
          section “What’s New” di halaman Section Homepage.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Thumb src={row.imageUrl} alt={row.imageAlt ?? ""} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/homepage/highlights/${row.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {row.title}
                    </Link>
                    <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {row.eyebrow ? `${row.eyebrow} · ` : ""}
                    {row.href ?? "tanpa tautan"}
                    {row.startDate || row.endDate
                      ? ` · ${formatWibDate(row.startDate)} – ${formatWibDate(row.endDate)}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <form action={toggleHomepageHighlightAction}>
                  <input type="hidden" name="id" value={row.id} />
                  {/* Nilai = status yang diinginkan setelah tombol ditekan. */}
                  <input
                    type="hidden"
                    name="isPublished"
                    value={row.isPublished ? "0" : "1"}
                  />
                  <SmallSubmit
                    title={row.isPublished ? "Jadikan draf" : "Terbitkan"}
                  >
                    {row.isPublished ? "Jadikan draf" : "Terbitkan"}
                  </SmallSubmit>
                </form>
                <form action={moveHomepageHighlightAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SmallSubmit title="Naikkan" disabled={index === 0}>
                    ↑
                  </SmallSubmit>
                </form>
                <form action={moveHomepageHighlightAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SmallSubmit title="Turunkan" disabled={index === rows.length - 1}>
                    ↓
                  </SmallSubmit>
                </form>
              </div>
            </li>
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
