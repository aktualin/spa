"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  JOURNAL_BASE_PATH,
  JOURNAL_EXCERPT_MAX,
  JOURNAL_SEO_DESCRIPTION_MAX,
  JOURNAL_SEO_TITLE_MAX,
  JOURNAL_TITLE_MAX,
  collectJournalTags,
  isRichTextEmpty,
  journalPath,
  parseJournalTags,
  resolveJournalSchedule,
  resolveJournalSlug,
  validateJournalSlug,
} from "@/lib/domain/journal";
import { normalizePath } from "@/lib/domain/page-url";
import { plainTextToHtml } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { isJournalVisible } from "@/lib/domain/visibility";
import { recordPathMoves } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { JOURNAL_STATUSES } from "../journal/journal-status";

import {
  firstIssue,
  optionalImageUrl,
  optionalText,
  parseWibInput,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const SLUG_TAKEN = (slug: string) => `Slug "${slug}" sudah dipakai artikel lain.`;

const postSchema = z.object({
  slug: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const message = validateJournalSlug(value);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
  title: z
    .string()
    .trim()
    .min(1, "Judul artikel wajib diisi.")
    .max(JOURNAL_TITLE_MAX, `Judul maksimal ${JOURNAL_TITLE_MAX} karakter.`),
  excerpt: optionalText.refine(
    (value) => !value || value.length <= JOURNAL_EXCERPT_MAX,
    `Ringkasan maksimal ${JOURNAL_EXCERPT_MAX} karakter.`,
  ),
  bodyHtml: z
    .string()
    .optional()
    // Teks polos (mis. hasil tempel) dijadikan paragraf, lalu WAJIB disanitasi.
    .transform((value) => sanitizeHtml(plainTextToHtml(value ?? "")))
    .refine((value) => !isRichTextEmpty(value), "Isi artikel wajib diisi."),
  coverUrl: optionalImageUrl,
  // Kategori kini baris JournalCategory; form mengirim id, kosong = tanpa kategori.
  categoryId: optionalText,
  status: z.enum(JOURNAL_STATUSES, { message: "Status tidak dikenal." }),
  seoTitle: optionalText.refine(
    (value) => !value || value.length <= JOURNAL_SEO_TITLE_MAX,
    `Meta title maksimal ${JOURNAL_SEO_TITLE_MAX} karakter.`,
  ),
  seoDescription: optionalText.refine(
    (value) => !value || value.length <= JOURNAL_SEO_DESCRIPTION_MAX,
    `Meta description maksimal ${JOURNAL_SEO_DESCRIPTION_MAX} karakter.`,
  ),
});

function revalidateJournal(slugs: (string | null | undefined)[], redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.journal);
  if (redirectsChanged) {
    updateTag(CONTENT_TAGS.redirects);
    revalidatePath("/admin/redirects");
  }
  revalidatePath("/admin/journal");
  revalidatePath(JOURNAL_BASE_PATH);
  // Halaman Our Story menampilkan tiga tulisan terbaru.
  revalidatePath("/our-story");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(slugs)) {
    if (slug) revalidatePath(journalPath(slug));
  }
}

