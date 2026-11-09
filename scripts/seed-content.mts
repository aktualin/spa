/**
 * Seed konten yang dapat diedit admin lewat dashboard.
 *
 * Aturan: hanya mengisi nilai yang masih kosong (atau judul yang masih berupa
 * label admin lama). Suntingan admin tidak pernah ditimpa saat seed diulang.
 */
import type { PrismaClient } from "@prisma/client";

import { membership as homeMembership, priceDisclaimer } from "../src/data/content.ts";
import { membership as pageMembership } from "../src/data/pages.ts";
import { staticMembershipProgram } from "../src/lib/domain/membership.ts";

type SectionSeed = {
  key: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  legacyTitles?: string[];
};

const HOMEPAGE_SECTIONS: SectionSeed[] = [
  {
    key: "hero",
    title: "Relax. Refresh. (Repeat).",
    subtitle: "Massage • Spa • Corporate Wellness",
    imageUrl: "/img/kama/incense_smoke_animated.gif",
    ctaLabel: "Book Now",
    ctaHref: "/contact",
    legacyTitles: ["Hero"],
  },
  {
    key: "membership-banner",
    title: homeMembership.title,
    subtitle: homeMembership.body,
    imageUrl: "/img/kama/07-flower-bowl.jpg",
    imageAlt: "KAMA Spa treatment room",
    ctaLabel: homeMembership.cta,
    ctaHref: homeMembership.href,
    legacyTitles: ["Membership Banner", "Banner Membership"],
  },
  {
    key: "whats-new",
    title: "What’s New",
    subtitle:
      "We believe authentic beauty reaches far beyond the superficial, through consistent self-care you let the beauty shine both externally and internally.",
    ctaLabel: "Subscribe to Newsletter",
    ctaHref: "#footer",
    legacyTitles: [
      "Promo / Event Highlight",
      "Promo/Event Highlight",
      "Promo / Event Highlight ",
      "What's New",
    ],
  },
  {
    key: "reviews",
    title: "Reviews",
    legacyTitles: ["Reviews"],
  },
  {
    key: "brand-intro",
    eyebrow: "A sanctuary in the heart of South Jakarta",
    title: "More than relaxation",
    subtitle: "we create meaningful reset experiences.",
    ctaLabel: "Our Story",
    ctaHref: "/our-story",
    legacyTitles: ["Brand Intro"],
  },
  {
    key: "socials",
    title: "Gallery Teaser & Instagram",
    ctaLabel: "Follow Us",
    legacyTitles: ["Gallery Teaser & Instagram", "Socials"],
  },
  {
    key: "booking-banner",
    title: "Have any questions? Drop us a line.",
    ctaLabel: "Get In Touch",
    ctaHref: "/contact",
    legacyTitles: ["Booking Banner"],
  },
  {
    key: "signature-treatments",
    eyebrow: "Signature Treatments",
    title: "Our most-loved rituals",
    subtitle:
      "Treatment yang paling sering dipilih tamu KAMA — pilihan yang selalu tepat untuk membuat rileks.",
    ctaLabel: "View The Menu",
    ctaHref: "/menu",
  },
  {
    key: "promo-highlight",
    title: "Promo & Event",
  },
  {
    key: "gallery-teaser",
    title: "Gallery",
    ctaLabel: "Lihat Galeri Lengkap",
    ctaHref: "/gallery",
  },
];

