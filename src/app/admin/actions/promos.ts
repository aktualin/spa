"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { normalizePath } from "@/lib/domain/page-url";
import { recordPathMoves } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";
import { plainTextToHtml, richTextInput } from "@/lib/domain/rich-text";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { deleteImageByUrl } from "@/lib/storage";

import {
  checked,
  firstIssue,
  optionalImageUrl,
  optionalText,
  parseWibInput,
  slugSchema,
  sortOrderSchema,
  text,
} from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const promoSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Judul promo wajib diisi."),
  description: optionalText,
  bannerUrl: optionalImageUrl,
  terms: optionalText,
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  isPublished: z.boolean(),
  sortOrder: sortOrderSchema,
  seoTitle: optionalText,
  seoDescription: optionalText,
  whatsappMessage: optionalText,
});

function termsToHtml(terms: string | null | undefined): string | null {
  if (!terms) return null;
  const html = sanitizeHtml(plainTextToHtml(terms));
  return /\S/.test(html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")) ? html : null;
}

const promoPath = (slug: string) => `/promos/${slug}`;

function revalidatePromo(slug?: string | null) {
  updateTag(CONTENT_TAGS.promos);
  // Promo bisa jadi blok highlight di homepage.
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath("/admin/promos");
  revalidatePath("/promos");
  revalidatePath("/");
  if (slug) revalidatePath(`/promos/${slug}`);
}

export async function savePromoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  // Awal periode = 00:00 WIB, akhir periode = 23:59:59.999 WIB.
  const startDate = parseWibInput(text(formData, "startDate"));
  const endDate = parseWibInput(text(formData, "endDate"), { endOfDay: true });

  if (startDate === undefined || endDate === undefined) {
    return { error: "Tanggal promo tidak valid." };
  }

  const parsed = promoSchema.safeParse({
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    description: richTextInput(formData.get("description")),
    bannerUrl: text(formData, "bannerUrl"),
    terms: text(formData, "terms"),
    startDate,
    endDate,
    isPublished: checked(formData, "isPublished"),
    sortOrder: text(formData, "sortOrder") ?? 0,
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    whatsappMessage: text(formData, "whatsappMessage"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  // S&K dari editor teks kaya (atau teks polos lama) disimpan sebagai HTML
  // yang sudah disanitasi.
  const termsHtml = termsToHtml(parsed.data.terms);
  const data = { ...parsed.data, terms: termsHtml };

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    return { error: "Tanggal berakhir harus lebih besar dari tanggal mulai." };
  }

  const clash = await prisma.promo.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai promo lain.` };
  }

  const previous = id
    ? await prisma.promo.findUnique({
        where: { id },
        select: { bannerUrl: true, slug: true, isPublished: true },
      })
    : null;

  const redirectsChanged = await prisma.$transaction(async (tx) => {
    if (id) {
      await tx.promo.update({ where: { id }, data });
    } else {
      await tx.promo.create({ data });
    }

    // Ganti slug promo yang sedang tayang: alamat lama dialihkan (301).
    let changed =
      previous && previous.isPublished && previous.slug !== data.slug
        ? await recordPathMoves(
            tx,
            [{ from: promoPath(previous.slug), to: promoPath(data.slug) }],
            `Promo "${data.title}" pindah alamat`,
          )
        : false;
    // Redirect otomatis lama yang menutupi alamat promo yang tayang ini.
    if (data.isPublished) {
      const stale = await tx.redirect.deleteMany({
        where: { fromPath: normalizePath(promoPath(data.slug)), source: "auto" },
      });
      if (stale.count > 0) changed = true;
    }
    return changed;
  });

  // Banner lama dibuang setelah simpan berhasil.
  if (previous?.bannerUrl && previous.bannerUrl !== data.bannerUrl) {
    await deleteImageByUrl(previous.bannerUrl).catch(() => {});
  }

  if (redirectsChanged) updateTag(CONTENT_TAGS.redirects);
  revalidatePromo(data.slug);
  redirect("/admin/promos?saved=1");
}

export async function deletePromoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const promo = await prisma.promo.delete({ where: { id } });
  if (promo.bannerUrl) {
    await deleteImageByUrl(promo.bannerUrl).catch(() => {});
  }

  revalidatePromo(promo.slug);
  redirect("/admin/promos?deleted=1");
}

export async function listPromos() {
  await requireSession();

  return prisma.promo.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getPromo(id: string) {
  await requireSession();

  return prisma.promo.findUnique({ where: { id } });
}
