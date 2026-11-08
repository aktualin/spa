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
| 10 | Journal | ✅ | `d71603c` |
| 11 | Events | ✅ | `7b700d2`, `473bfa7` |
| 12 | KAMA Retail | ✅ | `85a336d` |
| 13 | Corporate Wellness | ✅ | `65c5f9b`, `c86df3d` |
| 14 | Homepage & Our Story | ✅ | `c7b18fe` |
| 15 | Kontak & Umum (alamat, jam, WA, email, sosmed, Maps, Fresha, IG username, GA4 ID) | ⏳ | |
| 16 | SEO (meta per halaman/artikel, OG image, favicon, sitemap/robots dari DB, GSC) | ⏳ | |
| 17 | Pengguna Admin (CRUD, role, ganti password, batas akses per role) | ⏳ | |
| 18 | WhatsApp Templates (per konteks, nomor dari settings, click-to-chat, Book Now) | ⏳ | |
| 19 | Backup & Status (backup terakhir, SSL, domain, versi, backup manual/otomatis) | ⏳ | |
| 20 | Homepage dinamis (hero, brand intro, signature, promo/event highlight, gallery, IG feed, reviews, footer) | ⏳ | |
| 21 | Halaman publik yang belum ada (cek kelengkapan + slug DB + redirect 301) | ⏳ | |
| 22 | Integrasi WhatsApp, GA4, Google Maps, Instagram feed | ⏳ | |
| 23 | Hardening (responsif, browser, HTTPS, gambar, login limit, Zod, sanitasi, rate limit) | ⏳ | |
| 24 | Testing sesuai PLAN-9 + perbaikan sampai DoD PLAN-8 | ⏳ | |
| 25 | Serah terima sesuai PLAN-10 | ⏳ | |

## Catatan per butir

### Keputusan yang menunggu user
- Retail: produk kolaborasi masih memakai `isHighlight` (label "Highlight / Kolaborasi"). Field terpisah butuh kolom DB baru.
- Homepage: teks Reviews, Brand Intro, Socials, judul bagian Our Story masih hardcode (butuh kolom baru) — akan ditinjau di BUILD-20.
- Env produksi: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (wajib, fail-closed), `RESEND_API_KEY`, `EMAIL_FROM`, opsional `CORPORATE_INQUIRY_TO`.
