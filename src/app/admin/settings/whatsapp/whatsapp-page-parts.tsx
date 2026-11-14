import Link from "next/link";

import type { WHATSAPP_CONTEXTS } from "@/lib/domain/whatsapp-template";

import { seedWhatsAppTemplatesAction } from "../../actions/whatsapp-templates";

/** Nomor tujuan aktif, atau peringatan bila belum diatur. */
export function NumberNotice({ number }: { number: string }) {
  if (number) {
    return (
      <p className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
        Nomor tujuan: <strong>+{number}</strong> (dari Kontak &amp; Umum).
      </p>
    );
  }
  return (
    <p
      role="status"
      className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
    >
      Nomor WhatsApp belum diatur (atau tidak valid) di Kontak &amp; Umum.
      Semua tombol WhatsApp di situs disembunyikan sampai nomor diisi.{" "}
      <Link href="/admin/settings/contact" className="font-medium underline">
        Isi nomor di Kontak &amp; Umum
      </Link>
      .
    </p>
  );
}

/** Pemberitahuan hasil seed template bawaan. */
export function SeededNote({ seeded }: { seeded?: string }) {
  if (seeded === undefined) return null;
  return (
    <p
      role="status"
      className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
    >
      {Number(seeded) > 0
        ? `${seeded} template bawaan ditambahkan.`
        : "Semua template bawaan sudah ada."}
    </p>
  );
}

/** Form tambah template bawaan untuk konteks yang belum tersimpan. */
export function SeedMissingForm({
  missing,
}: {
  missing: (typeof WHATSAPP_CONTEXTS)[number][];
}) {
  if (missing.length === 0) return null;
  return (
    <form
      action={seedWhatsAppTemplatesAction}
      className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p>
        Belum tersimpan: {missing.map((context) => context.label).join(", ")}.
        Selama belum disimpan, website memakai teks bawaan.
      </p>
      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Tambahkan template bawaan
      </button>
    </form>
  );
}