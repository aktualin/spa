# Progress v2 — KAMA Spa (lanjutan BUILD)

Berkas pelacak supaya pekerjaan bisa dilanjutkan bila sesi/token habis.
Perbarui status setiap kali satu butir selesai dan sudah di-commit.

Legenda: ✅ selesai & di-commit · 🔄 sedang dikerjakan · ⏳ belum · ⚠️ butuh keputusan/aksi user

Aturan kerja yang berlaku (dari user):
- Setiap update yang lolos verifikasi langsung di-commit (jangan stage `opencode.json`, `.env.local`, `index.html`).
- Verifikasi saat development: `tsc --noEmit` + unit test (`node --test tests/unit/*.test.mts`). E2E Playwright dihentikan sementara — kecuali BUILD-24 yang memang meminta testing.
- Tanpa dependensi npm baru; UI/komentar bahasa Indonesia; frontend existing tidak boleh berubah visual.
- `docs/` di-ignore git — panduan di `docs/user-guide/*.md` hanya ada di lokal.

## Ringkasan

| BUILD | Modul / tugas | Status | Commit |
|---|---|---|---|
| 1–9 | DB, auth, Halaman & URL, Menu, Treatments, Harga, Media Library, Promos & Gift Card, Membership | ✅ | lihat `git log` |
| — | Fondasi schema Events/Corporate/Highlight | ✅ | `8248006` |
| — | Fondasi schema SiteSettings (IG/GA4/GSC/favicon/OG) + BackupRun | ✅ | `ea2a28f` |
| 10 | Journal | ✅ | `d71603c` |
| 11 | Events | ✅ | `7b700d2`, `473bfa7` |
| 12 | KAMA Retail | ✅ | `85a336d` |
| 13 | Corporate Wellness | ✅ | `65c5f9b`, `c86df3d` |
| 14 | Homepage & Our Story | ✅ | `c7b18fe` |
| 15 | Kontak & Umum (alamat, jam, WA, email, sosmed, Maps, Fresha, IG username, GA4 ID) | ✅ | commit "BUILD-15–19" |
| 16 | SEO (meta per halaman/artikel, OG image, favicon, sitemap/robots dari DB, GSC) | ✅ | commit "BUILD-15–19" |
| 17 | Pengguna Admin (CRUD, role, ganti password, batas akses per role) | ✅ | commit "BUILD-15–19" |
| 18 | WhatsApp Templates (per konteks, nomor dari settings, click-to-chat, Book Now) | ✅ | commit "BUILD-15–19" |
| 19 | Backup & Status (backup terakhir, SSL, domain, versi, backup manual/otomatis) | ✅ (perlu uji manual setelah deploy) | commit "BUILD-15–19" |
| 20 | Homepage dinamis (hero, brand intro, signature, promo/event highlight, gallery, IG feed, reviews, footer) | ✅ | lihat `git log` |
| 21 | Halaman publik yang belum ada (cek kelengkapan + slug DB + redirect 301) | ✅ semua halaman sudah ada; promo kini mencatat 301 saat slug diganti | lihat `git log` |
| 22 | Integrasi WhatsApp, GA4, Google Maps, Instagram feed | ✅ (GA4 dipasang bila ID diisi; WA lacak klik; Maps di Kontak; IG dari admin) | lihat `git log` |
| 23 | Hardening (responsif, browser, HTTPS, gambar, login limit, Zod, sanitasi, rate limit) | ✅ sebagian — header keamanan + HSTS, kompresi gambar saat unggah; audit sanitasi/Zod/limit OK. Responsif & lintas browser belum diuji (butuh E2E/manual) | lihat `git log` |
| 24 | Testing sesuai PLAN-9 + perbaikan sampai DoD PLAN-8 | ✅ sebagian — lihat "Hasil BUILD-24" | lihat `git log` |
| 25 | Serah terima sesuai PLAN-10 | 🔄 subagent (dokumen di `docs/` — perhatikan `.gitignore` mengabaikan `docs/*md`) | |

