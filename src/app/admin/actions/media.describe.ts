import { CONTENT_TAGS } from "@/lib/content/tags";
import { publicUrlFor } from "@/lib/storage";

// ---------------------------------------------------------------------------
// Akses dinamis ke delegate Prisma berdasarkan nama model di MEDIA_URL_COLUMNS
// dan MEDIA_HTML_COLUMNS. Nama model berasal dari konstanta, bukan input user.
// ---------------------------------------------------------------------------

export type Row = Record<string, unknown>;
type AnyDelegate = {
  findMany(args: object): Promise<Row[]>;
  updateMany(args: object): Promise<{ count: number }>;
};

export function delegateOf(client: unknown, model: string): AnyDelegate {
  return (client as Record<string, AnyDelegate>)[model];
}

export const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Cara menampilkan & menautkan baris tiap model di daftar "Dipakai di". */
export const DESCRIBE: Record<string, { select: Record<string, true>; name: (r: Row) => string; href: (r: Row) => string }> = {
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
  instagramPost: { select: { id: true, imageAlt: true }, name: (r) => str(r.imageAlt) || "Foto feed Instagram", href: () => "/admin/homepage" },
  siteSettings: { select: { id: true }, name: () => "Pengaturan situs", href: () => "/admin/seo" },
};

export const strList = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/** Awalan URL publik bucket kita, mis. "https://…/storage/v1/object/public/bucket/". */
export function bucketPrefix(): string {
  return publicUrlFor("");
}

/** Tag konten publik yang mungkin memuat URL gambar. */
export const IMAGE_CONTENT_TAGS = [
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