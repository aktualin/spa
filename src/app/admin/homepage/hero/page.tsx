import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listHeroSlides } from "../../actions/hero-slides";
import { PageHeader, StatusBanners, primaryLinkClass } from "../../promos/_kit/list-ui";
import { HeroSlideListItem } from "./hero-slides-list";

export const instant = false;

export default async function AdminHeroSlidesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [slides, params] = await Promise.all([
    listHeroSlides(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/homepage" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Section Homepage
      </Link>

      <div className="mt-3">
        <PageHeader
          title="Slide Hero"
          subtitle="Media slider di bagian paling atas homepage. Teks, eyebrow, dan tombol hero tetap diatur di Section Homepage."
          action={
            <Link href="/admin/homepage/hero/new" className={primaryLinkClass}>
              Tambah slide
            </Link>
          }
        />
      </div>

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Slide dihapus."
      />

      <p className="mt-4 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
        Slide terbit tampil berurutan sesuai daftar ini. Selama tabel slide
        masih kosong, hero memakai gambar fallback dari Section Homepage.
        Setelah ada slide, gambar fallback tidak dipakai lagi.
      </p>

      {slides.length === 0 ? (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Belum ada slide. Hero saat ini menampilkan gambar fallback dari
          Section Homepage. Tambahkan minimal satu slide untuk mengaktifkan
          slider.
        </p>
      ) : null}

      {slides.length > 0 ? (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {slides.map((row, index) => (
            <HeroSlideListItem key={row.id} row={row} index={index} count={slides.length} />
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs text-neutral-500">
        Video memakai URL file langsung (.mp4/.webm), bukan tautan halaman
        YouTube/Vimeo. Poster wajib diisi agar hero tetap tampil saat video
        belum dimuat atau autoplay diblokir. Perubahan tampil di homepage
        dalam beberapa menit.
      </p>
    </div>
  );
}