/**
 * Bacaan publik katalog: kategori, treatment, add-on, opsi harga, dan package.
 *
 * Pola yang dipakai seluruh `src/lib/content/*`:
 * 1. `"use cache"` + `cacheTag(CONTENT_TAGS.x)` — admin memanggil
 *    `updateTag(CONTENT_TAGS.x)` setelah menulis.
 * 2. Prisma di-import dinamis di dalam `safeQueryWithMeta`, jadi env yang
 *    belum diset / DB down tidak pernah membuat halaman crash.
 * 3. Tabel kosong atau DB tidak terjangkau → daftar kosong (halaman memberi
 *    empty state), dan `cacheLife("minutes")` supaya keadaan itu tidak
 *    tertahan lama di cache (profil `seconds` terlalu pendek: Next menolak
 *    mem-prerender halamannya).
 */
import { cacheLife, cacheTag } from "next/cache";

import type {
  AdditionalService,
  Package as StaticPackage,
  Treatment as StaticTreatment,
} from "@/data/content";
import type { AddonSectionValue, CategoryKindValue } from "@/lib/domain/catalog-seed";
import { toMenuAddons, toMenuPackages, toMenuTreatments } from "@/lib/domain/menu-catalog";
import { formatPriceLabel } from "@/lib/domain/pricing";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type CatalogOption = {
  label: string;
  durationMin: number;
  priceIdr: number;
};

export type CatalogTreatment = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  note: string | null;
  imageUrl: string | null;
  addonSection: AddonSectionValue | null;
  isNew: boolean;
  isBestSeller: boolean;
  categorySlug: string;
  categoryName: string;
  options: CatalogOption[];
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

export type CatalogCategory = {
  slug: string;
  name: string;
  kind: CategoryKindValue;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  treatments: CatalogTreatment[];
};

export type CatalogPackageItem = {
  /** Teks tampil, mis. "Body Massage (90 min)". */
  label: string;
  name: string;
  minutes: number | null;
  treatmentSlug: string | null;
};

export type CatalogPackage = {
  slug: string;
  name: string;
  subtitle: string | null;
  quote: string | null;
  description: string | null;
  imageUrl: string | null;
  durationMin: number | null;
  durationLabel: string | null;
  priceIdr: number;
  isNew: boolean;
  isBestSeller: boolean;
  items: CatalogPackageItem[];
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

function itemLabel(name: string, minutes: number | null): string {
  return minutes ? `${name} (${minutes} min)` : name;
}

/* ---------- bacaan DB ---------- */

const CATEGORY_INCLUDE = {
  treatments: {
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
    include: { options: { orderBy: { sortOrder: "asc" as const } } },
  },
};

type CategoryRow = {
  slug: string;
  name: string;
  kind: CategoryKindValue;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  treatments: {
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    note: string | null;
    imageUrl: string | null;
    addonSection: AddonSectionValue | null;
    isNew: boolean;
    isBestSeller: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    whatsappMessage: string | null;
    options: { label: string; durationMin: number; priceIdr: number }[];
  }[];
};

function toCatalogCategory(c: CategoryRow): CatalogCategory {
  return {
    slug: c.slug,
    name: c.name,
    kind: c.kind,
    description: c.description,
    imageUrl: c.imageUrl,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    treatments: c.treatments.map((t) => ({
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      note: t.note,
      imageUrl: t.imageUrl,
      addonSection: t.addonSection,
      isNew: t.isNew,
      isBestSeller: t.isBestSeller,
      categorySlug: c.slug,
      categoryName: c.name,
      options: t.options.map((o) => ({
        label: o.label,
        durationMin: o.durationMin,
        priceIdr: o.priceIdr,
      })),
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
      whatsappMessage: t.whatsappMessage,
    })),
  };
}

const PACKAGE_INCLUDE = {
  items: {
    orderBy: { sortOrder: "asc" as const },
    include: { treatment: { select: { slug: true, name: true } } },
  },
};

type PackageRow = {
  slug: string;
  name: string;
  subtitle: string | null;
  quote: string | null;
  description: string | null;
  imageUrl: string | null;
  durationMin: number | null;
  durationLabel: string | null;
  priceIdr: number;
  isNew: boolean;
  isBestSeller: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
  items: {
    label: string | null;
    minutes: number | null;
    treatment: { slug: string; name: string } | null;
  }[];
};

function toCatalogPackage(p: PackageRow): CatalogPackage {
  return {
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    quote: p.quote,
    description: p.description,
    imageUrl: p.imageUrl,
    durationMin: p.durationMin,
    durationLabel: p.durationLabel,
    priceIdr: p.priceIdr,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    items: p.items.map((i) => {
      const name = i.label ?? i.treatment?.name ?? "";
      return {
        label: itemLabel(name, i.minutes),
        name,
        minutes: i.minutes,
        treatmentSlug: i.treatment?.slug ?? null,
      };
    }),
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    whatsappMessage: p.whatsappMessage,
  };
}

/** Kategori yang tampil beserta treatment published-nya. */
export async function getCatalog(): Promise<CatalogCategory[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.treatmentCategory.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: CATEGORY_INCLUDE,
    });
    return rows.map(toCatalogCategory);
  }, []);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/**
 * Satu kategori. Sengaja di-cache per slug dan membaca DB langsung — bukan
 * menyaring getCatalog(): halaman detail untuk slug yang belum ada saat build
 * dilanjutkan dari shell hasil build beserta cache-nya, sehingga data daftar
 * penuh di sana masih versi build dan kategori baru dari admin menjadi 404.
 */
