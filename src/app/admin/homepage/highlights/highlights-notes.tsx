import { importDefaultHighlightsAction } from "../../actions/homepage-highlights";
import { SmallSubmit } from "../../promos/_kit/form-ui";
import type { HighlightRow } from "./highlights-list";

/** Catatan saat belum ada highlight / tidak ada yang tayang. */
export function HighlightNotes({ rows, liveCount }: { rows: HighlightRow[]; liveCount: number }) {
  if (rows.length === 0) {
    return (
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
    );
  }
  if (liveCount === 0) {
    return (
      <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Tidak ada highlight yang sedang tayang, jadi section “What’s New”
        tampil tanpa kartu. Terbitkan minimal satu highlight, atau matikan
        section “What’s New” di halaman Section Homepage.
      </p>
    );
  }
  return null;
}