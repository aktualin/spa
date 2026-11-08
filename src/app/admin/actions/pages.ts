"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { normalizePath, pagePath, planSlugRedirect, validatePageSlug } from "@/lib/domain/page-url";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "../pages/limits";
import { firstIssue, optionalText, text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const pageSchema = z.object({
  title: z.string().trim().min(1, "Judul halaman wajib diisi."),
  slug: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const message = validatePageSlug(value);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
  template: z.enum(["STANDARD", "LEGAL"], { message: "Template tidak dikenal." }),
  status: z.enum(["DRAFT", "PUBLISHED"], { message: "Status tidak dikenal." }),
  bodyHtml: z.string().optional().transform((value) => sanitizeHtml(value ?? "")),
  seoTitle: optionalText.refine(
    (value) => !value || value.length <= SEO_TITLE_MAX,
    `Meta title maksimal ${SEO_TITLE_MAX} karakter.`,
  ),
  seoDescription: optionalText.refine(
    (value) => !value || value.length <= SEO_DESCRIPTION_MAX,
    `Meta description maksimal ${SEO_DESCRIPTION_MAX} karakter.`,
  ),
});

const SLUG_TAKEN = "Slug sudah dipakai halaman lain.";

function revalidatePages(paths: string[], redirectsChanged: boolean) {
  updateTag(CONTENT_TAGS.pages);
  if (redirectsChanged) {
    updateTag(CONTENT_TAGS.redirects);
    revalidatePath("/admin/redirects");
  }
  revalidatePath("/admin/pages");
  // Item menu bertipe Halaman mengikuti slug & status halaman ini.
  revalidatePath("/admin/menu");
  revalidatePath("/sitemap.xml");
  for (const path of new Set(paths)) revalidatePath(path);
}

export async function savePageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");

  const parsed = pageSchema.safeParse({
    title: text(formData, "title") ?? "",
    slug: text(formData, "slug") ?? "",
    template: text(formData, "template"),
    status: text(formData, "status"),
    bodyHtml: text(formData, "bodyHtml"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }
  const data = parsed.data;

  const clash = await prisma.staticPage.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: SLUG_TAKEN };

  const previous = id
    ? await prisma.staticPage.findUnique({
        where: { id },
        select: { slug: true, publishedAt: true },
      })
    : null;
  if (id && !previous) {
    return { error: "Halaman tidak ditemukan. Mungkin sudah dihapus." };
  }

  const newPath = pagePath(data.slug);
  const oldPath = previous ? pagePath(previous.slug) : null;
  const publishedAt =
    previous?.publishedAt ?? (data.status === "PUBLISHED" ? new Date() : null);
  const needsSlugRedirect =
    previous !== null && previous.publishedAt !== null && previous.slug !== data.slug;

  let redirectsChanged = false;

  try {
    redirectsChanged = await prisma.$transaction(async (tx) => {
      let changed = false;
      const existing = await tx.redirect.findMany({
        select: { fromPath: true, toPath: true },
      });

      const deletes = new Set<string>();
      const upserts: { fromPath: string; toPath: string }[] = [];

      if (needsSlugRedirect && oldPath) {
        const plan = planSlugRedirect(existing, oldPath, newPath);
        plan.deletes.forEach((path) => deletes.add(path));
        upserts.push(...plan.upserts);
      }
      // Halaman terbit merebut kembali URL-nya: redirect dari alamat ini akan menutupi halaman.
      if (data.status === "PUBLISHED") {
        existing
          .filter((r) => normalizePath(r.fromPath) === newPath)
          .forEach((r) => deletes.add(r.fromPath));
      }

      if (deletes.size > 0) {
        await tx.redirect.deleteMany({ where: { fromPath: { in: [...deletes] } } });
        changed = true;
      }

      const note = `Slug halaman "${data.title}" diubah`;
      for (const rule of upserts) {
        await tx.redirect.upsert({
          where: { fromPath: rule.fromPath },
          create: {
            fromPath: rule.fromPath,
            toPath: rule.toPath,
            statusCode: 301,
            source: "auto",
            note,
          },
          // Redirect yang sudah ada (bisa manual) hanya diarahkan ulang; asal & catatannya dipertahankan.
          update: { toPath: rule.toPath, statusCode: 301 },
        });
        changed = true;
      }

      const values = { ...data, publishedAt };
      if (id) {
        await tx.staticPage.update({ where: { id }, data: values });
      } else {
        await tx.staticPage.create({ data: values });
      }
      return changed;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: SLUG_TAKEN };
    }
    throw error;
  }

  revalidatePages(oldPath ? [oldPath, newPath] : [newPath], redirectsChanged);
  redirect("/admin/pages?saved=1");
}

export async function deletePageAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const page = await prisma.staticPage.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!page) redirect("/admin/pages?deleted=1");

  const path = pagePath(page.slug);

  // Redirect yang menuju halaman ini ikut dihapus agar tidak mengarah ke 404.
  const removed = await prisma.$transaction(async (tx) => {
    const pointing = (
      await tx.redirect.findMany({ select: { fromPath: true, toPath: true } })
    ).filter((r) => r.toPath.startsWith("/") && normalizePath(r.toPath) === path);

    if (pointing.length > 0) {
      await tx.redirect.deleteMany({
        where: { fromPath: { in: pointing.map((r) => r.fromPath) } },
      });
    }
    await tx.staticPage.delete({ where: { id } });
    return pointing.length;
  });

  revalidatePages([path], removed > 0);
  redirect(`/admin/pages?deleted=1${removed > 0 ? `&cleaned=${removed}` : ""}`);
}

export async function listPages() {
  await requireRole(CONTENT_ROLES);

  return prisma.staticPage.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      template: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function getPage(id: string) {
  await requireRole(CONTENT_ROLES);

  return prisma.staticPage.findUnique({
    where: { id },
    include: { _count: { select: { menuItems: true } } },
  });
}