const CONTENT_BLOCKS: { key: string; value: string }[] = [
  { key: "global.copyright", value: "© {year} KAMA Spa. All rights reserved." },
  { key: "global.connect_eyebrow", value: "Connect with us" },
  { key: "global.partnership_intro", value: "Kolaborasi dan partnership:" },
  { key: "global.privacy_label", value: "Privacy Policy" },
  { key: "global.terms_label", value: "Terms & Conditions" },
  { key: "global.instagram_hashtag", value: "#kamaspa" },
  {
    key: "global.instagram_hashtag_href",
    value: "https://www.instagram.com/explore/search/keyword/?q=%23kamaspa",
  },
  { key: "global.instagram_follow_label", value: "Follow Us" },
  {
    key: "global.instagram_empty",
    value:
      "Belum ada foto Instagram. Tambahkan dari admin, modul Homepage → Feed Instagram.",
  },
  { key: "global.gallery_cta_label", value: "Lihat Galeri Lengkap" },
  { key: "global.book_via_whatsapp", value: "Book via WhatsApp" },
  { key: "global.view_detail_label", value: "Lihat Detail" },
  { key: "global.read_label", value: "Baca" },
  { key: "global.book_now_label", value: "Book Now" },
  { key: "global.price_disclaimer", value: priceDisclaimer },
  { key: "global.site_title", value: "KAMA Spa • Wellness Sanctuary di South Jakarta" },
  { key: "home.hero.card_eyebrow", value: "Welcome to KAMA Spa" },
  {
    key: "home.hero.card_body",
    value:
      "Your premier destination for massage and wellness services in South Jakarta. Joyful rejuvenation awaits.",
  },
  { key: "home.hero.scroll_label", value: "See what's new" },
  { key: "home.brand_intro.stats_label", value: "KAMA at a glance" },
  { key: "home.whats_new.card_eyebrow", value: "KAMA Journal" },
  { key: "home.whats_new.empty", value: "Belum ada artikel terbaru." },
  { key: "home.reviews.empty", value: "Belum ada ulasan." },
  {
    key: "home.socials.empty",
    value:
      "Belum ada foto Instagram. Tambahkan dari admin, modul Homepage → Feed Instagram.",
  },
  { key: "home.promo.eyebrow", value: "Promo" },
  { key: "home.promo.event_eyebrow", value: "Upcoming Event" },
  {
    key: "home.promo.fallback_description",
    value: "Promo sedang berjalan — cek detailnya di halaman promo.",
  },
  { key: "home.promo.cta_label", value: "Lihat Promo" },
  { key: "home.promo.event_cta_label", value: "Lihat Event" },
  { key: "home.booking_banner.title", value: "Have any questions? Drop us a line." },
  { key: "home.booking_banner.cta_label", value: "Get In Touch" },
  { key: "home.booking_banner.cta_href", value: "/contact" },
  { key: "contact.hero.title", value: "Contact" },
  {
    key: "contact.hero.description",
    value:
      "Reserve your treatment, or just drop us a line — we'll help you find the right ritual for what you need today.",
  },
  { key: "contact.locations.title", value: "Our Locations" },
  {
    key: "contact.locations.empty",
    value:
      "Lokasi kami akan diumumkan segera. Sementara itu, hubungi kami via WhatsApp untuk reservasi di semua area kami.",
  },
  { key: "contact.cta.title", value: "Want to experience KAMA first?" },
  { key: "contact.cta.label", value: "View The Menu" },
  {
    key: "contact.location.address_missing",
    value: "Alamat belum diisi; hubungi kami untuk lokasi terdekat.",
  },
  { key: "contact.location.whatsapp_fallback", value: "WhatsApp" },
  { key: "contact.location.whatsapp_cta", value: "WhatsApp" },
  { key: "contact.location.directions", value: "Dapatkan Rute" },
  { key: "contact.location.fresha", value: "Booking via Fresha" },
  { key: "membership.join_label", value: "Join KAMA Now" },
  { key: "membership.menu_label", value: "Lihat Menu" },
  { key: "membership.benefits_title", value: "Main Benefits" },
  {
    key: "membership.benefits_intro",
    value:
      "Just Rp 1.5jt a month. Anda mendapatkan seluruh manfaat berikut, tanpa komitmen jangka panjang.",
  },
  { key: "membership.services_title", value: "KAMA Essential Services" },
  { key: "membership.service_book_label", value: "Book Now" },
  { key: "membership.plans_eyebrow", value: "Membership Plans" },
  {
    key: "membership.plans_title",
    value: "Pilih yang paling sesuai dengan ritme Anda.",
  },
  { key: "membership.plans_empty", value: "Belum ada paket membership yang dipublikasikan." },
  { key: "membership.join_now_label", value: "Join Now" },
  { key: "membership.terms_title", value: "Syarat & Ketentuan" },
  { key: "membership.contact_title", value: "Have any questions? Drop us a line." },
  { key: "membership.contact_label", value: "Get In Touch" },
  { key: "menu.hero.eyebrow", value: "Menu" },
  {
    key: "menu.hero.title",
    value: "Each of our massage style is a nurturing journey of healing.",
  },
  {
    key: "menu.hero.description",
    value:
      "The journey through our signature touch is where tension fades and inner peace is lovingly restored.",
  },
  { key: "menu.massage.eyebrow", value: "Massage" },
  { key: "menu.massage.title", value: "Signature Treatments" },
  { key: "menu.addons.eyebrow", value: "Layanan Tambahan" },
  { key: "menu.addons.title", value: "Body & Scrub" },
  { key: "menu.addon_label", value: "Add-on" },
  { key: "menu.category.massage", value: "Massage" },
  { key: "menu.category.body", value: "Body" },
  { key: "menu.category.face", value: "Facials" },
  { key: "menu.category.head", value: "Head & Scalp" },
  { key: "menu.category.bath", value: "Bath" },
  { key: "menu.feature.face.eyebrow", value: "Perawatan Wajah" },
  { key: "menu.feature.head.eyebrow", value: "Perawatan Kepala & Kulit Kepala" },
  { key: "menu.feature.bath.eyebrow", value: "Ritual Bak Mandi" },
  { key: "menu.booking_label", value: "Book Your Treatment" },
  { key: "menu.packages.eyebrow", value: "All Day Spa" },
  { key: "menu.packages.title", value: "Our spa bundles" },
  {
    key: "menu.packages.description",
    value:
      "Our thoughtfully curated spa bundles combine massages, treatments, and rituals designed to pamper, restore balance, and leave you refreshed all day long.",
  },
  { key: "menu.menu_book.eyebrow", value: "Menu Book" },
  { key: "menu.menu_book.title", value: "Galeri Menu KAMA Spa 2026" },
  {
    key: "menu.menu_book.description",
    value:
      "Jelajahi menu lengkap kami sebagaimana tampil di menu book resmi — atau unduh PDF-nya untuk dibawa pulang.",
  },
  { key: "menu.menu_book.download_label", value: "Download Menu (PDF)" },
  { key: "menu.detail.eyebrow", value: "KAMA Spa" },
  { key: "menu.detail.loading_title", value: "Memuat treatment…" },
  { key: "menu.detail.pricing_label", value: "Pricing" },
  { key: "menu.detail.include_label", value: "Include" },
  { key: "menu.detail.book_label", value: "Book This Treatment" },
  { key: "menu.detail.not_found_title", value: "Treatment Not Found" },
  { key: "catalog.treatments.eyebrow", value: "Treatments" },
  { key: "catalog.treatments.title", value: "Setiap treatment, tanpa terburu-buru." },
  {
    key: "catalog.treatments.description",
    value: "Pilih berdasarkan kebutuhan tubuh hari ini. Durasi dan harga tertera apa adanya.",
  },
  { key: "catalog.treatments.empty_title", value: "Katalog belum tersedia" },
  {
    key: "catalog.treatments.empty_description",
    value: "Treatment akan muncul di sini begitu dipublikasikan dari dashboard admin.",
  },
  { key: "catalog.treatments.count_suffix", value: "treatment" },
  { key: "catalog.treatments.category_cta", value: "Lihat kategori" },
  { key: "catalog.back_treatments", value: "Semua treatment" },
  { key: "catalog.category.loading_title", value: "Memuat kategori…" },
  { key: "catalog.category.empty_title", value: "Belum ada treatment di kategori ini" },
  {
    key: "catalog.category.empty_description",
    value: "Daftar ini terisi otomatis begitu treatment dipublikasikan.",
  },
  { key: "catalog.treatment.not_found_title", value: "Treatment tidak ditemukan" },
  { key: "catalog.treatment.loading_title", value: "Memuat treatment…" },
  { key: "catalog.treatment.cta_whatsapp", value: "Reservasi via WhatsApp" },
  { key: "catalog.treatment.pricing_title", value: "Durasi & harga" },
  { key: "catalog.treatment.related_prefix", value: "Treatment lain di" },
  { key: "catalog.packages.eyebrow", value: "Packages" },
  { key: "catalog.packages.title", value: "Satu ritual, dirangkai lengkap." },
  {
    key: "catalog.packages.description",
    value:
      "Gabungan beberapa treatment dalam satu kunjungan — untuk waktu yang memang disediakan untuk diri sendiri.",
  },
  { key: "catalog.packages.back", value: "Semua treatment" },
  { key: "catalog.packages.empty_title", value: "Belum ada paket" },
  {
    key: "catalog.packages.empty_description",
    value: "Paket akan muncul di sini begitu dipublikasikan dari dashboard admin.",
  },
  { key: "catalog.package.not_found_title", value: "Paket tidak ditemukan" },
  { key: "catalog.package.loading_title", value: "Memuat paket…" },
  { key: "catalog.package.eyebrow", value: "Package" },
  { key: "catalog.package.cta_whatsapp", value: "Reservasi via WhatsApp" },
  { key: "catalog.package.includes_title", value: "Isi paket" },
  { key: "catalog.package.others_title", value: "Paket lainnya" },
  { key: "catalog.package.back", value: "Semua paket" },
  { key: "retail.hero.eyebrow", value: "Retail" },
  { key: "retail.hero.title", value: "Lanjutkan ritualnya di rumah." },
  {
    key: "retail.hero.description",
    value:
      "Produk yang kami pakai di ruang rawat, tersedia untuk dibawa pulang. Pemesanan lewat WhatsApp.",
  },
  { key: "retail.highlight_title", value: "Highlight" },
  { key: "retail.collaboration_title", value: "Kolaborasi" },
  { key: "retail.other_title", value: "Produk lain" },
  { key: "retail.price_missing", value: "Hubungi kami" },
  { key: "retail.order_label", value: "Pesan via WhatsApp" },
  { key: "retail.empty_title", value: "Belum ada produk retail" },
  {
    key: "retail.empty_description",
    value: "Produk akan muncul di sini begitu dipublikasikan dari dashboard admin.",
  },
];





