import { membershipServices } from "../membership-services.ts";

/* ---------- Membership ---------- */

export const membership = {
  eyebrow: "Membership",
  title:
    "Lebih dari sekadar keanggotaan — ini gerbang menuju gaya hidup spa yang habitual dan holistic.",
  intro:
    "Pastikan waktu me-time Anda selalu tercatat. Setiap bulan Anda mendapat kredit untuk satu essential service, harga yang lebih ringan, serta penawaran khusus untuk anggota KAMA.",
  price: "Just Rp 1.5jt a month.",
  benefits: [
    {
      title: "Satu essential service setiap bulan",
      body: "Satu layanan dari daftar Essential Services kami sudah termasuk dalam harga keanggotaan. Nikmati tanpa perlu berpikir panjang.",
    },
    {
      title: "Layanan tambahan dengan harga anggota",
      body: "Seluruh essential service berikutnya tersedia dengan harga yang lebih ringan, jadi meningkatkan rutinitas Anda kapan saja menjadi mudah.",
    },
    {
      title: "Diskon untuk seluruh menu",
      body: "Nikmati harga khusus anggota untuk semua treatment, termasuk paket All Day Spa dan ritual wajah.",
    },
    {
      title: "10% off produk retail",
      body: "Hemat saat membeli produk kualitas tinggi untuk rutinitas perawatan di rumah Anda.",
    },
  ],
  servicesIntro:
    "Dengan menjadi anggota, Anda mendapat akses eksklusif ke essential services KAMA — treatment yang disesuaikan dengan kebutuhan wellness Anda.",
  services: membershipServices,
  plans: [
    {
      name: "Individual",
      price: "Rp 1,5jt",
      billed: "Ditagihkan bulanan",
      note: "Pilihan paling populer, khusus untuk Anda.",
      features: [
        "Satu essential service setiap bulan sudah termasuk dalam harga keanggotaan",
        "Tanpa komitmen jangka panjang",
        "Layanan essential tambahan dengan harga anggota",
        "Diskon signifikan pada seluruh paket All Day Spa",
        "Kredit dapat dibagikan dengan biaya tambahan Rp 100rb",
        "10% off pembelian produk retail",
        "Bonus Rp 250rb saat mengajak anggota baru",
        "Benefit ulang tahun: add-on gratis hingga Rp 250rb",
      ],
    },
    {
      name: "Keluarga",
      price: "Rp 1,5jt",
      billed: "Ditagihkan bulanan",
      note: "Semua yang ada di paket Individual, plus tambahan untuk keluarga.",
      features: [
        "Semua benefit paket Individual",
        "Harga diskon untuk seluruh menu treatment",
        "Biaya pendaftaran sekali bayar Rp 290rb untuk maksimal tiga anggota keluarga",
        "Benefit ulang tahun untuk setiap anggota keluarga",
        "Hari perpisahan dan acara khusus anggota",
      ],
    },
    {
      name: "Tim KAMA",
      price: "Custom",
      billed: "Disesuaikan untuk perusahaan",
      note: "Pastikan tim Anda punya kehidupan wellness yang utuh.",
      features: [
        "Keanggotaan untuk seluruh tim dengan harga khusus",
        "Jalur prioritas pemesanan dan penjadwalan bersama",
        "Program wellness on-site dan pengalaman bersama tim",
        "Ringkasan wellness tim untuk perusahaan",
      ],
    },
  ],
};