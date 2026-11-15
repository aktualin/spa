import { requireRole } from "@/lib/auth";
import { INSTAGRAM_LIMITS } from "@/lib/domain/homepage";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  listInstagramPosts,
  moveInstagramPostAction,
  toggleInstagramPostAction,
} from "../../actions/homepage-content";
import { ContentList } from "../_components/content-list";

export const instant = false;

/** `https://www.instagram.com/p/Cxxxx/` → `p/Cxxxx` untuk judul baris. */
function shortLabel(postUrl: string) {
  return postUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
}

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
      subtitle="Postingan yang di-embed di section Instagram homepage. Cukup tempel tautan postingan — tidak ada foto yang diunggah. Urutan di daftar ini sama dengan urutan di homepage."
      basePath="/admin/homepage/instagram"
      addLabel="Tambah postingan"
      addDisabledNote={
        posts.length >= INSTAGRAM_LIMITS.max
          ? `Maksimal ${INSTAGRAM_LIMITS.max} postingan.`
          : null
      }
      rows={posts.map((p) => ({
        id: p.id,
        title: shortLabel(p.postUrl),
        meta: "embed Instagram",
        isPublished: p.isPublished,
      }))}
      saved={params.saved}
      deleted={params.deleted}
      deletedLabel="Postingan dihapus."
      emptyNote={
        <p>
          Belum ada postingan. Tambahkan tautan postingan Instagram (foto, reel, atau IGTV) untuk
          menampilkan embednya di homepage.
        </p>
      }
      noLiveNote="Tidak ada postingan yang tayang, jadi feed Instagram kosong (judul dan tombol Follow tetap tampil). Terbitkan minimal satu postingan, atau matikan section Socials di halaman Section Homepage."
      footnote={`Maksimal ${INSTAGRAM_LIMITS.max} postingan. Setiap postingan di-embed langsung dari Instagram, jadi postingan yang dihapus/diprivat oleh pemiliknya ikut hilang dari feed.`}
      toggleAction={toggleInstagramPostAction}
      moveAction={moveInstagramPostAction}
    />
  );
}