const EXTRA_CONTENT_BLOCKS: { key: string; value: string }[] = [
  { key: "contact.location.open_maps", value: "Buka di Maps" },
  { key: "gift_card.hero.eyebrow", value: "Gift Card" },
  { key: "gift_card.missing_title", value: "Gift Card" },
  { key: "gift_card.missing_description", value: "Informasi gift card belum tersedia." },
  { key: "gift_card.order_label", value: "Pesan via WhatsApp" },
  { key: "gift_card.terms_title", value: "Syarat & ketentuan" },
  { key: "gift_card.cta_title", value: "Bingung pilih treatment?" },
  { key: "gift_card.cta_description", value: "Lihat seluruh menu dulu \u2014 gift card berlaku untuk semuanya." },
  { key: "gift_card.cta_label", value: "Lihat Treatments" },
  { key: "global.badge_new", value: "New" },
  { key: "global.badge_best_seller", value: "Best Seller" },
  { key: "global.package_label", value: "Package" },
  { key: "global.duration_label", value: "Durasi" },
  { key: "global.event_partner_prefix", value: "Bersama" },
  { key: "global.partner_logo_alt", value: "Logo mitra" },
  { key: "corporate.hero.eyebrow", value: "Corporate Wellness Solutions" },
  { key: "corporate.about_title", value: "About Us" },
  { key: "corporate.about_p1", value: "KAMA Spa is a wellness sanctuary in the heart of South Jakarta." },
  { key: "corporate.about_p2", value: "Combining traditional healing techniques and modern wellness approaches, KAMA Spa offers thoughtfully curated treatments designed to restore balance, relaxation, and mindful presence." },
  { key: "corporate.about_quote", value: "More than relaxation \u2014 we create meaningful reset experiences." },
  { key: "corporate.benefits_title", value: "Healthy Employees Build Stronger Companies" },
  { key: "corporate.benefits_quote", value: "Wellness is not an expense. It's an investment in your people." },
  { key: "corporate.partner_eyebrow", value: "Why Partner with KAMA?" },
  { key: "corporate.partner_title", value: "Thoughtfully designed wellness experiences that go beyond massage." },
  { key: "corporate.partner_description", value: "Our goal isn't simply to provide massage. We create meaningful wellness experiences for your people." },
  { key: "corporate.in_office_eyebrow", value: "In-Office Program" },
  { key: "corporate.in_office_title", value: "A Restorative Wellness Experience at Your Workplace" },
  { key: "corporate.in_office_sample", value: "Sample Programs*" },
  { key: "corporate.in_spa_eyebrow", value: "In-Spa Corporate Experience" },
  { key: "corporate.in_spa_title", value: "Bring Your Team Together Through Wellness" },
  { key: "corporate.in_spa_fallback", value: "Treat your employees to a private wellness experience at KAMA Spa\u2014designed to reward, reconnect, and recharge your team in a calm and premium environment." },
  { key: "corporate.ideal_for", value: "Ideal For:" },
  { key: "corporate.steps_eyebrow", value: "From Consultation to Partnership" },
  { key: "corporate.steps_title_prefix", value: "A Simple" },
  { key: "corporate.steps_title_suffix", value: "Step Collaboration Process" },
  { key: "corporate.step_label", value: "Step" },
  { key: "corporate.collab_eyebrow", value: "Past Collaborations" },
  { key: "corporate.collab_title", value: "Wellness in action \u2014 on location" },
  { key: "corporate.inquiry_eyebrow", value: "Corporate Inquiry" },
  { key: "corporate.inquiry_title", value: "Tell us about your team." },
  { key: "corporate.inquiry_description", value: "Share a few details and our corporate team will get back to you with a program tailored to your company." },
  { key: "corporate.banner_title", value: "Let's build your wellness program." },
  { key: "corporate.talk_prefix", value: "Talk to" },
  { key: "corporate_form.name", value: "Nama *" },
  { key: "corporate_form.company", value: "Perusahaan" },
  { key: "corporate_form.email", value: "Email *" },
  { key: "corporate_form.phone", value: "Telepon" },
  { key: "corporate_form.message", value: "Pesan *" },
  { key: "corporate_form.message_placeholder", value: "Jumlah karyawan, jenis program (in-office / in-spa), perkiraan tanggal\u2026" },
  { key: "corporate_form.consent_prefix", value: "Saya setuju data di atas digunakan KAMA Spa hanya untuk menindaklanjuti inquiry ini, sesuai" },
  { key: "corporate_form.privacy_label", value: "Kebijakan Privasi" },
  { key: "corporate_form.consent_suffix", value: "." },
  { key: "corporate_form.submit", value: "Kirim Inquiry" },
  { key: "corporate_form.submitting", value: "Mengirim\u2026" },
  { key: "corporate_form.unavailable", value: "Formulir inquiry sedang tidak tersedia. Silakan hubungi tim corporate kami langsung:" },
  { key: "corporate_form.whatsapp", value: "WhatsApp" },
  { key: "corporate_form.success_title", value: "Terima kasih, inquiry Anda sudah terkirim." },
  { key: "corporate_form.success_body", value: "Tim KAMA akan menghubungi Anda kembali pada jam operasional. Untuk hal mendesak, hubungi kami via WhatsApp." },
  { key: "corporate_form.error_name", value: "Nama wajib diisi." },
  { key: "corporate_form.error_email_required", value: "Email wajib diisi." },
  { key: "corporate_form.error_email_format", value: "Format email belum benar." },
  { key: "corporate_form.error_message", value: "Pesan minimal 10 karakter." },
  { key: "corporate_form.error_consent", value: "Mohon centang persetujuan ini." },
  { key: "corporate_form.error_captcha", value: "Mohon selesaikan captcha terlebih dahulu." },
  { key: "corporate_form.error_captcha_load", value: "Captcha gagal dimuat. Muat ulang halaman lalu coba lagi." },
  { key: "corporate_form.error_incomplete", value: "Mohon lengkapi isian yang masih kosong atau belum benar." },
  { key: "corporate_form.error_send", value: "Terjadi kendala saat mengirim. Silakan coba lagi atau hubungi kami via WhatsApp." },
  { key: "corporate_form.error_network", value: "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi." },
  { key: "events.hero.eyebrow", value: "Events" },
  { key: "events.hero.title", value: "Upcoming events at KAMA Spa." },
  { key: "events.hero.description", value: "Program dan kolaborasi yang kami siapkan untuk Anda \u2014 baik yang akan datang maupun yang sudah berlalu." },
  { key: "events.upcoming.eyebrow", value: "Upcoming" },
  { key: "events.upcoming.title", value: "Yang akan datang" },
  { key: "events.upcoming.description", value: "Event yang masih bisa Anda ikuti \u2014 daftar tempat terbatas." },
  { key: "events.upcoming.empty_title", value: "Belum ada event yang terjadwal" },
  { key: "events.upcoming.empty_description", value: "Nantikan pengumuman berikutnya \u2014 follow @kama__spa untuk update terbaru." },
  { key: "events.past.eyebrow", value: "Past Events" },
  { key: "events.past.title", value: "Telah berlalu" },
  { key: "events.past.description", value: "Potongan momen dari event yang pernah kami jalankan." },
  { key: "events.past.empty_title", value: "Belum ada riwayat event" },
  { key: "events.past.empty_description", value: "Riwayat event akan tampil di sini setelah program selesai." },
  { key: "events.collab_title", value: "Past collaborations" },
  { key: "events.collab_description", value: "Program wellness yang pernah kami jalankan bersama partner dan perusahaan." },
  { key: "events.collab_cta", value: "Lihat Kolaborasi" },
  { key: "events.collab.hero_eyebrow", value: "Collaborations" },
  { key: "events.collab.hero_title", value: "Wellness in action \u2014 on location." },
  { key: "events.collab.hero_description", value: "Program corporate wellness dan kolaborasi yang pernah kami jalankan bersama partner." },
  { key: "events.collab.section_eyebrow", value: "Past Collaborations" },
  { key: "events.collab.section_title", value: "Program yang pernah berjalan" },
  { key: "events.collab.empty_title", value: "Belum ada kolaborasi yang tercatat" },
  { key: "events.collab.empty_description", value: "Kolaborasi yang sudah selesai akan tampil di sini." },
  { key: "events.detail.not_found_title", value: "Event Not Found" },
  { key: "events.detail.loading_title", value: "Memuat event\u2026" },
  { key: "events.detail.register_label", value: "Daftar via WhatsApp" },
  { key: "events.detail.back_label", value: "Semua Event" },
  { key: "events.detail.title", value: "Detail event" },
  { key: "events.detail.empty_title", value: "Detail event belum tersedia" },
  { key: "events.detail.empty_description", value: "Hubungi kami via WhatsApp untuk informasi lebih lanjut." },
  { key: "events.detail.location_prefix", value: "Lokasi:" },
  { key: "events.detail.collab_label", value: "Kolaborasi" },
  { key: "events.detail.gallery_title", value: "Galeri Event" },
  { key: "gallery.hero.eyebrow", value: "Gallery" },
  { key: "gallery.hero.title", value: "A quiet look inside KAMA Spa." },
  { key: "gallery.hero.description", value: "Potongan suasana, ritual, dan detail kecil yang membuat setiap kunjungan terasa seperti jeda." },
  { key: "gallery.photo_count_suffix", value: "foto" },
  { key: "gallery.empty_title", value: "Belum ada foto" },
  { key: "gallery.empty_description", value: "Foto akan tampil di sini setelah diunggah dari dashboard admin." },
  { key: "journal.hero.eyebrow", value: "Journal" },
  { key: "journal.hero.title", value: "Catatan dari KAMA Spa." },
  { key: "journal.hero.description", value: "Tulisan seputar ritual, wellness, dan cara memperlambat tempo \u2014 dari tim kami untuk Anda." },
  { key: "journal.loading", value: "Memuat\u2026" },
  { key: "journal.all_label", value: "Semua" },
  { key: "journal.tag_label", value: "Tag" },
  { key: "journal.empty_title", value: "Belum ada tulisan" },
  { key: "journal.empty_filtered_title", value: "Belum ada tulisan dengan tag ini" },
  { key: "journal.empty_description", value: "Tulisan baru akan tampil di sini setelah dipublikasikan." },
  { key: "journal.detail.not_found_title", value: "Tulisan tidak ditemukan" },
  { key: "journal.detail.loading_title", value: "Memuat tulisan\u2026" },
  { key: "journal.detail.back_label", value: "Semua Journal" },
  { key: "journal.detail.empty_body", value: "Isi tulisan ini belum tersedia." },
  { key: "journal.detail.others_title", value: "Tulisan lainnya" },
  { key: "our_story.hero.eyebrow", value: "Our Story" },
  { key: "our_story.hero.description", value: "KAMA Spa lahir dari keinginan sederhana: memberi ruang untuk berhenti sejenak, bernapas, dan kembali ke diri sendiri." },
  { key: "our_story.missing_title", value: "Cerita kami belum tersedia" },
  { key: "our_story.missing_description", value: "Konten Our Story akan tampil di sini setelah dipublikasikan." },
  { key: "our_story.philosophy_eyebrow", value: "Philosophy" },
  { key: "our_story.philosophy_title", value: "Ruang untuk kembali" },
  { key: "our_story.values_eyebrow", value: "Values" },
  { key: "our_story.values_title", value: "Yang kami pegang" },
  { key: "our_story.journal_eyebrow", value: "Journal" },
  { key: "our_story.journal_title", value: "Bacaan dari KAMA" },
  { key: "our_story.journal_description", value: "Catatan seputar ritual, wellness, dan cara memperlambat tempo." },
  { key: "our_story.journal_cta", value: "Lihat Journal" },
  { key: "pages.header_eyebrow", value: "KAMA Spa" },
  { key: "pages.loading_title", value: "Memuat halaman\u2026" },
  { key: "pages.not_found_title", value: "Halaman tidak ditemukan" },
  { key: "pages.empty_body", value: "Isi halaman ini belum tersedia." },
  { key: "pages.updated_label", value: "Terakhir diperbarui" },
  { key: "promos.hero.eyebrow", value: "Promos" },
  { key: "promos.hero.title", value: "Penawaran yang sedang berjalan." },
  { key: "promos.hero.description", value: "Promo aktif di KAMA Spa \u2014 berlaku selama periode yang tertera." },
  { key: "promos.active.eyebrow", value: "Active Promos" },
  { key: "promos.active.title", value: "Sedang berlangsung" },
  { key: "promos.active.description", value: "Promo yang masih bisa dipakai hari ini." },
  { key: "promos.empty_title", value: "Belum ada promo aktif" },
  { key: "promos.empty_description", value: "Nantikan promo berikutnya \u2014 daftar ini terisi otomatis begitu promo dipublikasikan." },
  { key: "promos.membership_title", value: "KAMA Membership" },
  { key: "promos.membership_description", value: "Satu kredit essential service setiap bulan, harga anggota untuk seluruh menu, dan benefit khusus lainnya." },
  { key: "promos.membership_cta", value: "Lihat Membership" },
  { key: "promos.detail.not_found_title", value: "Promo Not Found" },
  { key: "promos.detail.loading_title", value: "Memuat promo\u2026" },
  { key: "promos.detail.ask_label", value: "Tanya Promo via WhatsApp" },
  { key: "promos.detail.back_label", value: "Semua Promo" },
  { key: "promos.detail.title", value: "Detail promo" },
  { key: "promos.detail.empty_title", value: "Detail promo belum tersedia" },
  { key: "promos.detail.empty_description", value: "Hubungi kami via WhatsApp untuk informasi lebih lanjut." },
  { key: "promos.detail.terms_title", value: "Syarat & ketentuan" },
  { key: "promos.membership.hero_eyebrow", value: "Membership" },
  { key: "promos.membership.hero_title", value: "KAMA Membership." },
  { key: "promos.membership.hero_description", value: "Pastikan waktu me-time Anda selalu tercatat. Setiap bulan Anda mendapat kredit untuk satu essential service, harga yang lebih ringan, serta penawaran khusus untuk anggota KAMA." },
  { key: "promos.membership.join_label", value: "Join KAMA Now" },
  { key: "promos.membership.menu_label", value: "Lihat Menu" },
  { key: "promos.membership.plans_eyebrow", value: "Membership Plans" },
  { key: "promos.membership.plans_title", value: "Pilih yang paling sesuai dengan ritme Anda." },
  { key: "promos.membership.join_now_label", value: "Join Now" },
  { key: "promos.membership.empty_title", value: "Belum ada paket membership" },
  { key: "promos.membership.empty_description", value: "Paket membership akan tampil di sini setelah dipublikasikan." },
];


