import type { PolicySection } from "./privacy-policy.ts";

/* ---------- Terms & conditions ---------- */

export const termsConditions: { intro: string; sections: PolicySection[] } = {
  intro:
    "Selamat datang di platform KAMA Spa (“KAMA”). Dengan mengakses atau menggunakan situs web ini, Anda menyetujui ketentuan penggunaan berikut.",
  sections: [
    {
      title: "Ketentuan Penggunaan",
      paragraphs: [
        "Anda menyatakan bahwa berusia minimal 17 tahun. Anda bertanggung jawab memastikan penggunaan layanan kami sesuai dengan hukum dan peraturan yang berlaku.",
        "Konten, teks, gambar, dan materi di dalam situs ini dilindungi oleh hak kekayaan intelektual. Penggunaan konten yang tidak diizinkan dapat berujung pada penghentian akses Anda.",
        "Tautan ke situs pihak ketiga disediakan semata-mata untuk kenyamanan dan bukan sebagai endorsements. KAMA tidak bertanggung jawab atas isi maupun keakuratan situs di luar.",
      ],
    },
    {
      title: "Reservasi dan Jadwal",
      paragraphs: [
        "Reservasi dapat dibuat melalui WhatsApp, telepon, atau formulir di situs ini. Jadwal yang dikonfirmasi berlaku untuk tamu yang hadir pada waktu yang telah disepakati.",
        "Permintaan pembatalan atau perubahan jadwal perlu disampaikan sesuai kebijakan pembatalan yang berlaku.",
      ],
    },
    {
      title: "Kebijakan Pembatalan",
      paragraphs: [
        "Kami memerlukan pemberitahuan 24 jam untuk membatalkan janji, dan nomor kartu kredit diperlukan untuk menahan reservasi.",
        "Reservasi grup berisi 3 orang atau lebih wajib dibatalkan 72 jam sebelumnya. Janji yang terlewat akan dibebankan penuh, sedangkan pembatalan dalam rentang 24 jam akan dibebankan 50% dari biaya layanan.",
        "Kami berhak membatalkan atau menunda layanan bila terjadi keadaan kahar, dan dalam hal tersebut akan menginformasikan Anda secepatnya.",
      ],
    },
    {
      title: "Pembayaran",
      paragraphs: [
        "Harga tercantum dalam Rupiah dan belum termasuk pajak pemerintah sebesar 10%. Metode pembayaran yang diterima dapat langsung saat konfirmasi reservasi.",
        "Kartu kredit yang dipakai untuk menahan reservasi hanya digunakan untuk keperluan pembatalan atau no-show.",
      ],
    },
    {
      title: "Perlakuan yang Diharapkan",
      paragraphs: [
        "Kami menjunjung tinggi privasi dan ketenangan setiap tamu. Kami meminta ponsel dimatikan selama layanan berlangsung dan anak-anak tidak mendampingi tamu lain.",
        "Perilaku yang mengganggu, sikap yang tidak sopan, atau penolakan terhadap arahan terapis dapat menyebabkan layanan dihentikan tanpa refund.",
      ],
    },
    {
      title: "Hazard & Keselamatan",
      paragraphs: [
        "Anda wajib menyampaikan kondisi medis, alergi, kehamilan, atau kondisi lain yang relevan sebelum layanan dimulai. Kami tidak bertanggung jawab atas kondisi yang belum kami ketahui sebelumnya.",
        "Barang bawaan yang hilang atau rusak berada di luar tanggung jawab kami, kecuali kerusakan yang disebabkan oleh kelalaian pihak kami.",
      ],
    },
    {
      title: "Perubahan atas Ketentuan Ini",
      paragraphs: [
        "Kami berhak memperbarui ketentuan ini kapan saja. Perubahan akan dipublikasikan di situs ini dan berlaku sejak tanggal pencantuman di atas.",
      ],
    },
    {
      title: "Hubungi Kami",
      paragraphs: [
        "Untuk pertanyaan mengenai ketentuan ini, hubungi kami di hello@kamaspa.id atau +62 813-1605-2040, atau datang ke KAMA Spa di Kramat Pela, Jakarta Selatan.",
      ],
    },
  ],
};