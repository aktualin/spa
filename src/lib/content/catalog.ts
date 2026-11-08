/**
 * Bacaan publik katalog: kategori, treatment, opsi harga, dan package.
 *
 * Pola yang dipakai seluruh `src/lib/content/*`:
 * 1. `"use cache"` + `cacheTag(CONTENT_TAGS.x)` — admin memanggil
 *    `updateTag(CONTENT_TAGS.x)` setelah menulis.
 * 2. Prisma di-import dinamis di dalam `safeQueryWithMeta`, jadi env yang
 *    belum diset / DB down tidak pernah membuat halaman crash.
 * 3. DB kosong atau tidak terjangkau → data statis `src/data/*`, dan
 *    `cacheLife("minutes")` supaya fallback tidak tertahan lama di cache (profil
 *    `seconds` terlalu pendek: Next menolak mem-prerender halamannya).
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  packages as staticPackages,
  treatments as staticTreatments,
  type Package as StaticPackage,
  type Treatment as StaticTreatment,
} from "@/data/content";
import { parseDurationLabel, parsePriceLabel } from "@/lib/domain/pricing";
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
  description: string | null;
  imageUrl: string | null;
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
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  treatments: CatalogTreatment[];
};

export type CatalogPackage = {
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  durationMin: number | null;
  priceIdr: number;
  items: { label: string; treatmentSlug: string | null }[];
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

/* ---------- fallback statis (taksonomi sama dengan scripts/seed.mts) ---------- */

const REFLEXOLOGY_SLUGS = new Set([
  "chair-reflexology",
  "chair-spa",
  "chair-body-recovery",
]);

function staticTreatmentToCatalog(t: StaticTreatment): CatalogTreatment {
  const reflexology = REFLEXOLOGY_SLUGS.has(t.slug);
  return {
    slug: t.slug,
    name: t.name,
    description: t.description,
    imageUrl: t.image,
    isNew: false,
    isBestSeller: false,
    categorySlug: reflexology ? "reflexology" : "body-massage",
    categoryName: reflexology ? "Reflexology" : "Body Massage",
    options: t.prices.map((p) => ({
      label: p.duration,
      durationMin: parseDurationLabel(p.duration),
      priceIdr: parsePriceLabel(p.price),
    })),
    seoTitle: null,
    seoDescription: t.tagline ?? null,
    whatsappMessage: null,
  };
}

function staticPackageToCatalogTreatment(p: StaticPackage): CatalogTreatment {
  return {
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.image,
    isNew: false,
    isBestSeller: false,
    categorySlug: "all-day-spa",
    categoryName: "All Day Spa",
    options: [
      {
        label: p.duration,
        durationMin: parseDurationLabel(p.duration),
        priceIdr: parsePriceLabel(p.price),
      },
    ],
    seoTitle: null,
    seoDescription: p.subtitle,
    whatsappMessage: null,
  };
}

function staticCatalog(): CatalogCategory[] {
  const all = [
    ...staticTreatments.map(staticTreatmentToCatalog),
    ...staticPackages.map(staticPackageToCatalogTreatment),
  ];
  const categories = [
    { slug: "reflexology", name: "Reflexology" },
    { slug: "body-massage", name: "Body Massage" },
    { slug: "all-day-spa", name: "All Day Spa" },
  ];
  return categories.map((c) => ({
    ...c,
    description: null,
    seoTitle: null,
    seoDescription: null,
    treatments: all.filter((t) => t.categorySlug === c.slug),
  }));
}

function staticPackagesList(): CatalogPackage[] {
  return staticPackages.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.image,
    durationMin: parseDurationLabel(p.duration) || null,
    priceIdr: parsePriceLabel(p.price),
    items: p.includes.map((i) => ({
      label: `${i.label} (${i.minutes} min)`,
      treatmentSlug: null,
    })),
    seoTitle: null,
    seoDescription: p.subtitle,
    whatsappMessage: null,
  }));
}

/* ---------- bacaan DB ---------- */

/** Seluruh kategori beserta treatment published-nya. */
export async function getCatalog(): Promise<CatalogCategory[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.catalog);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.treatmentCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        treatments: {
          where: { isPublished: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: { options: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    if (rows.length === 0) throw new Error("katalog kosong");
    return rows.map<CatalogCategory>((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      treatments: c.treatments.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        imageUrl: t.imageUrl,
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
    }));
  }, staticCatalog());

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

export async function getCategory(
  slug: string,
): Promise<CatalogCategory | null> {
  const catalog = await getCatalog();
  return catalog.find((c) => c.slug === slug) ?? null;
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
  const all = (await getCatalog()).flatMap((c) => c.treatments);
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
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { treatment: { select: { slug: true, name: true } } },
        },
      },
    });
    if (rows.length === 0) throw new Error("package kosong");
    return rows.map<CatalogPackage>((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      durationMin: p.durationMin,
      priceIdr: p.priceIdr,
      items: p.items.map((i) => ({
        label: i.label ?? i.treatment?.name ?? "",
        treatmentSlug: i.treatment?.slug ?? null,
      })),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      whatsappMessage: p.whatsappMessage,
    }));
  }, staticPackagesList());

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

export async function getPackage(slug: string): Promise<CatalogPackage | null> {
  return (await getPackages()).find((p) => p.slug === slug) ?? null;
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

/* ---------- overlay untuk halaman lama (/menu, /menu/[slug]) ---------- */

/** 145000 → "145k" — format harga yang dipakai desain halaman /menu. */
export function toPriceLabel(priceIdr: number): string {
  return priceIdr % 1000 === 0 ? `${priceIdr / 1000}k` : String(priceIdr);
}

/**
 * Treatment untuk halaman /menu dengan bentuk data statis yang sama persis,
 * sehingga tampilan tidak berubah. Nama/deskripsi/gambar/harga diambil dari DB
 * bila slug-nya ada; field yang tidak ada di DB (tagline, note) tetap statis.
 */
export async function getMenuTreatments(): Promise<StaticTreatment[]> {
  const bySlug = new Map(
    (await getCatalog()).flatMap((c) => c.treatments).map((t) => [t.slug, t]),
  );
  return staticTreatments.map((t) => {
    const db = bySlug.get(t.slug);
    if (!db) return t;
    return {
      ...t,
      name: db.name,
      description: db.description ?? t.description,
      image: db.imageUrl ?? t.image,
      prices:
        db.options.length > 0
          ? db.options.map((o) => ({
              duration: o.label,
              price: toPriceLabel(o.priceIdr),
            }))
          : t.prices,
    };
  });
}

/** Ritual All Day Spa untuk /menu, bentuk statis dengan harga dari DB. */
export async function getMenuPackages(): Promise<StaticPackage[]> {
  const bySlug = new Map(
    (await getCatalog()).flatMap((c) => c.treatments).map((t) => [t.slug, t]),
  );
  return staticPackages.map((p) => {
    const db = bySlug.get(p.slug);
    const option = db?.options[0];
    if (!db) return p;
    return {
      ...p,
      name: db.name,
      description: db.description ?? p.description,
      image: db.imageUrl ?? p.image,
      duration: option?.label ?? p.duration,
      price: option ? toPriceLabel(option.priceIdr) : p.price,
    };
  });
}

/**
 * Semua entri /menu (treatment + package) dalam bentuk statis, dengan isi
 * yang sudah ditimpa dari DB. Dipakai `/menu` dan `/menu/[slug]`.
 */
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
