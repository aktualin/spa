"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { slugify } from "@/lib/domain/slug";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { deleteImageByUrl } from "@/lib/storage";

import { JOURNAL_STATUSES, type JournalStatus } from "../journal/journal-status";

import {
  firstIssue,
  optionalImageUrl,
  optionalText,
  parseWibInput,
  slugSchema,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const postSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Judul artikel wajib diisi."),
  excerpt: optionalText,
  bodyHtml: z.string().trim().min(1, "Isi artikel wajib diisi."),
  coverUrl: optionalImageUrl,
  category: optionalText,
  tags: z.array(z.string().trim().min(1)).max(20, "Maksimal 20 tag per artikel."),
  status: z.enum(JOURNAL_STATUSES),
  publishedAt: z.date().nullable(),
  seoTitle: optionalText,
  seoDescription: optionalText,
});

/** Form mengirim tag sebagai satu input comma-separated. */
function parseTags(formData: FormData): string[] {
  const raw = String(formData.get("tags") ?? "");
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, 20);
}

function revalidateJournal(slug?: string | null) {
  updateTag(CONTENT_TAGS.journal);
  revalidatePath("/admin/journal");
  revalidatePath("/our-story/journal");
  if (slug) revalidatePath(`/our-story/journal/${slug}`);
}

export async function savePostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT") as JournalStatus;
  const publishedAt = parseWibInput(text(formData, "publishedAt"));

  if (publishedAt === undefined) {
    return { error: "Tanggal publikasi tidak valid." };
  }

  // Slug boleh kosong → dibuat otomatis dari judul.
  const slug = rawSlug || slugify(title);

  const parsed = postSchema.safeParse({
    slug,
    title,
    excerpt: text(formData, "excerpt"),
    bodyHtml: text(formData, "bodyHtml"),
    coverUrl: text(formData, "coverUrl"),
    category: text(formData, "category"),
    tags: parseTags(formData),
    status,
    publishedAt,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const data = parsed.data;

  if (data.status === "SCHEDULED" && !data.publishedAt) {
    return { error: "Tanggal publikasi wajib diisi untuk artikel terjadwal." };
  }

  // PUBLISHED tanpa tanggal → terbit sekarang.
  const publishedAtValue =
    data.status === "PUBLISHED"
      ? (data.publishedAt ?? new Date())
      : data.publishedAt;

  const clash = await prisma.journalPost.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai artikel lain.` };
  }

  if (id) {
    const previous = await prisma.journalPost.findUnique({
      where: { id },
      select: { coverUrl: true },
    });
    if (previous?.coverUrl && previous.coverUrl !== data.coverUrl) {
      await deleteImageByUrl(previous.coverUrl).catch(() => {});
    }
  }

  const payload = {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    // HTML dari rich text editor WAJIB disanitasi sebelum disimpan.
    bodyHtml: sanitizeHtml(data.bodyHtml),
    coverUrl: data.coverUrl,
    category: data.category,
    tags: data.tags,
    status: data.status,
    publishedAt: publishedAtValue,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
  };

  if (id) {
    await prisma.journalPost.update({ where: { id }, data: payload });
  } else {
    await prisma.journalPost.create({ data: payload });
  }

  revalidateJournal(data.slug);
  redirect("/admin/journal?saved=1");
}

export async function deletePostAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.journalPost.delete({ where: { id } });
  if (post.coverUrl) {
    await deleteImageByUrl(post.coverUrl).catch(() => {});
  }

  revalidateJournal(post.slug);
  redirect("/admin/journal?deleted=1");
}

export async function listPosts() {
  await requireSession();

  return prisma.journalPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPost(id: string) {
  await requireSession();

  return prisma.journalPost.findUnique({ where: { id } });
}
