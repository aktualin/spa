/** Bawaan SEO per route tetap: beranda, katalog, promo, membership, corporate. */
import type { PageSeoDefaults } from "./seo.pages.ts";

/**
 * Entri corporate dipakai dua kunci: `/corporate` dan path lama
 * `/corporate-wellness`. Halaman corporate memanggil `withPageSeo` dua kali
 * (inner `/corporate-wellness` untuk mewarisi override SEO lama), jadi tanpa
 * alias ini keywords route tidak pernah ikut ke hasil akhir.
 */
const CORPORATE: PageSeoDefaults = {
  title: "Corporate Wellness Jakarta",
  description:
    "Program corporate wellness KAMA Spa untuk perusahaan: on-site massage, paket employee wellness, dan kolaborasi brand. Hubungi tim marketing untuk proposal.",
  keywords: [
    "corporate wellness",
    "office massage Jakarta",
    "employee wellness",
    "wellness perusahaan",
  ],
};

export const PAGE_SEO_DATA_MAIN: Readonly<Record<string, PageSeoDefaults>> = {
  // Judul/deskripsi "/" datang dari konstanta root (DEFAULT_TITLE dst.);
  // entri ini hanya memasok keywords khusus beranda.
  "/": {
    keywords: [
      "spa Jakarta Selatan",
      "wellness sanctuary",
      "massage Jakarta",
      "day spa Jakarta",
    ],
  },
  "/treatments": {
    title: "Treatments Spa & Massage Jakarta",
    description:
      "Jelajahi koleksi treatments KAMA Spa: massage tradisional, body treatment, facial, hingga head & bath ritual. Cek durasi, manfaat, dan harga tiap treatment.",
    keywords: [
      "treatments spa",
      "massage Jakarta",
      "body treatment",
      "facial Jakarta",
      "harga spa Jakarta",
    ],
  },
  "/treatments/packages": {
    title: "Paket Spa & Massage Hemat",
    description:
      "Paket spa curated KAMA Spa untuk relaksasi menyeluruh — kombinasi massage, body treatment, dan ritual dengan harga paket yang lebih hemat dibanding satuan.",
    keywords: ["paket spa", "paket massage", "spa package Jakarta", "harga paket spa"],
  },
  "/menu": {
    title: "Menu & Harga Spa Lengkap",
    description:
      "Daftar menu lengkap KAMA Spa beserta durasi dan harganya — dari massage, body scrub, facial, head therapy, sampai bath ritual dan additional services.",
    keywords: ["menu spa", "harga spa Jakarta", "daftar perawatan spa", "price list spa"],
  },
  "/promos": {
    title: "Promo Spa & Massage Terbaru",
    description:
      "Kumpulan promo terbaru KAMA Spa: potongan treatment, paket hemat, dan penawaran spesial member. Booking lewat WhatsApp, kuota promo terbatas tiap bulan.",
    keywords: ["promo spa", "promo massage Jakarta", "diskon spa", "penawaran spa"],
  },
  "/membership": {
    title: "Membership Spa di Jakarta",
    description:
      "Jadi member KAMA Spa dan nikmati harga khusus, prioritas booking, dan benefit eksklusif lainnya untuk perawatan rutin. Cek tier membership dan cara bergabung.",
    keywords: ["membership spa", "member spa Jakarta", "benefit member", "langganan spa"],
  },
  "/promos/membership": {
    title: "Promo Membership Spesial",
    description:
      "Promo khusus membership KAMA Spa — penawaran bergabung, upgrade tier, dan benefit eksklusif member untuk perawatan wellness rutin di Jakarta Selatan.",
    keywords: ["promo membership", "promo member spa", "diskon membership"],
  },
  "/corporate": CORPORATE,
  "/corporate-wellness": CORPORATE,
};