export async function getCategory(slug: string): Promise<CatalogCategory | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta<CatalogCategory | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.treatmentCategory.findFirst({
        where: { slug, isPublished: true },
        include: CATEGORY_INCLUDE,
      });
      return row ? toCatalogCategory(row) : null;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

export async function getTreatment(
  categorySlug: string,
  treatmentSlug: string,
): Promise<CatalogTreatment | null> {
  const category = await getCategory(categorySlug);
  return category?.treatments.find((t) => t.slug === treatmentSlug) ?? null;
}

/** Treatment ditandai `isBestSeller` — dipakai section Signature Treatments di homepage. */
export async function getSignatureTreatments(limit = 6): Promise<CatalogTreatment[]> {
  const all = (await getCatalog())
    .filter((c) => c.kind === "TREATMENT")
    .flatMap((c) => c.treatments);
  const flagged = all.filter((t) => t.isBestSeller);
  return (flagged.length > 0 ? flagged : all).slice(0, limit);
}

export async function getPackages(): Promise<CatalogPackage[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.package.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: PACKAGE_INCLUDE,
    });
    return rows.map(toCatalogPackage);
  }, []);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Satu package, di-cache per slug (alasannya sama dengan getCategory). */
export async function getPackage(slug: string): Promise<CatalogPackage | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta<CatalogPackage | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.package.findFirst({
        where: { slug, isPublished: true },
        include: PACKAGE_INCLUDE,
      });
      return row ? toCatalogPackage(row) : null;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Semua treatment (published) dari seluruh kategori, beserta kategorinya. */
export async function getAllTreatments(): Promise<CatalogTreatment[]> {
  return (await getCatalog()).flatMap((c) => c.treatments);
}

/** Treatment dengan slug tertentu di kategori mana pun. */
export async function getTreatmentBySlug(
  slug: string,
): Promise<CatalogTreatment | null> {
  return (await getAllTreatments()).find((t) => t.slug === slug) ?? null;
}

/**
 * Slug untuk `generateStaticParams`: kategori, treatment, dan package.
 * Ambil dari DB bila bisa; kalau tidak, dari data statis.
 */
export async function getCatalogSlugs(): Promise<{
  categories: string[];
  treatments: { categorySlug: string; treatmentSlug: string }[];
  packages: string[];
}> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);
  cacheLife("hours");

  const categories = await getCatalog();
  const packs = await getPackages();

  return {
    categories: categories.map((c) => c.slug),
    treatments: categories.flatMap((c) =>
      c.treatments.map((t) => ({
        categorySlug: c.slug,
        treatmentSlug: t.slug,
      })),
    ),
    packages: packs.map((p) => p.slug),
  };
}

/* ---------- halaman /menu (desain asli situs) ---------- */

/** 145000 → "145k" — format harga yang dipakai desain halaman /menu. */
export const toPriceLabel = formatPriceLabel;

/** Treatment untuk grid /menu, dalam bentuk data statis lama (markup tidak berubah). */
export async function getMenuTreatments(): Promise<StaticTreatment[]> {
  return toMenuTreatments(await getCatalog());
}

/** Ritual All Day Spa untuk /menu, dari tabel Package. */
export async function getMenuPackages(): Promise<StaticPackage[]> {
  return toMenuPackages(await getPackages());
}

/** Add-on untuk section Body/Face/Head & Scalp/Bath di /menu. */
export async function getMenuAddons(): Promise<AdditionalService[]> {
  return toMenuAddons(await getCatalog());
}

/** Semua entri /menu (treatment + package). Dipakai `/menu` dan `/menu/[slug]`. */
export async function getMenuEntries(): Promise<(StaticTreatment | StaticPackage)[]> {
  const [treatments, packages] = await Promise.all([
    getMenuTreatments(),
    getMenuPackages(),
  ]);
  return [...treatments, ...packages];
}

/**
 * Versi cached panjang dari `getMenuEntries`.
 *
 * Dipakai di `generateMetadata` supaya judul halaman tetap ikut bisa
 * di-prerender (umur cache eksplisit mencegah cache pendek di dalamnya
 * menjadi "dynamic hole").
 */
export async function getMenuEntriesCached(): Promise<
  (StaticTreatment | StaticPackage)[]
> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);
  cacheLife("hours");
  return getMenuEntries();
}

/**
 * Satu entri /menu/[slug] (treatment utama atau package), di-cache per slug
 * supaya item baru dari admin tidak 404 (lihat getCategory).
 */
export async function getMenuEntry(
  slug: string,
): Promise<StaticTreatment | StaticPackage | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta<StaticTreatment | StaticPackage | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const treatment = await prisma.treatment.findFirst({
        where: {
          slug,
          isPublished: true,
          category: { isPublished: true, kind: "TREATMENT" },
        },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      });
      if (treatment) {
        return toMenuTreatments([{ kind: "TREATMENT", treatments: [treatment] }])[0] ?? null;
      }
      const pkg = await prisma.package.findFirst({
        where: { slug, isPublished: true },
        include: PACKAGE_INCLUDE,
      });
      return pkg ? toMenuPackages([toCatalogPackage(pkg)])[0] : null;
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Versi cached dari `getMenuAddons` untuk section add-on /menu. */
export async function getMenuAddonsCached(): Promise<AdditionalService[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);
  cacheLife("hours");
  return getMenuAddons();
}