function groupFor(key: string): string {
  return key.split(".")[0] ?? "global";
}

export async function seedContent(prisma: PrismaClient): Promise<void> {
  for (const [index, section] of HOMEPAGE_SECTIONS.entries()) {
    const existing = await prisma.homepageSection.findUnique({
      where: { key: section.key },
    });
    const data = {
      eyebrow: section.eyebrow ?? null,
      title: section.title,
      subtitle: section.subtitle ?? null,
      imageUrl: section.imageUrl ?? null,
      imageAlt: section.imageAlt ?? null,
      ctaLabel: section.ctaLabel ?? null,
      ctaHref: section.ctaHref ?? null,
      sortOrder: index,
    };

    if (!existing) {
      await prisma.homepageSection.create({ data: { key: section.key, ...data } });
      continue;
    }

    const update: Record<string, unknown> = {};
    const titleIsLegacy =
      !existing.title.trim() ||
      (section.legacyTitles ?? []).includes(existing.title.trim());
    if (titleIsLegacy) update.title = data.title;
    if (!existing.eyebrow?.trim() && data.eyebrow) update.eyebrow = data.eyebrow;
    if (!existing.subtitle?.trim() && data.subtitle) update.subtitle = data.subtitle;
    if (!existing.imageUrl?.trim() && data.imageUrl) update.imageUrl = data.imageUrl;
    if (!existing.imageAlt?.trim() && data.imageAlt) update.imageAlt = data.imageAlt;
    if (!existing.ctaLabel?.trim() && data.ctaLabel) update.ctaLabel = data.ctaLabel;
    if (!existing.ctaHref?.trim() && data.ctaHref) update.ctaHref = data.ctaHref;

    await prisma.homepageSection.update({ where: { id: existing.id }, data: update });
  }
  console.log(`✔ ${HOMEPAGE_SECTIONS.length} section homepage berisi konten`);

  for (const block of [...CONTENT_BLOCKS, ...EXTRA_CONTENT_BLOCKS]) {
    const existing = await prisma.contentBlock.findUnique({ where: { key: block.key } });
    if (!existing) {
      await prisma.contentBlock.create({
        data: { key: block.key, group: groupFor(block.key), value: block.value },
      });
    } else if (!existing.value.trim()) {
      await prisma.contentBlock.update({
        where: { key: block.key },
        data: { value: block.value, group: groupFor(block.key) },
      });
    }
  }
  console.log(
    `✔ ${CONTENT_BLOCKS.length + EXTRA_CONTENT_BLOCKS.length} teks halaman`,
  );

  const program = staticMembershipProgram();
  const existingProgram = await prisma.membershipProgram.findUnique({
    where: { id: "singleton" },
  });
  if (!existingProgram) {
    await prisma.membershipProgram.create({
      data: {
        id: "singleton",
        eyebrow: program.eyebrow,
        title: program.title,
        intro: program.intro,
        priceHeadline: program.priceHeadline,
        bannerBody: program.bannerBody,
        bannerCtaLabel: homeMembership.cta,
        bannerCtaHref: homeMembership.href,
        benefits: program.benefits,
        servicesIntro: program.servicesIntro,
        services: program.services,
        termsHtml: program.termsHtml,
      },
    });
    console.log("✔ program membership");
  } else {
    console.log("• program membership dilewati (sudah ada)");
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (settings) {
    const update: Record<string, string> = {};
    if (!settings.footerTagline?.trim()) update.footerTagline = program.intro;
    if (!settings.priceDisclaimer?.trim()) update.priceDisclaimer = priceDisclaimer;
    if (!settings.footerMembershipTitle?.trim()) {
      update.footerMembershipTitle = "Become a KAMA Member for Rp 1.5jt a month";
    }
    if (!settings.footerMembershipLearnLabel?.trim()) {
      update.footerMembershipLearnLabel = "Learn More";
    }
    if (!settings.footerMembershipJoinLabel?.trim()) {
      update.footerMembershipJoinLabel = "Join KAMA Now";
    }
    if (!settings.partnershipIntro?.trim()) {
      update.partnershipIntro = "Kolaborasi dan partnership:";
    }
    if (!settings.partnershipEmail?.trim()) {
      update.partnershipEmail = "marketing@kamaspa.id";
    }
    if (!settings.bookNowLabel?.trim()) update.bookNowLabel = "Book Now";
    if (!settings.bookNowHref?.trim()) update.bookNowHref = "/contact";
    if (Object.keys(update).length > 0) {
      await prisma.siteSettings.update({ where: { id: "singleton" }, data: update });
    }
    console.log("✔ pengaturan teks footer/partnership");
  }

  console.log(
    `✔ membership page copy tersedia (${pageMembership.plans.length} tier tetap dikelola modul Membership)`,
  );
}
