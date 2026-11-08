/**
 * Override SEO per halaman statis (`PageSeo`, modul 13).
 *
 * `path` disimpan apa adanya, mis. "/treatments" atau "/our-story/journal".
 * DB kosong/down → null, sehingga metadata default halaman yang dipakai.
 */
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type PageSeoOverride = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === "" || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "");
}

export async function getPageSeo(path: string): Promise<PageSeoOverride | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.seo);

  const { data } = await safeQueryWithMeta<PageSeoOverride | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.pageSeo.findUnique({
        where: { path: normalizePath(path) },
        select: { title: true, description: true, ogImageUrl: true },
      });
      if (!row) return null;
      return {
        title: row.title?.trim() || null,
        description: row.description?.trim() || null,
        ogImageUrl: row.ogImageUrl?.trim() || null,
      };
    },
    null,
  );

  // Umur cache tetap panjang: `PageSeo` jarang berubah, dan override yang
  // kosong tidak boleh membuat halaman lama kehilangan judulnya.
  cacheLife("hours");
  return data;
}

/**
 * Menggabungkan metadata default halaman dengan override `PageSeo`.
 * Field override yang kosong tidak menimpa default.
 */
export async function withPageSeo(
  path: string,
  defaults: Metadata,
): Promise<Metadata> {
  const seo = await getPageSeo(path);
  if (!seo) return defaults;

  const merged: Metadata = { ...defaults };
  if (seo.title) merged.title = seo.title;
  if (seo.description) merged.description = seo.description;

  if (seo.title || seo.description || seo.ogImageUrl) {
    merged.openGraph = {
      ...(defaults.openGraph ?? {}),
      ...(seo.title ? { title: seo.title } : {}),
      ...(seo.description ? { description: seo.description } : {}),
      ...(seo.ogImageUrl ? { images: [{ url: seo.ogImageUrl }] } : {}),
    };
  }
  return merged;
}
