# Progres Website KAMA Spa (kamaspa.id)

Checklist pelaksanaan kontrak **01/PKS/XI/KAMA/2026**. Sumber kebenaran: Lampiran I kontrak, bukan dokumen `.claude/plans/` (dokumen plan pernah memuat klaim yang tidak sesuai repo — lihat catatan di `.claude/plans/00-INDEX.md`).

- **Terakhir diperbarui:** 8 November 2026
- **Terverifikasi dengan:** `npx tsc --noEmit` → 0 error ✅ · `npm run build` → 108 halaman ter-generate ✅ · `npm run test:unit` → 133 passed / 0 failed ✅ · `npx playwright test` → 53 passed / 0 failed / 16 skipped ✅ · `node scripts/check-routes.mjs` → 42/42 route wajib ada, semua invariant lolos ✅ · `prisma migrate status` → *Database schema is up to date* ✅

Legenda: ✅ selesai & terverifikasi · 🔧 sebagian · ⬜ belum dimulai · ⚠️ perlu keputusan/aksi

> **Penting — jangan tertukar.** Tabel A adalah **termin pembayaran kontrak** (Lampiran I Bagian E), dipakai untuk menagih. Tabel B adalah **urutan kerja teknis internal** yang sengaja dibalik (dashboard dulu, halaman publik belakangan) sesuai `.claude/plans/03-milestone-build.md`. Progres teknis yang tinggi **tidak** otomatis berarti termin kontraknya boleh ditagih.

---

## A. Termin Kontrak (dasar penagihan)

| Tahap kontrak | Deliverable wajib menurut Lampiran I | Target | Bobot | Status |
|---|---|---|---|---|
| 1 — Persiapan & Desain | Kick-off, **sitemap disetujui**, **mockup homepage + contoh halaman dalam disetujui klien** | 16 Nov 2026 | 20% | ⬜ **0%** — belum ada file desain, belum ada persetujuan tertulis klien |
| 2 — Pengembangan Halaman | Seluruh halaman Bagian B tampil di staging/preview | 30 Nov 2026 | 30% | ✅ ~95% — seluruh route Bagian B ada dan terhubung database; sisa: tayang di domain resmi |
| 3 — Dashboard, Integrasi & Konten | Admin dashboard, 10 fitur/integrasi, input konten awal → website lengkap siap UAT | 9 Des 2026 | 30% | 🔧 ~80% — 14 modul CRUD jadi; sisa: GA4, feed Instagram, captcha, e-mail PIC (semuanya menunggu kredensial klien) |
| 4 — Pengujian, Revisi & Serah Terima | UAT, revisi, go-live, pelatihan, BAST | 9 Jan 2027 | 20% | 🔧 ~30% — test & dokumen serah terima siap; sisa: UAT bersama klien, go-live, pelatihan, BAST |

> ⚠️ **Risiko jadwal.** Target Tahap 1 adalah 16 Nov 2026 (8 hari lagi) dan deliverable utamanya — mockup desain disetujui klien — belum dimulai. Ini deliverable kontraktual, bukan opsional. Denda keterlambatan 1%/hari (maks 10%) berlaku per Pasal 12.

## B. Urutan Kerja Teknis Internal

| Langkah teknis | Status |
|---|---|
| 0 — Fondasi database | ✅ selesai |
| 1 — Setup + Auth + Layout Admin | ✅ selesai (kecuali deliverable desain, lihat Tabel A) |
| 1b — Seeder konten statis → database | ✅ selesai |
| 2 — 14 modul CRUD admin | ✅ 14 / 14 |
| 3 — Halaman publik + integrasi | ✅ route lengkap; 🔧 integrasi menunggu kredensial klien |
| 4 — Testing, revisi, serah terima | 🔧 test & dokumen siap, eksekusi serah terima belum |

---

## Langkah 0 — Fondasi Database ✅

- [x] `prisma/schema.prisma` — **23 model** diturunkan dari Lampiran I
- [x] Migration `prisma/migrations/0_init/` diterapkan ke Supabase `igdkgtszeamnlkhcztfh`
- [x] Prisma 7.10.1; Migrate memakai `DIRECT_URL` (:5432) via `prisma.config.ts`
- [x] Prisma Client ter-generate