## Catatan per butir

### Keputusan yang menunggu user
- Retail: produk kolaborasi masih memakai `isHighlight` (label "Highlight / Kolaborasi"). Field terpisah butuh kolom DB baru.
- Homepage: teks Reviews, Brand Intro, Socials, judul bagian Our Story masih hardcode (butuh kolom baru) — akan ditinjau di BUILD-20.
- Env produksi: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (wajib, fail-closed), `RESEND_API_KEY`, `EMAIL_FROM`, opsional `CORPORATE_INQUIRY_TO`.

### Sisa dari BUILD-15–19 (masuk daftar kerja berikutnya)
- Book Now header desktop & tombol membership masih ke `/contact` (keputusan produk: ke WhatsApp?).
- Footer, `/promos/membership`, `events/[slug]`, `location-info`, corporate masih memakai nomor WA hardcode via `waLink` (BUILD-22).
- Duplikasi konten `/menu/[slug]` vs `/treatments/...`: tentukan URL utama + canonical (BUILD-21/23).
- `alt` Instagram di `socials.tsx` / `gallery-teaser.tsx` perlu fallback.
- Backup: perlu uji end-to-end setelah deploy (isi secret GitHub `BACKUP_DATABASE_URL`, `BACKUP_PASSPHRASE`, `BACKUP_REPORT_URL`, `BACKUP_REPORT_SECRET`; env Vercel `BACKUP_REPORT_SECRET`).
- Ikon email footer kini ke `hello@kamaspa.id` (dari DB), sebelumnya marketing@.

### Sisa dari BUILD-23
- GIF hero 28 MB (`public/img/kama/incense_smoke_animated.gif`) masih dipakai — butuh persetujuan user untuk diganti/konversi; admin bisa mengganti gambar hero sendiri.
- Rate limit login & inquiry tersimpan di memori per instance Vercel (tidak lintas instance).
- CSP belum dipasang (perlu uji browser karena Leaflet/GA4/Maps).
- Responsif desktop/tablet/mobile & kompatibilitas Chrome/Safari/Edge/Firefox belum diverifikasi ulang sejak BUILD-6 (masuk BUILD-24).

### Hasil BUILD-24 (8 Nov 2026)
- `npm run build`: lolos, tanpa peringatan.
- Unit test: 491/491 lolos.
- E2E Playwright (mobile/tablet/desktop + admin-flows): 108 lolos di run pertama; 2 timeout memuat halaman (GIF 28 MB) lolos saat diulang; admin-flows 7/7 lolos.
  - Catatan: menjalankan suite dua kali berturut-turut memicu pembatas login (10×/15 menit per IP) — fitur bekerja sesuai desain; restart server sebelum run ulang.
- Smoke test produksi lokal: `/` 200, event tak dikenal 404, `/corporate-wellness` 308, header keamanan aktif.
- Butir PLAN-9 yang tercakup otomatis: regresi layout/nav/menu, WhatsApp link, auth admin, CRUD katalog & menu, slug → redirect 301, menu 3 level header/footer/mobile, pindah parent tanpa siklus (unit), hapus halaman yang dipakai menu → tautan rusak ditandai/disembunyikan (unit), 404 halaman.
- BELUM tercakup otomatis (perlu uji manual/UAT): CRUD 19 modul di UI (selain katalog, menu, halaman, auth), GA4 (butuh Measurement ID), Maps embed, feed Instagram, form inquiry + email (butuh Turnstile & Resend), lintas browser Safari/Firefox/Edge, backup end-to-end.

