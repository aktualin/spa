/** Grup teks halaman: halaman statis & tujuan tautan — lihat `page-copy.ts`. */
import type { PageCopyGroup } from "./page-copy.types.ts";

export const PAGES_GROUPS: readonly PageCopyGroup[] = [
  {
    group: "pages",
    label: "Halaman statis",
    fields: [
      { key: "pages.header_eyebrow", label: "Eyebrow halaman statis", type: "text", maxLength: 40 },
      { key: "pages.empty_body", label: "Teks isi halaman kosong", type: "textarea", maxLength: 240 },
      { key: "pages.updated_label", label: "Label terakhir diperbarui", type: "text", maxLength: 40 },
      { key: "pages.not_found_title", label: "Judul halaman tidak ditemukan", type: "text", maxLength: 80 },
      { key: "pages.loading_title", label: "Judul saat memuat halaman", type: "text", maxLength: 80 },
    ],
  },
  {
    group: "links",
    label: "Tujuan tautan (CTA)",
    description: "Href tombol ajakan di halaman publik. Back-link & anchor section tetap mengikuti struktur routing.",
    fields: [
      { key: "home.hero.menu_href", label: "Hero — tujuan tautan menu", type: "text", maxLength: 500 },
      { key: "menu.booking_cta_href", label: "Menu — tujuan tombol booking", type: "text", maxLength: 500 },
      { key: "menu.detail_book_href", label: "Detail menu — tujuan tombol booking", type: "text", maxLength: 500 },
      { key: "contact.cta_href", label: "Kontak — tujuan tombol banner", type: "text", maxLength: 500 },
      { key: "membership.menu_href", label: "Membership — tujuan tombol menu", type: "text", maxLength: 500 },
      { key: "membership.contact_href", label: "Membership — tujuan banner kontak", type: "text", maxLength: 500 },
      { key: "promos.membership_href", label: "Promos — tujuan banner membership", type: "text", maxLength: 500 },
      { key: "promos.membership_menu_href", label: "Promos membership — tujuan tombol menu", type: "text", maxLength: 500 },
      { key: "gift_card.cta_href", label: "Gift Card — tujuan tombol CTA", type: "text", maxLength: 500 },
      { key: "events.collab_href", label: "Events — tujuan tombol kolaborasi", type: "text", maxLength: 500 },
      { key: "our_story.journal_href", label: "Our Story — tujuan tombol journal", type: "text", maxLength: 500 },
      { key: "corporate.privacy_href", label: "Corporate — tautan privacy form inquiry", type: "text", maxLength: 500 },
    ],
  },
];