> ⚠️ Operasional: saat mengarahkan output CLI Prisma ke file, **buang baris `◇`** (banner dotenvx). Banner ini pernah masuk ke `migration.sql` dan menyebabkan `syntax error at or near "◇"`.

## Langkah 1 — Setup, Auth, Layout Admin ✅

- [x] `src/lib/prisma.ts` — PrismaClient + `@prisma/adapter-pg` (transaction pooler :6543), cache global anti hot-reload
- [x] `src/lib/password.ts` — `scrypt` bawaan Node + `timingSafeEqual`
- [x] `src/lib/session.ts` — JWT HS256 (`jose`), cookie httpOnly `kama_admin_session`, 8 jam
- [x] `src/lib/auth.ts` — `getSession()` / `requireSession()` / `requireRole()`
- [x] `src/middleware.ts` — guard `/admin/*` di Edge, tanpa Prisma
- [x] `src/app/admin/actions/auth.ts` — login/logout, validasi `zod`
- [x] Pembatasan percobaan login (Lampiran I poin 8): 5× gagal → kunci 15 menit
- [x] Pesan error seragam (tidak membocorkan email terdaftar) + proteksi open redirect `?next=`
- [x] `/admin/login`, `/admin` (dashboard), layout sidebar 14 modul role-aware
- [x] `src/app/admin/modules.ts` — definisi 14 modul, sumber tunggal sidebar
- [x] `scripts/create-admin.mjs` + `ADMIN_SESSION_SECRET` di `.env.local`
- [x] Akun `admin@kamaspa.id` (ADMIN) dibuat — ⚠️ **kata sandi sementara, wajib diganti**
- [x] Diverifikasi Playwright: `/admin` → redirect login → masuk → dashboard 14 modul

Utang teknis dari langkah ini:
- [ ] ⚠️ **Area admin belum punya test sama sekali** — 53 test yang hijau semuanya menguji situs publik lama
- [ ] `/admin/logout` sebagai route belum ada (logout baru berupa Server Action); `02-sitemap-final.md` mencantumkannya sebagai route
- [ ] Konvensi `middleware` sudah deprecated di Next.js 16 → migrasi ke `proxy` (`npx @next/codemod@canary middleware-to-proxy .`)

## Langkah 1b — Seeder ✅

`node scripts/seed.mts` — idempoten (upsert by slug/key), memetakan `src/data/*` ke database:

- 4 kategori sesuai kontrak: Reflexology, Body Massage, All Day Spa, Add-ons
- 15 treatment + opsi durasi/harga (parsing `"145k"` → `145000`, `"1.5jt"` → `1500000`, `"2 hours"` → `120`) — **0 opsi dengan harga/durasi invalid**
- 3 tier membership, 3 artikel journal, pengaturan situs, 4 template WhatsApp, 7 section homepage

## Langkah 2 — 14 Modul CRUD Admin ✅ (14 / 14)

| # | Modul | Route admin | Model | Status |
|---|---|---|---|---|
| 1 | Treatments & Packages | `/admin/treatments`, `/admin/treatments/packages` | `TreatmentCategory`, `Treatment`, `TreatmentOption`, `Package`, `PackageItem` | ✅ |
| 2 | Harga | `/admin/treatments/prices` | `TreatmentOption.priceIdr` | ✅ |
| 3 | Foto & Gallery | `/admin/gallery`, `/admin/gallery/albums/[albumId]` | `GalleryAlbum`, `GalleryPhoto` | ✅ |
| 4 | Promos & Gift Card | `/admin/promos`, `/admin/gift-card` | `Promo`, `GiftCardInfo` | ✅ |
| 5 | Membership | `/admin/membership` | `MembershipTier` | ✅ |
| 6 | Journal | `/admin/journal` (+ pratinjau) | `JournalPost` | ✅ |
| 7 | Events | `/admin/events` | `EventItem`, `EventPhoto` | ✅ |
| 8 | KAMA Retail | `/admin/retail` | `RetailProduct` | ✅ |
| 9 | Corporate Wellness | `/admin/corporate`, `/admin/corporate/inquiries` | `CorporateContent`, `CorporateInquiry` | ✅ |
| 10 | Homepage & Our Story | `/admin/homepage`, `/admin/our-story` | `HomepageSection`, `OurStoryContent` | ✅ |
| 11 | Menu Navigasi | `/admin/menu` | `MenuItem` | ✅ |
| 12 | Kontak & Umum | `/admin/settings/contact`, `/admin/settings/whatsapp` | `SiteSettings`, `WhatsAppTemplate` | ✅ |
| 13 | SEO | `/admin/seo` | `PageSeo` | ✅ |
| 14 | Pengguna Admin (ADMIN saja) | `/admin/users` | `AdminUser` | ✅ |