### API read-only konten publik (8 Nov 2026) — commit `e82a3f2`
14 endpoint GET di `/api/content/*`: homepage, treatments, promos, membership, gallery, journal (+`/[slug]`), events, retail, corporate, our-story, settings, navigation, gift-card.
- Memakai reader `src/lib/content/*` yang sama dengan website → aturan visibilitas (draft, `isVisible`, periode promo) dan revalidasi admin otomatis ikut.
- Header `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- Isi artikel (`bodyHtml`) hanya di endpoint detail; list memakai `excerpt`.
- Tidak mengekspos CorporateInquiry, AdminUser, BackupRun, atau data draft. Verifikasi: tsc bersih, build lolos, 491/491 unit test, semua endpoint 200, slug tak dikenal 404.

### Audit "semua konten admin tampil di web user" (8 Nov 2026)
Hasil tiga audit paralel terhadap kontrak peta konten → tampilan.

**OK (konten admin punya jalur render):** Navigasi (3 level, header/footer/mobile, external/anchor, `isVisible`), Halaman & URL (slug, meta, draft→404, redirect 301), Promos & Gift Card (periode, `isPublished`, terms, banner), Journal (draft/scheduled tersaring, semua field + meta + tags), Harga katalog (`formatIdr` pakai `Intl.NumberFormat("id-ID")`, retail `null` → "Hubungi kami"), Events (`isPublished`, partner), Corporate (programs/steps/clients dari DB), toggle & urutan section homepage, nomor WhatsApp dari settings.

**Temuan — konten admin TIDAK tampil:**
| # | Temuan | Lokasi |
|---|---|---|
| H-1 | **Harga membership dari modul Harga tidak pernah tampil.** Reader tidak membaca `priceIdr`; frontend hanya memakai `priceLabel` (teks bebas) sehingga admin harus mengetik ulang harga | `src/lib/content/membership.ts:60-69` |
| H-2 | `TreatmentCategory.imageUrl` bisa diunggah admin tapi tidak dirender di halaman publik mana pun | `src/app/treatments/` |
| H-3 | Badge New/Best Seller hanya tampil di halaman detail, tidak di kartu treatment/package | `treatment-card.tsx`, `package-card.tsx`, `signature-treatments.tsx` |
| H-4 | 10 gambar scan menu + PDF hardcode, tidak lewat Media Library | `src/app/menu/page.tsx:52-58,240,253` |
| H-5 | Deskripsi SEO membership hardcode "Rp 1,5jt per bulan" — basi saat harga berubah | `src/app/membership/page.tsx:17` |
| H-6 | `plan.billingNote` dirender dua kali di kartu yang sama | `src/app/membership/page.tsx:144,148` |

**Teks yang masih hardcode (butuh kolom DB baru bila ingin bisa diubah admin):**
"What's New" + deskripsi, "Subscribe to Newsletter", "Reviews", label "KAMA Journal" (`src/components/home/sections.tsx:34,83-88,96,122`); "#kamaspa", "Follow Us" (`socials.tsx:57,69`); "Want to experience KAMA first?" (`src/app/contact/page.tsx:86`); "Main Benefits", "KAMA Essential Services", "Membership Plans", "Syarat & Ketentuan" (`src/app/membership/page.tsx:65,92,137-138,195`); kartu highlight & lebar panel mega-menu dari preset statis (`src/lib/content/navigation.ts:63-65`).

**Field yang diminta kontrak tapi belum ada di schema:**
- `CorporateClient` tidak punya `year` maupun `description`.
- `RetailProduct` tidak punya `isCollaboration` (hanya `isHighlight`) — keputusan lama yang masih menggantung.

**⚠️ Ketegangan aturan yang perlu keputusan user:**
Prompt master meminta "JANGAN fallback hardcoded, pakai empty state". Proyek ini justru sengaja memakai pola fallback ke konten statis saat tabel kosong (`socials.tsx` 12 gambar, `homepage.ts`, `corporate.ts` via `usedFallback`) supaya situs tidak pernah tampak kosong. Dua aturan ini bertabrakan — perlu keputusan mana yang menang sebelum perilaku fallback diubah.
