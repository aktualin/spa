"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  MEDIA_HTML_COLUMNS,
  MEDIA_URL_ARRAY_COLUMNS,
  MEDIA_URL_COLUMNS,
  extractImageUrls,
  mediaDisplayNameError,
  mimeTypeFromFileName,
  moveInList,
  splitStorageKey,
} from "@/lib/domain/media";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteStoredObject, publicUrlFor, storageKeyFromUrl } from "@/lib/storage";

export type ActionState = { error: string | null; ok?: boolean; message?: string };

export type MediaUsage = {
  /** Label kolom, mis. "Treatment" atau "Journal (isi)". */
  label: string;
  /** Nama/judul baris yang memakai berkas. */
  name: string;
  /** Halaman admin untuk mengubah baris tersebut, bila ada. */
  href: string | null;
};

export type PickerAsset = {
  id: string;
  url: string;
  fileName: string;
  title: string | null;
  altText: string | null;
  folder: string;
  mimeType: string;
};

// ---------------------------------------------------------------------------
// Akses dinamis ke delegate Prisma berdasarkan nama model di MEDIA_URL_COLUMNS
// dan MEDIA_HTML_COLUMNS. Nama model berasal dari konstanta, bukan input user.
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;
type AnyDelegate = {
  findMany(args: object): Promise<Row[]>;
  updateMany(args: object): Promise<{ count: number }>;
};

function delegateOf(client: unknown, model: string): AnyDelegate {
  return (client as Record<string, AnyDelegate>)[model];
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Cara menampilkan & menautkan baris tiap model di daftar "Dipakai di". */
const DESCRIBE: Record<string, { select: Record<string, true>; name: (r: Row) => string; href: (r: Row) => string }> = {
  treatmentCategory: { select: { id: true, name: true }, name: (r) => str(r.name), href: (r) => `/admin/treatments/categories/${str(r.id)}` },
  treatment: { select: { id: true, name: true }, name: (r) => str(r.name), href: (r) => `/admin/treatments/${str(r.id)}` },
  package: { select: { id: true, name: true }, name: (r) => str(r.name), href: (r) => `/admin/treatments/packages/${str(r.id)}` },
  galleryAlbum: { select: { id: true, name: true }, name: (r) => str(r.name), href: (r) => `/admin/gallery/albums/${str(r.id)}` },
  galleryPhoto: { select: { id: true, caption: true, albumId: true }, name: (r) => str(r.caption) || "Foto tanpa caption", href: (r) => `/admin/gallery/${str(r.albumId)}` },
  promo: { select: { id: true, title: true }, name: (r) => str(r.title), href: (r) => `/admin/promos/${str(r.id)}` },
  giftCardInfo: { select: { id: true, title: true }, name: (r) => str(r.title), href: () => "/admin/gift-card" },
  journalPost: { select: { id: true, title: true }, name: (r) => str(r.title), href: (r) => `/admin/journal/${str(r.id)}` },
  eventItem: { select: { id: true, title: true }, name: (r) => str(r.title), href: (r) => `/admin/events/${str(r.id)}` },
  eventPhoto: { select: { id: true, caption: true, eventId: true }, name: (r) => str(r.caption) || "Foto tanpa caption", href: (r) => `/admin/events/${str(r.eventId)}` },
  retailProduct: { select: { id: true, name: true }, name: (r) => str(r.name), href: (r) => `/admin/retail/${str(r.id)}` },
  homepageSection: { select: { id: true, title: true, key: true }, name: (r) => str(r.title) || str(r.key), href: () => "/admin/homepage" },
  ourStoryContent: { select: { id: true, heroTitle: true }, name: (r) => str(r.heroTitle) || "Our Story", href: () => "/admin/our-story" },
  pageSeo: { select: { id: true, path: true }, name: (r) => str(r.path), href: (r) => `/admin/seo/${str(r.id)}` },
  corporateContent: { select: { id: true, heroTitle: true }, name: (r) => str(r.heroTitle) || "Corporate Wellness", href: () => "/admin/corporate" },
  staticPage: { select: { id: true, title: true }, name: (r) => str(r.title), href: (r) => `/admin/pages/${str(r.id)}` },
  corporateProgram: { select: { id: true, name: true }, name: (r) => str(r.name), href: () => "/admin/corporate" },
  corporateClient: { select: { id: true, name: true }, name: (r) => str(r.name), href: () => "/admin/corporate" },
  homepageHighlight: { select: { id: true, title: true }, name: (r) => str(r.title), href: () => "/admin/homepage" },
  siteSettings: { select: { id: true }, name: () => "Pengaturan situs", href: () => "/admin/seo" },
};

const strList = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/** Awalan URL publik bucket kita, mis. "https://…/storage/v1/object/public/bucket/". */
function bucketPrefix(): string {
  return publicUrlFor("");
}

/**
 * Pemakaian setiap URL: kolom gambar yang nilainya sama persis, ditambah
 * kolom HTML yang memuat URL tersebut di dalam isinya.
 */
async function usageByUrl(urls: readonly string[]): Promise<Map<string, MediaUsage[]>> {
  const result = new Map<string, MediaUsage[]>(urls.map((url) => [url, []]));
  if (urls.length === 0) return result;

  const urlList = [...urls];
  const add = (url: string, usage: MediaUsage) => result.get(url)?.push(usage);

  const columnQueries = MEDIA_URL_COLUMNS.map(async (column) => {
    const describe = DESCRIBE[column.model];
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { in: urlList } },
      select: { ...describe.select, [column.field]: true },
    });
    for (const row of rows) {
      add(str(row[column.field]), {
        label: column.label,
        name: describe.name(row),
        href: describe.href(row),
      });
    }
  });

  // Hanya baris yang memuat URL bucket kita yang perlu dicek isinya.
  const prefix = bucketPrefix();
  const htmlQueries = MEDIA_HTML_COLUMNS.map(async (column) => {
    const describe = DESCRIBE[column.model];
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { contains: prefix } },
      select: { ...describe.select, [column.field]: true },
    });
    for (const row of rows) {
      const html = str(row[column.field]);
      for (const url of urlList) {
        if (html.includes(url)) {
          add(url, { label: column.label, name: describe.name(row), href: describe.href(row) });
        }
      }
    }
  });

  const arrayQueries = MEDIA_URL_ARRAY_COLUMNS.map(async (column) => {
    const describe = DESCRIBE[column.model];
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { hasSome: urlList } },
      select: { ...describe.select, [column.field]: true },
    });
    for (const row of rows) {
      for (const url of strList(row[column.field])) {
        add(url, { label: column.label, name: describe.name(row), href: describe.href(row) });
      }
    }
  });

  await Promise.all([...columnQueries, ...htmlQueries, ...arrayQueries]);
  return result;
}