Pola yang dipakai seragam di seluruh modul:
- Setiap Server Action memanggil `requireRole()` lebih dulu, lalu validasi `zod`, lalu tulis ke database.
- Setelah menulis: `updateTag(CONTENT_TAGS.<modul>)` + `revalidatePath()`, sehingga halaman publik ikut menyegarkan diri.
- Modul Pengguna Admin hanya untuk peran ADMIN (`src/app/admin/users/guard.ts`); EDITOR diarahkan kembali ke dashboard.
- Sistem menolak aksi yang membuat tidak ada akun ADMIN aktif tersisa, dan menolak admin menurunkan perannya sendiri.
- Konten HTML dari editor dibersihkan `src/lib/domain/sanitize.ts` sebelum dirender di halaman publik.

Upload gambar ✅ (Supabase Storage via S3 API):
- `src/lib/storage.ts` — klien S3, validasi tipe (JPG/PNG/WebP/AVIF) & ukuran maks 5 MB, nama file acak UUID (mencegah tabrakan + path traversal)
- `POST /api/upload` — wajib sesi admin; ✅ diuji: tanpa sesi → `401 {"error":"Tidak terautentikasi."}`
- `src/app/admin/image-field.tsx` — komponen upload reusable dengan pratinjau, dipakai ulang di semua modul
- **Database hanya menyimpan URL**, bukan biner
- Gambar lama otomatis dihapus dari bucket saat diganti atau saat datanya dihapus, agar tidak menumpuk file yatim

Konfigurasi: bucket `kamaspa.id` (mode publik). Env: `SUPABASE_S3_*` + `SUPABASE_S3_BUCKET` + `NEXT_PUBLIC_SUPABASE_PUBLIC_URL`.

## Langkah 3 — Halaman Publik & Integrasi 🔧

### Route (Lampiran I Bagian B) ✅

Seluruh route wajib ada dan terverifikasi `node scripts/check-routes.mjs` (42/42).
Setiap halaman publik memuat `<Navigation>`, `<main>`, dan `<Footer>`.

| Route kontrak | Kondisi sekarang |
|---|---|
| Homepage `/` | ✅ terhubung database (section dapat di-toggle dari dashboard) |
| `/contact` | ✅ |
| `/treatments`, `/treatments/[kategori]`, `/treatments/[kategori]/[slug]` | ✅ dari database |
| `/treatments/packages`, `/treatments/packages/[slug]` | ✅ |
| `/menu`, `/menu/[slug]` | ✅ dipertahankan — tampilan lama, datanya kini dari database |
| `/our-story`, `/our-story/journal`, `/our-story/journal/[slug]` | ✅ |
| `/retail` | ✅ |
| `/gallery` | ✅ dengan lightbox |
| `/events`, `/events/[slug]`, `/events/collaborations` | ✅ |
| `/promos`, `/promos/[slug]`, `/promos/membership` | ✅ |
| `/gift-card` | ✅ |
| `/corporate-wellness`, `/corporate` | ✅ |
| `/membership` | ✅ |
| `/privacy-policy`, `/terms-conditions` | ✅ (di luar Lampiran I, bonus) |
| `/sitemap.xml`, `/robots.txt` | ✅ dibangkitkan otomatis dari isi database |

Catatan teknis route dinamis di Next 16 (`cacheComponents` aktif):
- Rute dengan daftar slug yang pasti terisi memakai `generateStaticParams`.
- Rute yang daftarnya bisa kosong (event, promo) memakai `DeferredNavigation`
  (`Navigation` di dalam `Suspense`), karena `generateStaticParams` yang
  mengembalikan array kosong akan menggagalkan build.

### Section homepage (Bagian B.2)

Komposisi nyata `src/app/page.tsx`: `Hero` → `MembershipBanner` → `WhatsNewSection` → `TestimonialsSection` → `HeroStats` → `SocialsSection` → `BookingBanner` → `Footer`.

