import { requireRole } from "@/lib/auth";
import { INSTAGRAM_LIMITS } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  importDefaultInstagramAction,
  listInstagramPosts,
  moveInstagramPostAction,
  toggleInstagramPostAction,
} from "../../actions/homepage-content";
import { ContentList } from "../_components/content-list";

export const instant = false;

export default async function AdminHomepageInstagramPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const [posts, params] = await Promise.all([listInstagramPosts(), searchParams]);

  return (
    <ContentList
      title="Feed Instagram"
      subtitle="Foto di grid section Instagram. Username dan tautan profil diatur di Kontak & Umum. Urutan di daftar ini sama dengan urutan foto di homepage."
      basePath="/admin/homepage/instagram"
      addLabel="Tambah foto"
      addDisabledNote={
        posts.length >= INSTAGRAM_LIMITS.max ? `Maksimal ${INSTAGRAM_LIMITS.max} foto.` : null
      }
      rows={posts.map((p) => ({
        id: p.id,
        title: p.imageAlt || "Foto Instagram",
        meta: p.href ?? "tautan profil Instagram",
        thumb: p.imageUrl,
        isPublished: p.isPublished,
      }))}
      saved={params.saved}
      deleted={params.deleted}
      deletedLabel="Foto dihapus."
      emptyNote={
        <>
          <p>
            Belum ada foto. Saat ini grid Instagram menampilkan 12 foto bawaan situs. Begitu foto
            pertama disimpan, foto bawaan <strong>diganti seluruhnya</strong> oleh daftar ini.
          </p>
          <p>Agar tampilan tidak berubah, salin dulu 12 foto bawaan, lalu ganti satu per satu.</p>
        </>
      }
      importLabel="Salin 12 foto bawaan"
      importAction={importDefaultInstagramAction}
      noLiveNote="Tidak ada foto yang tayang, jadi grid Instagram kosong (judul dan tombol Follow tetap tampil). Terbitkan minimal satu foto, atau matikan section Socials di halaman Section Homepage."
      footnote={`Maksimal ${INSTAGRAM_LIMITS.max} foto. Tanpa tautan postingan, foto menuju profil Instagram.`}
      toggleAction={toggleInstagramPostAction}
      moveAction={moveInstagramPostAction}
    />
  );
}
