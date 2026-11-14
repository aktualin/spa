/** Grup teks halaman: our story, journal, gift card — lihat `page-copy.ts`. */
import type { PageCopyGroup } from "./page-copy.types.ts";

export const STORY_GROUPS: readonly PageCopyGroup[] = [
  {
    group: "our_story",
    label: "Our Story",
    fields: [
      { key: "our_story.hero.eyebrow", label: "Eyebrow hero our story", type: "text", maxLength: 40 },
      { key: "our_story.hero.description", label: "Deskripsi hero our story", type: "textarea", maxLength: 300 },
      { key: "our_story.missing_title", label: "Judul konten belum tersedia", type: "text", maxLength: 80 },
      { key: "our_story.missing_description", label: "Deskripsi konten belum tersedia", type: "textarea", maxLength: 300 },
      { key: "our_story.philosophy_eyebrow", label: "Eyebrow Philosophy", type: "text", maxLength: 40 },
      { key: "our_story.philosophy_title", label: "Judul Philosophy", type: "text", maxLength: 80 },
      { key: "our_story.values_eyebrow", label: "Eyebrow Values", type: "text", maxLength: 40 },
      { key: "our_story.values_title", label: "Judul Values", type: "text", maxLength: 80 },
      { key: "our_story.journal_eyebrow", label: "Eyebrow Journal", type: "text", maxLength: 40 },
      { key: "our_story.journal_title", label: "Judul Journal", type: "text", maxLength: 80 },
      { key: "our_story.journal_description", label: "Deskripsi Journal", type: "textarea", maxLength: 240 },
      { key: "our_story.journal_cta", label: "Label Lihat semua journal", type: "text", maxLength: 40 },
    ],
  },
  {
    group: "journal",
    label: "Journal",
    fields: [
      { key: "journal.hero.eyebrow", label: "Eyebrow hero journal", type: "text", maxLength: 40 },
      { key: "journal.hero.title", label: "Judul hero journal", type: "text", maxLength: 120 },
      { key: "journal.hero.description", label: "Deskripsi hero journal", type: "textarea", maxLength: 300 },
      { key: "journal.loading", label: "Teks memuat journal", type: "text", maxLength: 40 },
      { key: "journal.all_label", label: "Label filter semua", type: "text", maxLength: 30 },
      { key: "journal.tag_label", label: "Label filter tag", type: "text", maxLength: 20 },
      { key: "journal.empty_title", label: "Judul journal kosong", type: "text", maxLength: 80 },
      { key: "journal.empty_filtered_title", label: "Judul filter journal kosong", type: "text", maxLength: 120 },
      { key: "journal.empty_description", label: "Deskripsi journal kosong", type: "textarea", maxLength: 300 },
      { key: "journal.detail.not_found_title", label: "Judul tulisan tidak ditemukan", type: "text", maxLength: 80 },
      { key: "journal.detail.loading_title", label: "Judul saat memuat tulisan", type: "text", maxLength: 80 },
      { key: "journal.detail.back_label", label: "Label kembali ke journal", type: "text", maxLength: 30 },
      { key: "journal.detail.empty_body", label: "Teks isi tulisan kosong", type: "textarea", maxLength: 240 },
      { key: "journal.detail.others_title", label: "Judul tulisan lainnya", type: "text", maxLength: 60 },
    ],
  },
  {
    group: "gift_card",
    label: "Gift Card",
    fields: [
      { key: "gift_card.hero.eyebrow", label: "Eyebrow hero gift card", type: "text", maxLength: 40 },
      { key: "gift_card.missing_title", label: "Judul gift card belum tersedia", type: "text", maxLength: 80 },
      { key: "gift_card.missing_description", label: "Deskripsi gift card belum tersedia", type: "textarea", maxLength: 240 },
      { key: "gift_card.order_label", label: "Label tombol pesan", type: "text", maxLength: 50 },
      { key: "gift_card.terms_title", label: "Judul syarat & ketentuan", type: "text", maxLength: 80 },
      { key: "gift_card.cta_title", label: "Judul banner CTA", type: "text", maxLength: 80 },
      { key: "gift_card.cta_description", label: "Deskripsi banner CTA", type: "textarea", maxLength: 240 },
      { key: "gift_card.cta_label", label: "Label tombol banner CTA", type: "text", maxLength: 50 },
    ],
  },
];