export async function savePostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  const publishedAtInput = parseWibInput(text(formData, "publishedAt"));
  if (publishedAtInput === undefined) {
    return { error: "Tanggal publikasi tidak valid." };
  }

  const parsed = postSchema.safeParse({
    // Slug boleh kosong → dibuat otomatis dari judul.
    slug: resolveJournalSlug(String(formData.get("slug") ?? ""), title),
    title,
    excerpt: text(formData, "excerpt"),
    bodyHtml: text(formData, "bodyHtml"),
    coverUrl: text(formData, "coverUrl"),
    categoryId: text(formData, "categoryId"),
    status: text(formData, "status") ?? "DRAFT",
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }
  const data = parsed.data;

  const tags = parseJournalTags(text(formData, "tags") ?? "");
  if (tags.error) return { error: tags.error };

  const now = new Date();
  const schedule = resolveJournalSchedule(data.status, publishedAtInput, now);
  if (!schedule.ok) return { error: schedule.error };

  const previous = id
    ? await prisma.journalPost.findUnique({
        where: { id },
        select: { slug: true, status: true, publishedAt: true, coverUrl: true },
      })
    : null;
  if (id && !previous) {
    return { error: "Artikel tidak ditemukan. Mungkin sudah dihapus." };
  }

  const clash = await prisma.journalPost.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: SLUG_TAKEN(data.slug) };

  // Kategori yang dipilih harus benar-benar ada; id karangan ditolak.
  const categoryId = data.categoryId || null;
  if (categoryId) {
    const exists = await prisma.journalCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!exists) return { error: "Kategori tidak ditemukan. Muat ulang halaman lalu pilih lagi." };
  }

  const payload = {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    bodyHtml: data.bodyHtml,
    coverUrl: data.coverUrl,
    categoryId,
    tags: tags.tags,
    status: schedule.status,
    publishedAt: schedule.publishedAt,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
  };

  const newPath = journalPath(data.slug);
  // Alamat lama tetap hidup (301) bila slug artikel yang sudah tampil publik berubah.
  const needsSlugRedirect =
    previous !== null && previous.slug !== data.slug && isJournalVisible(previous, now);

  let redirectsChanged = false;
  try {
    redirectsChanged = await prisma.$transaction(async (tx) => {
      let changed = false;

      if (needsSlugRedirect && previous) {
        changed = await recordPathMoves(
          tx,
          [{ from: journalPath(previous.slug), to: newPath }],
          `Slug artikel journal "${data.title}" diubah`,
        );
      }

      // Artikel (akan) terbit merebut kembali URL-nya: redirect dari alamat ini
      // akan menutupi artikel.
      if (schedule.status !== "DRAFT") {
        const shadowing = (
          await tx.redirect.findMany({ select: { fromPath: true } })
        ).filter((r) => normalizePath(r.fromPath) === newPath);
        if (shadowing.length > 0) {
          await tx.redirect.deleteMany({
            where: { fromPath: { in: shadowing.map((r) => r.fromPath) } },
          });
          changed = true;
        }
      }

      if (id) {
        await tx.journalPost.update({ where: { id }, data: payload });
      } else {
        await tx.journalPost.create({ data: payload });
      }
      return changed;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: SLUG_TAKEN(data.slug) };
    }
    throw error;
  }

  // Sampul lama dibuang setelah simpan berhasil (berkas Media Library tidak ikut terhapus).
  if (previous?.coverUrl && previous.coverUrl !== data.coverUrl) {
    await deleteImageByUrl(previous.coverUrl).catch(() => {});
  }

  revalidateJournal([previous?.slug, data.slug], redirectsChanged);
  redirect("/admin/journal?saved=1");
}

export async function deletePostAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.journalPost.findUnique({
    where: { id },
    select: { slug: true, coverUrl: true },
  });
  if (!post) redirect("/admin/journal?deleted=1");

  const path = journalPath(post.slug);

  // Redirect yang menuju artikel ini (mis. dari slug lamanya) ikut dihapus
  // agar tidak mengarah ke halaman 404.
  const removed = await prisma.$transaction(async (tx) => {
    const pointing = (
      await tx.redirect.findMany({ select: { fromPath: true, toPath: true } })
    ).filter((r) => r.toPath.startsWith("/") && normalizePath(r.toPath) === path);

    if (pointing.length > 0) {
      await tx.redirect.deleteMany({
        where: { fromPath: { in: pointing.map((r) => r.fromPath) } },
      });
    }
    await tx.journalPost.delete({ where: { id } });
    return pointing.length;
  });

  if (post.coverUrl) {
    await deleteImageByUrl(post.coverUrl).catch(() => {});
  }

  revalidateJournal([post.slug], removed > 0);
  redirect("/admin/journal?deleted=1");
}

export async function listPosts() {
  await requireSession();

  return prisma.journalPost.findMany({
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });
}

export async function getPost(id: string) {
  await requireSession();

  return prisma.journalPost.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
}

/**
 * Pilihan kategori (urut sesuai admin) dan tag yang sudah dipakai, untuk form
 * artikel. Kategori yang belum terbit tetap ditawarkan — admin bisa menyiapkan
 * artikel sebelum kategorinya ditampilkan di situs.
 */
export async function listJournalTaxonomy(): Promise<{
  categories: { id: string; name: string; isPublished: boolean }[];
  tags: string[];
}> {
  await requireSession();

  const [categories, rows] = await Promise.all([
    prisma.journalCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, isPublished: true },
    }),
    prisma.journalPost.findMany({
      select: { tags: true },
      orderBy: [{ updatedAt: "desc" }],
    }),
  ]);

  return { categories, tags: collectJournalTags(rows) };
}
