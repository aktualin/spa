/** Bawaan SEO per route tetap: our story, journal, galeri, event, retail, gift card, kontak, reservasi. */
import type { PageSeoDefaults } from "./seo.pages.ts";

export const PAGE_SEO_DATA_CONTENT: Readonly<Record<string, PageSeoDefaults>> = {
  "/our-story": {
    title: "Cerita & Filosofi di Balik KAMA",
    description:
      "Kenali perjalanan dan filosofi KAMA Spa — perpaduan teknik penyembuhan tradisional Nusantara dengan pendekatan wellness modern di jantung South Jakarta.",
    keywords: ["tentang KAMA Spa", "filosofi spa", "wellness sanctuary", "cerita brand spa"],
  },
  "/our-story/journal": {
    title: "Journal Wellness & Spa",
    description:
      "Artikel seputar wellness, self-care, dan perawatan spa dari KAMA Spa: tips relaksasi, manfaat massage, ritual tradisional, dan panduan hidup seimbang.",
    keywords: ["blog wellness", "artikel spa", "tips self care", "manfaat massage"],
  },
  "/gallery": {
    title: "Galeri Suasana Spa Jakarta",
    description:
      "Intip suasana KAMA Spa lewat galeri foto — interior treatment room, detail ritual, dan atmosfer tenang wellness sanctuary kami di Jakarta Selatan.",
    keywords: ["galeri spa", "foto spa Jakarta", "suasana spa", "interior spa"],
  },
  "/events": {
    title: "Event & Workshop Wellness",
    description:
      "Ikuti event dan workshop wellness KAMA Spa: sound healing, kelas mindfulness, dan kolaborasi komunitas. Cek jadwal terdekat dan daftar lewat WhatsApp.",
    keywords: ["event wellness Jakarta", "workshop spa", "sound healing Jakarta", "event self care"],
  },
  "/events/collaborations": {
    title: "Kolaborasi & Partnership",
    description:
      "Kolaborasi KAMA Spa dengan brand, komunitas, dan kreator wellness — dari pop-up event sampai co-created treatment. Ajukan ide kolaborasi via tim marketing.",
    keywords: ["kolaborasi brand", "partnership spa", "co-created treatment", "kolaborasi wellness"],
  },
  "/retail": {
    title: "Produk Retail Spa & Wellness",
    description:
      "Bawa pulang ritual KAMA Spa: koleksi produk retail kami — essential oil, body care, dan aromatherapy pilihan untuk merawat diri di rumah setiap hari.",
    keywords: ["produk spa", "essential oil Jakarta", "body care", "aromatherapy", "beli produk spa"],
  },
  "/gift-card": {
    title: "Gift Card Spa Jakarta",
    description:
      "Berikan hadiah relaksasi dengan gift card KAMA Spa — tersedia berbagai nominal untuk treatment apa pun, berlaku di semua cabang, dan bisa dikirim digital.",
    keywords: ["gift card spa", "voucher spa Jakarta", "hadiah spa", "kado relaksasi"],
  },
  "/contact": {
    title: "Kontak, Lokasi & Reservasi",
    description:
      "Hubungi KAMA Spa untuk reservasi dan informasi cabang. Temukan alamat, jam operasional, peta lokasi, dan link WhatsApp tiap cabang di halaman ini.",
    keywords: ["kontak spa Jakarta", "reservasi spa", "lokasi KAMA Spa", "cabang spa Jakarta Selatan"],
  },
  "/reservation": {
    title: "Reservasi Spa Jakarta Selatan",
    description:
      "Ajukan reservasi treatment KAMA Spa secara online — pilih cabang, tanggal, jam, dan jenis treatment. Tim kami mengonfirmasi jadwal Anda via WhatsApp.",
    keywords: ["reservasi spa Jakarta", "booking spa online", "jadwal treatment spa", "reservasi KAMA Spa"],
  },
};
