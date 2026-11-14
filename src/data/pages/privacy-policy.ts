/* ---------- Privacy policy ---------- */

export type PolicySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const privacyPolicy: { intro: string; sections: PolicySection[] } = {
  intro:
    "Selamat datang di platform KAMA Spa (“KAMA”). Dengan mengakses atau menggunakan situs web ini, Anda menyetujui penggunaan data pribadi Anda sesuai kebijakan privasi yang kami tetapkan di bawah ini.",
  sections: [
    {
      title: "Informasi yang Kami Kumpulkan",
      paragraphs: [
        "Kami mengumpulkan berbagai jenis informasi agar dapat memberikan layanan yang lebih baik dan relevan bagi Anda:",
      ],
      bullets: [
        "Informasi pribadi: nama, alamat email, nomor telepon, alamat, dan informasi preferensi yang Anda berikan saat membuat reservasi, melakukan pembelian, menghubungi kami, atau mengikuti promosi.",
        "Data penggunaan: halaman yang Anda kunjungi, fitur yang Anda gunakan, durasi kunjungan, dan perangkat yang Anda gunakan untuk mengakses layanan kami.",
        "Informasi perangkat: jenis perangkat, sistem operasi, jenis browser, dan alamat IP.",
      ],
    },
    {
      title: "Bagaimana Kami Menggunakan Informasi Anda",
      paragraphs: ["Informasi Anda digunakan untuk tujuan berikut:"],
      bullets: [
        "Menyediakan dan meningkatkan layanan kami.",
        "Memproses reservasi dan pembelian Anda.",
        "Mengirim komunikasi pemasaran dan promosi, dengan persetujuan Anda.",
        "Menjawab pertanyaan dan permintaan Anda.",
        "Mempersonalisasi pengalaman Anda bersama kami.",
        "Mematuhi ketentuan hukum dan regulasi yang berlaku.",
      ],
    },
    {
      title: "Pembagian Informasi Anda",
      paragraphs: [
        "Kami tidak pernah menjual informasi pribadi Anda kepada pihak ketiga.",
        "Kami mungkin berbagi informasi Anda dengan penyedia layanan pihak ketiga yang membantu kami menjalankan layanan. Penyedia tersebut diwajibkan menjaga kerahasiaan informasi Anda dan hanya menggunakannya untuk tujuan yang telah kami izinkan.",
        "Informasi juga dapat dibagikan dalam keadaan tertentu untuk mematuhi ketentuan hukum, mencegah kegiatan yang tidak sah, serta melindungi hak dan keselamatan pihak lain.",
      ],
    },
    {
      title: "Pilihan Anda",
      paragraphs: ["Anda memiliki kendali atas informasi Anda. Anda dapat:"],
      bullets: [
        "Mengakses dan memperbarui data pribadi Anda dengan menghubungi tim kami.",
        "Berhenti menerima komunikasi pemasaran dan promosi dari kami kapan saja.",
        "Meminta penghapusan data pribadi Anda.",
      ],
    },
    {
      title: "Cookies dan Teknologi Pelacakan",
      paragraphs: [
        "Kami menggunakan cookies dan teknologi pelacakan lain untuk mengumpulkan informasi tentang cara Anda menggunakan layanan. Anda dapat mengatur penggunaan cookies di tingkat peramban. Menonaktifkan cookies mungkin membatasi sebagian fitur di situs kami.",
      ],
    },
    {
      title: "Kebijakan Pemasaran SMS",
      paragraphs: [
        "Bagian ini berlaku khusus untuk pemasaran SMS dan tidak menggantikan Kebijakan Privasi kami secara keseluruhan.",
        "Nomor telepon Anda hanya dikumpulkan ketika Anda memberikan secara sukarela, misalnya saat melakukan transaksi, melakukan inquiry, atau mendaftar untuk pesan promosi. Anda dapat berhenti berlangganan kapan saja dengan mengirim STOP atau UNSUBSCRIBE. Setelah opted out, nomor Anda tidak akan dijual atau dialihkan ke pihak ketiga untuk keperluan pemasaran.",
        "Berlangganan pesan SMS tidak diperlukan untuk mengakses promosi atau diskon, yang juga tersedia langsung di situs kami.",
      ],
    },
    {
      title: "Perubahan atas Kebijakan Ini",
      paragraphs: [
        "Kami dapat memperbarui kebijakan ini secara berkala. Perubahan signifikan akan dipublikasikan di situs kami. Pembaruan terakhir: 1 Januari 2026.",
      ],
    },
    {
      title: "Hubungi Kami",
      paragraphs: [
        "Jika Anda memiliki pertanyaan tentang kebijakan privasi kami atau ingin memperbarui data Anda, hubungi kami di hello@kamaspa.id atau +62 813-1605-2040.",
      ],
    },
  ],
};