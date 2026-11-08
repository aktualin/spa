import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  importDefaultReviewsAction,
  listHomepageReviews,
  moveHomepageReviewAction,
  toggleHomepageReviewAction,
} from "../../actions/homepage-content";
import { ContentList } from "../_components/content-list";

export const instant = false;

export default async function AdminHomepageReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const [reviews, params] = await Promise.all([listHomepageReviews(), searchParams]);

  return (
    <ContentList
      title="Ulasan Pelanggan"
      subtitle="Kartu di carousel section Reviews. Urutan di daftar ini sama dengan urutan kartu di homepage."
      basePath="/admin/homepage/reviews"
      addLabel="Tambah ulasan"
      rows={reviews.map((r) => ({
        id: r.id,
        title: r.name,
        meta: `${r.location ? `${r.location} · ` : ""}${r.quote}`,
        isPublished: r.isPublished,
      }))}
      saved={params.saved}
      deleted={params.deleted}
      deletedLabel="Ulasan dihapus."
      emptyNote={
        <>
          <p>
            Belum ada ulasan. Saat ini section Reviews menampilkan ulasan bawaan situs. Begitu
            ulasan pertama disimpan, ulasan bawaan <strong>diganti seluruhnya</strong> oleh daftar
            ini.
          </p>
          <p>Agar tampilan tidak berubah, salin dulu ulasan bawaan, lalu ubah/tambah sesuai kebutuhan.</p>
        </>
      }
      importLabel="Salin ulasan bawaan"
      importAction={importDefaultReviewsAction}
      noLiveNote="Tidak ada ulasan yang tayang, jadi section Reviews tampil tanpa kartu. Terbitkan minimal satu ulasan, atau matikan section Reviews di halaman Section Homepage."
      footnote="Judul section “Reviews” bersifat tetap. Section Reviews bisa disembunyikan dari halaman Section Homepage."
      toggleAction={toggleHomepageReviewAction}
      moveAction={moveHomepageReviewAction}
    />
  );
}
