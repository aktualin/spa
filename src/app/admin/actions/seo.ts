"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { journalPath } from "@/lib/domain/journal";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import {
  PUBLIC_STATIC_ROUTES,
  normalizeSeoPath,
  parseGscVerification,
  seoPathError,
} from "@/lib/domain/seo";
import { prisma } from "@/lib/prisma";

export type ActionState = { error: string | null; ok?: boolean };

const optionalUrl = z.union([z.string().trim().url("URL gambar tidak valid."), z.literal("")]).optional();

const seoSchema = z.object({
  path: z.string().trim(),
  title: z.string().trim().max(200, "Meta title maksimal 200 karakter.").optional(),
  description: z
    .string()
    .trim()
    .max(500, "Meta description maksimal 500 karakter.")
    .optional(),
  ogImageUrl: optionalUrl,
});

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

/** Perubahan SEO tampil tanpa redeploy: tag cache + seluruh layout publik. */
function revalidateSeo() {
  updateTag(CONTENT_TAGS.seo);
  revalidatePath("/admin/seo");
  revalidatePath("/", "layout");
}

export async function savePageSeoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = seoSchema.safeParse({
    path: formData.get("path") ?? "",
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
    ogImageUrl: formData.get("ogImageUrl") ?? undefined,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const pathError = seoPathError(parsed.data.path);
  if (pathError) return { error: pathError };

  const path = normalizeSeoPath(parsed.data.path);
  const { title, description, ogImageUrl } = parsed.data;
  const id = String(formData.get("id") ?? "");

  const clash = await prisma.pageSeo.findFirst({
    where: { path, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Path "${path}" sudah punya entri SEO lain.` };
  }

  const data = {
    path,
    title: title || null,
    description: description || null,
    ogImageUrl: ogImageUrl || null,
  };

  if (id) {
    await prisma.pageSeo.update({ where: { id }, data });
  } else {
    await prisma.pageSeo.create({ data });
  }

  revalidateSeo();
  redirect("/admin/seo?saved=1");
}

export async function deletePageSeoAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pageSeo.delete({ where: { id } });

  revalidateSeo();
  redirect("/admin/seo?deleted=1");
}

/* ---------- Pengaturan SEO global ---------- */

const settingsSchema = z.object({
  faviconUrl: optionalUrl,
  defaultOgImageUrl: optionalUrl,
});

/**
 * Menyimpan favicon, OG bawaan, dan verifikasi GSC. HANYA tiga kolom ini yang
 * ditulis — kolom `SiteSettings` lain milik modul Kontak & Umum.
 */
export async function saveSeoSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = settingsSchema.safeParse({
    faviconUrl: formData.get("faviconUrl") ?? undefined,
    defaultOgImageUrl: formData.get("defaultOgImageUrl") ?? undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const gsc = parseGscVerification(String(formData.get("gscVerification") ?? ""));
  if (!gsc.ok) return { error: gsc.error };

  const data = {
    faviconUrl: parsed.data.faviconUrl || null,
    defaultOgImageUrl: parsed.data.defaultOgImageUrl || null,
    gscVerification: gsc.code,
  };

  // Kolom SiteSettings lain opsional/array, jadi baris singleton boleh dibuat
  // hanya dengan kolom SEO; bacaan kontak memakai fallback per kolom.
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  updateTag(CONTENT_TAGS.settings);
  revalidateSeo();
  revalidatePath("/admin/seo/settings");
  redirect("/admin/seo/settings?saved=1");
}

export async function getSeoSettingsForAdmin() {
  await requireSession();
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { gscVerification: true, faviconUrl: true, defaultOgImageUrl: true },
  });
  return {
    gscVerification: row?.gscVerification ?? "",
    faviconUrl: row?.faviconUrl ?? "",
    defaultOgImageUrl: row?.defaultOgImageUrl ?? "",
  };
}

/* ---------- Bacaan admin ---------- */

export async function listPageSeo() {
  await requireSession();
  return prisma.pageSeo.findMany({ orderBy: { path: "asc" } });
}

export async function getPageSeo(id: string) {
  await requireSession();
  return prisma.pageSeo.findUnique({ where: { id } });
}

export type SeoOverviewRow = {
  key: string;
  path: string;
  label: string;
  /** false = draf/tidak tayang (tidak masuk sitemap). */
  isPublic: boolean;
  /** Field SEO milik konten (seoTitle/seoDescription), bila ada. */
  contentSeo: { title: string | null; description: string | null } | null;
  /** Nilai cadangan bila SEO konten kosong (nama/ringkasan). */
  fallbackTitle: string | null;
  fallbackDescription: string | null;
  contentEditor: { label: string; href: string } | null;
  pageSeo: { id: string; title: string | null; description: string | null; ogImageUrl: string | null } | null;
};

export type SeoOverviewGroup = { key: string; label: string; rows: SeoOverviewRow[] };

/**
 * Semua halaman publik — tetap + dinamis dari DB — beserta sumber metanya.
 * Konten yang punya field SEO sendiri ditautkan ke editornya (tidak
 * diduplikasi di sini).
 */
export async function getSeoOverview(): Promise<{
  groups: SeoOverviewGroup[];
  orphans: SeoOverviewRow[];
}> {
  await requireSession();

  const [entries, categories, treatments, packages, posts, events, promos, pages, story] =
    await Promise.all([
      prisma.pageSeo.findMany({ orderBy: { path: "asc" } }),
      prisma.treatmentCategory.findMany({
        where: { kind: "TREATMENT" },
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true, description: true, isPublished: true, seoTitle: true, seoDescription: true },
      }),
      prisma.treatment.findMany({
        where: { category: { kind: "TREATMENT" } },
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          isPublished: true,
          seoTitle: true,
          seoDescription: true,
          category: { select: { slug: true, isPublished: true } },
        },
      }),
      prisma.package.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true, description: true, isPublished: true, seoTitle: true, seoDescription: true },
      }),
      prisma.journalPost.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: { id: true, slug: true, title: true, excerpt: true, status: true, publishedAt: true, seoTitle: true, seoDescription: true },
      }),
      prisma.eventItem.findMany({
        orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
        select: { id: true, slug: true, title: true, description: true, isPublished: true, seoTitle: true, seoDescription: true },
      }),
      prisma.promo.findMany({
        orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }],
        select: { id: true, slug: true, title: true, description: true, isPublished: true, endDate: true, seoTitle: true, seoDescription: true },
      }),
      prisma.staticPage.findMany({
        orderBy: { slug: "asc" },
        select: { id: true, slug: true, title: true, status: true, seoTitle: true, seoDescription: true },
      }),
      prisma.ourStoryContent.findUnique({
        where: { id: "singleton" },
        select: { seoTitle: true, seoDescription: true },
      }),
    ]);

  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const used = new Set<string>();
  const now = new Date();

  const row = (
    input: Omit<SeoOverviewRow, "pageSeo" | "key"> & { key?: string },
  ): SeoOverviewRow => {
    const path = normalizeSeoPath(input.path);
    const entry = byPath.get(path);
    if (entry) used.add(path);
    return {
      ...input,
      key: input.key ?? path,
      path,
      pageSeo: entry
        ? { id: entry.id, title: entry.title, description: entry.description, ogImageUrl: entry.ogImageUrl }
        : null,
    };
  };

  const groups: SeoOverviewGroup[] = [
    {
      key: "static",
      label: "Halaman tetap",
      rows: PUBLIC_STATIC_ROUTES.map((route) =>
        row({
          path: route.path,
          label: route.label,
          isPublic: true,
          contentSeo:
            route.path === "/our-story"
              ? { title: story?.seoTitle ?? null, description: story?.seoDescription ?? null }
              : null,
          fallbackTitle: null,
          fallbackDescription: null,
          contentEditor: route.contentEditor ?? null,
        }),
      ),
    },
    {
      key: "categories",
      label: "Kategori treatment",
      rows: categories.map((c) =>
        row({
          path: `/treatments/${c.slug}`,
          label: c.name,
          isPublic: c.isPublished,
          contentSeo: { title: c.seoTitle, description: c.seoDescription },
          fallbackTitle: c.name,
          fallbackDescription: c.description,
          contentEditor: { label: "Editor kategori", href: `/admin/treatments/categories/${c.id}` },
        }),
      ),
    },
    {
      key: "treatments",
      label: "Treatment",
      rows: treatments.map((t) =>
        row({
          path: `/treatments/${t.category.slug}/${t.slug}`,
          label: t.name,
          isPublic: t.isPublished && t.category.isPublished,
          contentSeo: { title: t.seoTitle, description: t.seoDescription },
          fallbackTitle: t.name,
          fallbackDescription: t.description,
          contentEditor: { label: "Editor treatment", href: `/admin/treatments/${t.id}` },
        }),
      ),
    },
    {
      key: "packages",
      label: "Package",
      rows: packages.map((p) =>
        row({
          path: `/treatments/packages/${p.slug}`,
          label: p.name,
          isPublic: p.isPublished,
          contentSeo: { title: p.seoTitle, description: p.seoDescription },
          fallbackTitle: p.name,
          fallbackDescription: p.description,
          contentEditor: { label: "Editor package", href: `/admin/treatments/packages/${p.id}` },
        }),
      ),
    },
    {
      key: "journal",
      label: "Artikel journal",
      rows: posts.map((post) =>
        row({
          path: journalPath(post.slug),
          label: post.title,
          isPublic: post.status === "PUBLISHED" && !!post.publishedAt && post.publishedAt <= now,
          contentSeo: { title: post.seoTitle, description: post.seoDescription },
          fallbackTitle: post.title,
          fallbackDescription: post.excerpt,
          contentEditor: { label: "Editor artikel", href: `/admin/journal/${post.id}` },
        }),
      ),
    },
    {
      key: "events",
      label: "Event",
      rows: events.map((e) =>
        row({
          path: `/events/${e.slug}`,
          label: e.title,
          isPublic: e.isPublished,
          contentSeo: { title: e.seoTitle, description: e.seoDescription },
          fallbackTitle: e.title,
          fallbackDescription: e.description,
          contentEditor: { label: "Editor event", href: `/admin/events/${e.id}` },
        }),
      ),
    },
    {
      key: "promos",
      label: "Promo",
      rows: promos.map((p) =>
        row({
          path: `/promos/${p.slug}`,
          label: p.title,
          isPublic: p.isPublished && (!p.endDate || p.endDate >= now),
          contentSeo: { title: p.seoTitle, description: p.seoDescription },
          fallbackTitle: p.title,
          fallbackDescription: p.description,
          contentEditor: { label: "Editor promo", href: `/admin/promos/${p.id}` },
        }),
      ),
    },
    {
      key: "pages",
      label: "Halaman (Halaman & URL)",
      rows: pages.map((p) =>
        row({
          path: `/${p.slug}`,
          label: p.title,
          isPublic: p.status === "PUBLISHED",
          contentSeo: { title: p.seoTitle, description: p.seoDescription },
          fallbackTitle: p.title,
          fallbackDescription: null,
          contentEditor: { label: "Editor halaman", href: `/admin/pages/${p.id}` },
        }),
      ),
    },
  ];

  // Entri PageSeo yang path-nya tidak cocok dengan halaman mana pun di atas
  // (mis. /menu/<slug>, atau halaman yang slug-nya sudah berubah).
  const orphans: SeoOverviewRow[] = entries
    .filter((entry) => !used.has(entry.path))
    .map((entry) =>
      row({
        path: entry.path,
        label: entry.path,
        isPublic: true,
        contentSeo: null,
        fallbackTitle: null,
        fallbackDescription: null,
        contentEditor: null,
      }),
    );

  return { groups, orphans };
}
