import { requireRole } from "@/lib/auth";
import { STAT_LIMITS } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  importDefaultStatsAction,
  listHomepageStats,
  moveHomepageStatAction,
  toggleHomepageStatAction,
} from "../../actions/homepage-content";
import { ContentList } from "../_components/content-list";

export const instant = false;

export default async function AdminHomepageStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const [stats, params] = await Promise.all([listHomepageStats(), searchParams]);

  return (
    <ContentList
      title="Statistik Brand Intro"
      subtitle="Kotak angka “KAMA at a glance” di section Brand Intro. Urutan di daftar ini sama dengan urutan di homepage."
      basePath="/admin/homepage/stats"
      addLabel="Tambah statistik"
      addDisabledNote={
        stats.length >= STAT_LIMITS.max ? `Maksimal ${STAT_LIMITS.max} statistik.` : null
      }
      rows={stats.map((s) => ({
        id: s.id,
        title: `${s.value} — ${s.label}`,
        meta: "Brand Intro",
        isPublished: s.isPublished,
      }))}
      saved={params.saved}
      deleted={params.deleted}
      deletedLabel="Statistik dihapus."
      emptyNote={
        <>
          <p>
            Belum ada statistik. Saat ini Brand Intro menampilkan 3 statistik bawaan situs.
            Begitu statistik pertama disimpan, statistik bawaan{" "}
            <strong>diganti seluruhnya</strong> oleh daftar ini.
          </p>
          <p>Agar tampilan tidak berubah, salin dulu statistik bawaan, lalu ubah sesuai kebutuhan.</p>
        </>
      }
      importLabel="Salin statistik bawaan"
      importAction={importDefaultStatsAction}
      noLiveNote="Tidak ada statistik yang tayang, jadi kotak angka di Brand Intro kosong. Terbitkan minimal satu statistik."
      footnote="Tata letak berupa 3 kolom, jadi kelipatan 3 paling rapi. Seluruh section Brand Intro bisa disembunyikan dari halaman Section Homepage."
      toggleAction={toggleHomepageStatAction}
      moveAction={moveHomepageStatAction}
    />
  );
}