| Section kontrak | Kondisi |
|---|---|
| Hero (slider + tagline + Book Now) | ✅ `Hero` |
| Brand Intro | 🔧 kemungkinan `HeroStats` — perlu dicocokkan ke copy final |
| Signature Treatments (highlight 3–4) | ⬜ belum ada |
| Promo / Event Highlight (toggle dashboard) | 🔧 `WhatsNewSection` ada, tapi belum terhubung DB & belum bisa di-toggle |
| Gallery Teaser + Instagram Feed | 🔧 `SocialsSection` ada (tautan sosial statis), **bukan** feed Instagram sungguhan |
| Reviews | ✅ `TestimonialsSection` |
| Footer | ✅ lengkap (kontak, sosial, quick links) |

### 10 Fitur & Integrasi (Bagian C)

- [x] **WhatsApp click-to-chat** — berfungsi, pesan pre-filled (`src/lib/whatsapp.ts`); nomor & template dapat diubah dari `/admin/settings/whatsapp`
- [x] **Tampilan responsif** — teruji Playwright di 390 / 768 / 1440
- [x] **Basic SEO** — meta per halaman (dapat ditimpa dari modul SEO), `sitemap.xml`, `robots.txt`, Open Graph + `metadataBase`, favicon. ⬜ Verifikasi Google Search Console menunggu akun klien
- [x] **Formulir inquiry Corporate** — tersimpan ke database, tampil di `/admin/corporate/inquiries`. Perlindungan: honeypot, jeda minimal 3 detik, rate limit 5 permintaan/10 menit per IP, dan Cloudflare Turnstile (aktif begitu kunci diisi)
- [x] **Keamanan dasar** — kata sandi `scrypt`, cookie sesi httpOnly, pengecekan peran di setiap Server Action, sanitasi HTML konten admin, `/admin` dan `/api` diblokir dari pengindeksan
- [x] **Backup database** — `./scripts/backup-db.sh` (dump terkompresi). ⬜ Penjadwalan mingguan otomatis belum dipasang
- [ ] ⚠️ **Google Analytics 4** — menunggu Measurement ID dari klien
- [ ] ⚠️ **Feed Instagram sungguhan** — menunggu access token; sementara memakai gambar statis
- [ ] ⚠️ **Notifikasi e-mail inquiry ke PIC** — menunggu `RESEND_API_KEY` + alamat PIC
- [ ] ⚠️ **Peta lokasi** — terpasang memakai Leaflet/OpenStreetMap; kontrak menyebut Google Maps, perlu keputusan klien
- [ ] Pelatihan & dokumentasi — dokumen siap (`docs/`), sesi pelatihan belum dijadwalkan

### Konten yang sudah tersedia di `src/data/content.ts`

Bahan seeder sebagian besar **sudah ada** dan cocok dengan kontrak:

| Kategori kontrak | Isi kontrak | Ada di repo |
|---|---|---|
| Reflexology | Chair Reflexology, Chair Spa, Chair Body Recovery | ✅ 3/3 |
| Body Massage | Sukmalaya, Urip Padma, Skogsra Massage | ✅ 3/3 |
| All Day Spa | Sabda Raga, Karuna, Aroha, Dharana, Samadhana | 🔧 4/5 — array `packages` berisi Samådhåna, Dhåranå, Åroha, Karuna; **Sabda Raga belum ada** |
| Add-ons | Face Ritual, Head & Scalp, Bath Ritual, Body Mask, Body Scrub | ✅ 5/5 di `additionalServices` |
| Packages (sub-menu tersendiri) | tidak dirinci kontrak | ⬜ belum ada — array `packages` sudah terpakai untuk All Day Spa |

Array nyata di `content.ts`: `treatments` 6 item, `packages` 4 item, `additionalServices` 5 item, `journalPosts` 3 item, `locations` 3 item, plus `corporateBenefits`, `corporateSolutions`, `corporatePrograms`, `heroStats`, `testimonials`, `membership`.

## Langkah 4 — Testing, Revisi, Serah Terima 🔧