async function usageOf(url: string): Promise<MediaUsage[]> {
  return (await usageByUrl([url])).get(url) ?? [];
}

function revalidateMediaPages(id?: string) {
  revalidatePath("/admin/media");
  if (id) revalidatePath(`/admin/media/${id}`);
}

// ---------------------------------------------------------------------------
// Bacaan
// ---------------------------------------------------------------------------

export type MediaListItem = {
  id: string;
  url: string;
  fileName: string;
  title: string | null;
  altText: string | null;
  mimeType: string;
  sizeBytes: number;
  folder: string;
  sortOrder: number;
  createdAt: Date;
  usageCount: number;
};

/** Dipakai halaman /admin/media. Urutan: folder, sortOrder naik, terbaru dulu. */
export async function listMedia(filter: {
  folder?: string;
  q?: string;
  unused?: boolean;
}): Promise<MediaListItem[]> {
  await requireSession();

  const q = filter.q?.trim();
  const assets = await prisma.mediaAsset.findMany({
    where: {
      ...(filter.folder ? { folder: filter.folder } : {}),
      ...(q
        ? {
            OR: [
              { fileName: { contains: q, mode: "insensitive" as const } },
              { title: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ folder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      url: true,
      fileName: true,
      title: true,
      altText: true,
      mimeType: true,
      sizeBytes: true,
      folder: true,
      sortOrder: true,
      createdAt: true,
    },
  });

  const usage = await usageByUrl(assets.map((asset) => asset.url));
  const items = assets.map((asset) => ({
    ...asset,
    usageCount: usage.get(asset.url)?.length ?? 0,
  }));
  return filter.unused ? items.filter((item) => item.usageCount === 0) : items;
}

/** Daftar folder beserta jumlah berkasnya. */
export async function listMediaFolders(): Promise<{ folder: string; count: number }[]> {
  await requireSession();

  const groups = await prisma.mediaAsset.groupBy({
    by: ["folder"],
    _count: { _all: true },
    orderBy: { folder: "asc" },
  });
  return groups.map((group) => ({ folder: group.folder, count: group._count._all }));
}

/** Satu aset beserta daftar "Dipakai di". Dipakai halaman detail. */
export async function getMediaDetail(id: string) {
  await requireSession();

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });
  if (!asset) return null;

  return { asset, usages: await usageOf(asset.url) };
}

/** Bacaan untuk dialog "Pilih dari Media Library". */
export async function listMediaForPicker(
  filter: { folder?: string; q?: string } = {},
): Promise<PickerAsset[]> {
  await requireSession();

  const folder = filter.folder?.trim();
  const q = filter.q?.trim().slice(0, 100);
  return prisma.mediaAsset.findMany({
    where: {
      ...(folder ? { folder } : {}),
      ...(q
        ? {
            OR: [
              { fileName: { contains: q, mode: "insensitive" as const } },
              { title: { contains: q, mode: "insensitive" as const } },
              { altText: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ folder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      url: true,
      fileName: true,
      title: true,
      altText: true,
      folder: true,
      mimeType: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Ubah metadata
// ---------------------------------------------------------------------------

const optionalMeta = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`)
    .transform((value) => (value === "" ? null : value));

const metaSchema = z.object({
  title: optionalMeta(200, "Judul"),
  altText: optionalMeta(300, "Alt text"),
});

/** Simpan judul, alt text, dan nama file tampilan. URL berkas tidak berubah. */
export async function updateMediaAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const fileName = String(formData.get("fileName") ?? "");
  const nameError = mediaDisplayNameError(fileName);
  if (nameError) return { error: nameError };

  const parsed = metaSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    altText: String(formData.get("altText") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const existing = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { error: "Berkas tidak ditemukan." };

  await prisma.mediaAsset.update({
    where: { id },
    data: { fileName: fileName.trim(), ...parsed.data },
  });

  revalidateMediaPages(id);
  redirect(`/admin/media/${id}?saved=1`);
}

// ---------------------------------------------------------------------------
// Ganti berkas
// ---------------------------------------------------------------------------

/** Tag konten publik yang mungkin memuat URL gambar. */
const IMAGE_CONTENT_TAGS = [
  CONTENT_TAGS.catalog,
  CONTENT_TAGS.gallery,
  CONTENT_TAGS.promos,
  CONTENT_TAGS.giftCard,
  CONTENT_TAGS.journal,
  CONTENT_TAGS.events,
  CONTENT_TAGS.retail,
  CONTENT_TAGS.homepage,
  CONTENT_TAGS.ourStory,
  CONTENT_TAGS.seo,
  CONTENT_TAGS.corporate,
  CONTENT_TAGS.pages,
] as const;

/**
 * Ganti berkas sebuah aset dengan berkas yang BARU SAJA diunggah lewat
 * /api/admin/upload (`uploadedId`, sudah divalidasi & tercatat sebagai aset
 * sementara). Berkas dikirim lewat route upload — bukan lewat Server Action —
 * karena batas body Server Action bawaan hanya 1 MB, sedangkan berkas boleh
 * sampai 4 MB.
 *
 * Key storage selalu baru: URL lama di-cache CDN `immutable` selama setahun,
 * jadi menimpa key lama tidak akan terlihat pengunjung. Dalam satu transaksi:
 * aset sementara dihapus, url/key/meta-nya dipindah ke aset target, lalu semua
 * kolom gambar dan isi HTML yang memakai URL lama diarahkan ke URL baru.
 * Setelah commit, objek lama dihapus dari storage.
 */
export async function replaceMediaAction(
  targetId: string,
  uploadedId: string,
): Promise<ActionState> {
  const session = await requireRole(CONTENT_ROLES);

  if (typeof targetId !== "string" || typeof uploadedId !== "string" || !targetId || !uploadedId) {
    return { error: "Permintaan tidak valid." };
  }
  if (targetId === uploadedId) return { error: "Berkas pengganti tidak valid." };

  const [target, uploaded] = await Promise.all([
    prisma.mediaAsset.findUnique({ where: { id: targetId } }),
    prisma.mediaAsset.findUnique({ where: { id: uploadedId } }),
  ]);
  if (!target) return { error: "Berkas yang akan diganti tidak ditemukan." };
  if (!uploaded) return { error: "Berkas pengganti tidak ditemukan. Unggah ulang." };

  // Hanya unggahan milik sendiri yang belum dipakai di mana pun yang boleh
  // "dilebur" ke aset lain — mencegah aset orang lain/yang sedang dipakai ikut hilang.
  if (uploaded.uploadedById !== session.userId) {
    return { error: "Berkas pengganti harus unggahan Anda sendiri." };
  }
  if ((await usageOf(uploaded.url)).length > 0) {
    return { error: "Berkas pengganti sudah dipakai konten lain. Unggah berkas baru." };
  }

  const oldUrl = target.url;
  const newUrl = uploaded.url;

  try {
    await prisma.$transaction(async (tx) => {
      // Hapus baris sementara dulu: url & storageKey bersifat unik.
      await tx.mediaAsset.delete({ where: { id: uploaded.id } });
      await tx.mediaAsset.update({
        where: { id: target.id },
        data: {
          url: newUrl,
          storageKey: uploaded.storageKey,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
          fileName: uploaded.fileName,
          width: uploaded.width,
          height: uploaded.height,
        },
      });

      for (const column of MEDIA_URL_COLUMNS) {
        await delegateOf(tx, column.model).updateMany({
          where: { [column.field]: oldUrl },
          data: { [column.field]: newUrl },
        });
      }

      for (const column of MEDIA_URL_ARRAY_COLUMNS) {
        const table = Prisma.raw(`"${column.table}"`);
        const field = Prisma.raw(`"${column.field}"`);
        await tx.$executeRaw`UPDATE ${table} SET ${field} = array_replace(${field}, ${oldUrl}, ${newUrl}) WHERE ${oldUrl} = ANY(${field})`;
      }

      // Identifier tabel/kolom berasal dari konstanta MEDIA_HTML_COLUMNS;
      // nilai URL dikirim sebagai parameter terikat.
      for (const column of MEDIA_HTML_COLUMNS) {
        const table = Prisma.raw(`"${column.table}"`);
        const field = Prisma.raw(`"${column.field}"`);
        await tx.$executeRaw`UPDATE ${table} SET ${field} = REPLACE(${field}, ${oldUrl}, ${newUrl}) WHERE strpos(${field}, ${oldUrl}) > 0`;
      }
    });
  } catch (error) {
    console.error("[media] gagal mengganti berkas", error);
    return { error: "Gagal mengganti berkas. Tidak ada perubahan yang disimpan." };
  }

  // Referensi sudah pindah ke URL baru; objek lama aman dihapus.
  await deleteStoredObject(oldUrl).catch((error) => {
    console.error("[media] gagal menghapus berkas lama", oldUrl, error);
  });

  for (const tag of IMAGE_CONTENT_TAGS) updateTag(tag);
  revalidatePath("/", "layout");
  revalidateMediaPages(target.id);

  return { error: null, ok: true, message: "Berkas berhasil diganti." };
}

/**
 * Buang unggahan sementara yang batal dipakai sebagai pengganti (mis. galat
 * setelah unggah). Hanya untuk unggahan milik sendiri yang belum dipakai.
 */
export async function discardUploadAction(uploadedId: string): Promise<void> {
  const session = await requireRole(CONTENT_ROLES);
  if (typeof uploadedId !== "string" || !uploadedId) return;

  const asset = await prisma.mediaAsset.findUnique({ where: { id: uploadedId } });
  if (!asset || asset.uploadedById !== session.userId) return;
  if ((await usageOf(asset.url)).length > 0) return;

  await deleteStoredObject(asset.url).catch(() => {});
  await prisma.mediaAsset.delete({ where: { id: asset.id } }).catch(() => {});
  revalidateMediaPages();
}

// ---------------------------------------------------------------------------
// Hapus & urutkan
// ---------------------------------------------------------------------------

/** Hapus berkas yang tidak dipakai di mana pun: objek storage dulu, lalu barisnya. */
export async function deleteMediaAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const asset = id ? await prisma.mediaAsset.findUnique({ where: { id } }) : null;
  if (!asset) redirect("/admin/media");

  if ((await usageOf(asset.url)).length > 0) {
    redirect(`/admin/media/${asset.id}?blocked=1`);
  }

  try {
    await deleteStoredObject(asset.url);
  } catch (error) {
    console.error("[media] gagal menghapus objek storage", asset.url, error);
    redirect(`/admin/media/${asset.id}?error=storage`);
  }

  await prisma.mediaAsset.delete({ where: { id: asset.id } });

  revalidateMediaPages();
  redirect("/admin/media?deleted=1");
}

/** Kembali ke halaman daftar dengan filter yang sama (hanya path /admin/media). */
function safeBack(value: FormDataEntryValue | null): string {
  const back = typeof value === "string" ? value : "";
  return /^\/admin\/media(?:[/?]|$)/.test(back) && !back.includes("//") ? back : "/admin/media";
}

/** Naik/turun satu posisi di dalam foldernya; sortOrder ditulis ulang 0..n. */
export async function moveMediaAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const back = safeBack(formData.get("back"));
  if (!id || (direction !== "up" && direction !== "down")) redirect(back);

  const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: { folder: true } });
  if (!asset) redirect(back);

  const siblings = await prisma.mediaAsset.findMany({
    where: { folder: asset.folder },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, sortOrder: true },
  });

  const current = new Map(siblings.map((row) => [row.id, row.sortOrder]));
  const ordered = moveInList(
    siblings.map((row) => row.id),
    id,
    direction,
  );
  const changes = ordered
    .map((rowId, index) => ({ id: rowId, sortOrder: index }))
    .filter((row) => current.get(row.id) !== row.sortOrder);

  if (changes.length > 0) {
    await prisma.$transaction(
      changes.map((row) =>
        prisma.mediaAsset.update({ where: { id: row.id }, data: { sortOrder: row.sortOrder } }),
      ),
    );
  }

  revalidateMediaPages();
  redirect(back);
}

// ---------------------------------------------------------------------------
// Sinkronkan berkas lama
// ---------------------------------------------------------------------------

async function contentLength(url: string): Promise<number> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const length = Number(response.headers.get("content-length"));
    return response.ok && Number.isFinite(length) && length > 0 ? Math.round(length) : 0;
  } catch {
    return 0;
  }
}

/**
 * Catat ke Media Library semua berkas bucket kita yang sudah dipakai konten
 * (diunggah sebelum Media Library ada) tetapi belum punya baris MediaAsset.
 * Idempoten: URL/key yang sudah tercatat dilewati.
 */
export async function syncMediaAction(): Promise<void> {
  await requireRole(CONTENT_ROLES);

  const prefix = bucketPrefix();
  const found = new Set<string>();

  for (const column of MEDIA_URL_COLUMNS) {
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { startsWith: prefix } },
      select: { [column.field]: true },
    });
    for (const row of rows) found.add(str(row[column.field]));
  }
  for (const column of MEDIA_HTML_COLUMNS) {
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { [column.field]: { contains: prefix } },
      select: { [column.field]: true },
    });
    for (const row of rows) {
      for (const url of extractImageUrls(str(row[column.field]))) found.add(url);
    }
  }
  for (const column of MEDIA_URL_ARRAY_COLUMNS) {
    const rows = await delegateOf(prisma, column.model).findMany({
      where: { NOT: { [column.field]: { isEmpty: true } } },
      select: { [column.field]: true },
    });
    for (const row of rows) {
      for (const url of strList(row[column.field])) {
        if (url.startsWith(prefix)) found.add(url);
      }
    }
  }

  const candidates = [...found]
    .map((url) => ({ url, key: storageKeyFromUrl(url) }))
    .filter((item): item is { url: string; key: string } => Boolean(item.key));

  const existing = await prisma.mediaAsset.findMany({
    where: {
      OR: [
        { url: { in: candidates.map((item) => item.url) } },
        { storageKey: { in: candidates.map((item) => item.key) } },
      ],
    },
    select: { url: true, storageKey: true },
  });
  const known = new Set(existing.flatMap((row) => [row.url, row.storageKey]));
  const missing = candidates.filter((item) => !known.has(item.url) && !known.has(item.key));

  let created = 0;
  if (missing.length > 0) {
    const maxima = await prisma.mediaAsset.groupBy({ by: ["folder"], _max: { sortOrder: true } });
    const nextOrder = new Map(maxima.map((row) => [row.folder, (row._max.sortOrder ?? -1) + 1]));

    // HEAD paralel dalam kelompok kecil supaya tidak membanjiri storage.
    const sizes: number[] = [];
    for (let i = 0; i < missing.length; i += 5) {
      sizes.push(...(await Promise.all(missing.slice(i, i + 5).map((item) => contentLength(item.url)))));
    }

    const data = missing.map((item, index) => {
      const { folder, fileName } = splitStorageKey(item.key);
      const sortOrder = nextOrder.get(folder) ?? 0;
      nextOrder.set(folder, sortOrder + 1);
      return {
        url: item.url,
        storageKey: item.key,
        fileName,
        mimeType: mimeTypeFromFileName(fileName) ?? "application/octet-stream",
        sizeBytes: sizes[index] ?? 0,
        folder,
        sortOrder,
        // Pengunggah aslinya tidak diketahui.
        uploadedById: null,
      };
    });

    const result = await prisma.mediaAsset.createMany({ data, skipDuplicates: true });
    created = result.count;
  }

  revalidateMediaPages();
  redirect(`/admin/media?synced=${created}`);
}
