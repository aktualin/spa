/** Daftar halaman publik tetap untuk sitemap — lihat `seo.ts`. */
import { SEO_ROUTES_CONTENT } from "./seo.routes-content.ts";
import { SEO_ROUTES_MAIN } from "./seo.routes-main.ts";

/** Kunci stempel waktu `lastModified` sitemap untuk halaman tetap. */
export type SitemapStampKey =
  | "home"
  | "catalog"
  | "promos"
  | "membership"
  | "corporate"
  | "story"
  | "journal"
  | "gallery"
  | "events"
  | "retail"
  | "giftCard"
  | "contact";

export type PublicStaticRoute = {
  path: string;
  label: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  group: SitemapStampKey;
  /** Halaman yang juga punya field SEO di modul kontennya. */
  contentEditor?: { label: string; href: string };
  /**
   * Modul admin yang mengisi isi halaman ini. Route bawaan punya template
   * sendiri di kode, jadi tidak bisa jadi baris `StaticPage`; daftar ini yang
   * memberi tahu admin ke mana harus pergi untuk mengubah isinya.
   */
  contentModules: readonly { label: string; href: string }[];
};

/** Route publik tetap (urutan = prioritas). /corporate-wellness redirect ke /corporate. */
export const PUBLIC_STATIC_ROUTES: readonly PublicStaticRoute[] = [
  ...SEO_ROUTES_MAIN,
  ...SEO_ROUTES_CONTENT,
];