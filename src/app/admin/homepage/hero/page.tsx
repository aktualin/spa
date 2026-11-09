import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  listHeroSlides,
  moveHeroSlideAction,
  toggleHeroSlideAction,
} from "../../actions/hero-slides";
import { SmallSubmit } from "../../promos/_kit/form-ui";
import {
  Badge,
  PageHeader,
  StatusBanners,
  Thumb,
  primaryLinkClass,
} from "../../promos/_kit/list-ui";

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
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Thumb src={row.imageUrl} alt={row.imageAlt ?? ""} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/homepage/hero/${row.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {row.mediaType === "VIDEO" ? "Slide video" : "Slide foto"}
                    </Link>
                    <Badge tone={row.mediaType === "VIDEO" ? "blue" : "muted"}>
                      {row.mediaType === "VIDEO" ? "Video" : "Foto"}
                    </Badge>
                    <Badge tone={row.isPublished ? "green" : "muted"}>
                      {row.isPublished ? "Tayang" : "Draf"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    urutan {row.sortOrder + 1} ·{" "}
                    {row.mediaType === "VIDEO"
                      ? row.videoUrl ?? "video belum diisi"
                      : row.imageUrl ?? "gambar belum diisi"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <form action={toggleHeroSlideAction}>
                  <input type="hidden" name="id" value={row.id} />
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
                <form action={moveHeroSlideAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SmallSubmit title="Naikkan" disabled={index === 0}>
                    ↑
                  </SmallSubmit>
                </form>
                <form action={moveHeroSlideAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SmallSubmit title="Turunkan" disabled={index === slides.length - 1}>
                    ↓
                  </SmallSubmit>
                </form>
              </div>
            </li>
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
