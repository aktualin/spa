import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { copy, getPageCopy } from "@/lib/content/page-copy";

import { PreviewReceiver } from "./preview-receiver";

export const metadata: Metadata = {
  title: "Pratinjau halaman — KAMA Spa",
  robots: { index: false, follow: false },
};

// Membaca cookie sesi — tidak pernah statis.
export const instant = false;

/**
 * Route pratinjau untuk split-view editor /admin/pages. Dirender di dalam
 * iframe pada panel kanan editor; konten draft (belum tersimpan) dikirim
 * editor via postMessage dan dirender PreviewReceiver dengan markup + CSS
 * halaman publik yang sama (tanpa Navigation/Footer). Path dua segmen agar
 * tidak ditangkap catch-all /[slug]; analitik & robots mengecualikan /preview.
 */
export default async function PagePreviewRoute() {
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/admin/pages");

  const pageCopy = await getPageCopy();

  return (
    <main data-page-preview>
      {/* Tombol WhatsApp mengambang dari layout induk bukan bagian isi halaman
          — sembunyikan selama pratinjau. */}
      <style>{".kama-whatsapp-fab{display:none!important}"}</style>
      <PreviewReceiver
        eyebrow={copy(pageCopy, "pages.header_eyebrow")}
        emptyBody={copy(pageCopy, "pages.empty_body")}
        updatedLabel={copy(pageCopy, "pages.updated_label")}
      />
    </main>
  );
}