- [x] Playwright terpasang — 23 test × 3 viewport = 53 passed / 16 skipped (skip disengaja: drawer mobile vs desktop)
- [x] Unit test dengan runner bawaan Node (`npm run test:unit`) — **133 passed / 0 failed**, mencakup pricing, slug, visibility, events, roles, password, template WhatsApp, rate limit, sanitasi HTML, format rupiah & nomor WhatsApp, serta validasi inquiry
- [x] Pemeriksaan route otomatis — `node scripts/check-routes.mjs`
- [x] Dokumen serah terima — `docs/TECH_HANDOVER.md`, `docs/user-guide/`, `docs/BAST-CHECKLIST.md`, `docs/TRAINING-AGENDA.md`, `docs/REVISION-TRACKER.md`
- [x] `.env.example` + `scripts/backup-db.sh`
- [ ] ⚠️ Test untuk area admin (login, guard, peran) — belum ada
- [ ] Integration test I1–I15 (`05-rencana-testing.md`)
- [ ] UAT checklist bersama klien
- [ ] Go-live `kamaspa.id` + SSL
- [ ] Pelatihan admin ±2 jam + video tutorial
- [ ] Serah terima aset & akses (lihat `docs/BAST-CHECKLIST.md` bagian E)
- [ ] BAST + pelunasan 60%

---

## ⚠️ Butuh Keputusan / Aksi

Daftar lengkap beserta dampaknya ada di `docs/REVISION-TRACKER.md`.

| # | Hal | Oleh | Mendesak? |
|---|---|---|---|
| 1 | **Mockup/desain homepage + contoh halaman dalam** — deliverable Tahap 1, target 16 Nov | Anda + klien | 🔴 Ya |
| 2 | Pengarahan domain `kamaspa.id` ke Vercel + konfirmasi siapa pemegang domain | Klien | 🔴 Ya — memblokir go-live |
| 3 | GA4 & Search Console didaftarkan atas nama e-mail klien, lalu kirim Measurement ID | Klien | 🔴 Ya — kriteria BAST |
| 4 | Peta: terima Leaflet/OpenStreetMap, atau ganti ke Google Maps embed (butuh API key berbayar) | Klien | 🟡 |
| 5 | Kunci Cloudflare Turnstile untuk captcha formulir corporate | Klien | 🟡 |
| 6 | `RESEND_API_KEY` + alamat e-mail PIC penerima notifikasi inquiry | Klien | 🟡 |
| 7 | Access token Instagram untuk feed sungguhan | Klien | 🟡 |
| 8 | Data treatment **Sabda Raga** (deskripsi, durasi, harga) | Klien | 🟡 |
| 9 | Ganti kata sandi `admin@kamaspa.id`; tentukan e-mail admin sebenarnya | Anda | 🟡 |
| 10 | Transfer kepemilikan project Supabase ke akun klien | Anda + klien | 🟡 |
| 11 | File desain & aset grafis final (Pasal 5) | Klien | 🟡 |
| 12 | Penjadwalan backup mingguan otomatis | Anda | 🟡 |

### Utang teknis yang diketahui

- Area admin belum punya test otomatis sama sekali.
- `dotenv` dipakai `prisma.config.ts` dan `scripts/*`, tapi belum terdaftar sebagai dependency langsung di `package.json` (saat ini tersedia secara transitif).
- Sesi admin tidak bisa dicabut sebelum JWT-nya kedaluwarsa (8 jam), karena verifikasi tidak menyentuh database.
- `prisma migrate deploy` belum berjalan otomatis saat build di Vercel.
- Belum ada CI.
- Kategori treatment belum punya CRUD di dashboard — hanya bisa diubah lewat seeder. `TreatmentCategory` memakai `onDelete: Restrict`.
- Field gambar di modul Homepage, Our Story (hero), dan SEO (OG image) masih meminta URL manual, belum memakai komponen unggah `ImageField` seperti modul lain.
- Akun admin tidak bisa dihapus (hanya dinonaktifkan) dan alamat e-mailnya tidak bisa diubah.

## Perintah Berguna

```bash
npm run dev                  # server pengembangan
npm run build                # build produksi + type-check
npm run test:unit            # unit test (runner bawaan Node)
npx playwright test          # E2E (build produksi di port 3311)
node scripts/check-routes.mjs  # cek seluruh route wajib + invariant halaman
npx tsc --noEmit -p .        # type-check saja
npx prisma migrate status    # cek sinkronisasi DB
npx prisma studio            # jelajahi isi database

# Buat / reset akun admin
node scripts/create-admin.mjs <email> <password> ADMIN "Nama Lengkap"

# Backup database (hasil di ./backups, tidak ikut ter-commit)
./scripts/backup-db.sh
```
