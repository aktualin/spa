# Todos — pekerjaan yang belum beres

Dibuat 9 Nov 2026. Lanjutan dari `progress_v2.md` (riwayat yang sudah selesai ada di sana).

Legenda: ⏳ belum · 🔄 sedang jalan · ⚠️ butuh aksi/keputusan user

---

## Keputusan yang sudah diambil (jangan ditawar ulang)

- **Tidak boleh ada konten statis/hardcode.** Admin satu-satunya sumber. Tabel kosong → empty state, bukan fallback. Jangan import `src/data/*` di jalur render publik.
- **Arsitektur data: halaman tetap Server Component yang membaca DB langsung lewat reader `src/lib/content/*`.** BUKAN fetch HTTP ke `/api/content/*`. Alasan: fetch ke API sendiri menambah hop, mematahkan revalidasi `use cache`/`updateTag`, butuh URL absolut per environment, dan menambah titik gagal. Endpoint `/api/content/*` tetap ada khusus untuk sistem luar.
- **Format harga membership tetap pendek** ("Rp 1,5jt"), bukan `formatIdr` ("Rp 1.500.000") — itu gaya desain situs.
- **`defaultSectionLayout()` di `homepage.ts` dipertahankan** sebagai struktur layout (section mana + urutan, tanpa teks/gambar). Tanpa itu homepage & footer hilang total saat tabel kosong.
- Setiap update yang lolos verifikasi langsung di-commit. Jangan stage `opencode.json`, `.env.local`, `index.html`.
- Verifikasi wajib tiap perubahan: `npx tsc --noEmit` + `node --test tests/unit/*.test.mts` + `npm run build`.

---

## ✅ Selesai sejak catatan terakhir (9 Nov 2026)

1. **Modul Cabang (Branch)** — selesai: reader, CRUD `/admin/branches`, halaman kontak & form memakai DB, seed idempoten. `tests/unit/branch.test.mts` 11/11 lolos.
2. **Teks `SiteSettings`** — selesai: `footerTagline`, `priceDisclaimer`, `bookNowLabel`/`bookNowHref`, `menuScanUrls`, `menuPdfUrl` sudah dibaca action, ditampilkan di form Pengaturan, dan fixture test diperbarui.
3. **Mega-menu + corporate + retail** — kolom schema & pemakaian ada (`src/lib/domain/menu-nav.ts`, `CorporateClient`, `isCollaboration`); tinggal verifikasi visual/CRUD.
4. **Reviews kosong** — `TestimonialsSection` sekarang `return null` bila tidak ada ulasan terbit; judul "Reviews" tidak lagi tampil tanpa kartu.
5. **Login admin dimatikan sementara** — `ADMIN_AUTH_DISABLED = true` di `src/lib/session.ts`; proxy membebaskan `/admin` + `/api/admin`, `getSession()` memakai akun ADMIN aktif pertama (email `admin@kamaspa.id`).

6. **Sisa hardcode** — selesai lewat modul **Teks Halaman** (`ContentBlock` + `/admin/page-copy`). Seluruh teks di tabel "sisa hardcode" lama (label KAMA Journal, #kamaspa, Follow Us, Want to experience KAMA first, Main Benefits, Essential Services, Membership Plans) sekarang dari DB.
7. **Sidebar admin berkelompok** — 19 modul dibagi jadi Katalog & Harga, Konten Situs, Struktur & Halaman, Pengaturan Sistem; bisa diciutkan (tersimpan di localStorage), halaman aktif ditandai dengan aturan awalan terpanjang.
8. **Petunjuk konteks per modul** — tiap modul punya `hint` "konten ini tampil di mana", dipakai tooltip sidebar, kartu dashboard, dan banner di atas isi modul.
9. **Dashboard ringkasan** — panel "Perlu perhatian": artikel terjadwal lewat waktu, backup otomatis terlambat/belum pernah sukses (ADMIN saja), inquiry baru, promo berakhir ≤7 hari, dan tiap bagian situs yang tabelnya masih kosong.
10. **Kategori Journal jadi tabel sendiri** — `JournalCategory` (slug, isPublished, sortOrder) + modul Journal › Kategori dengan geser urutan ↑/↓. Migrasi `20261109120000_journal_categories` mengisi dari kolom teks lama lalu membuangnya. Form artikel memakai dropdown.
11. **Halaman bawaan terdaftar di modul Halaman & URL** — 16 route bawaan ditampilkan lengkap dengan modul pengisi isinya dan tautan ke entri SEO-nya.

Verifikasi terakhir: `npx tsc --noEmit` lolos, `node --test tests/unit/*.test.mts` 526/526 lolos, `npm run build` sukses. Seed **belum** dijalankan, migrasi `20261109120000_journal_categories` **belum** dijalankan ke database.

---

## ⚠️ Aksi user / langkah manual

- [ ] **Aktifkan kembali login sebelum deploy** — ubah `ADMIN_AUTH_DISABLED` menjadi `false` di `src/lib/session.ts`. Selama `true`, siapa pun bisa membuka `/admin` dan memanggil `/api/admin/*` (tanpa login).
- [ ] **Jalankan `npx prisma migrate deploy`** — migrasi `20261109120000_journal_categories` memindahkan kategori Journal ke tabel sendiri dan membuang kolom `JournalPost.category`. Jalankan sebelum seed.
- [ ] **Jalankan `node scripts/seed.mts`** setelah pekerjaan di atas selesai. User sudah menyetujui ("konten halaman utama dijadikan seed di admin"). Dampak bila belum dijalankan:
  - `/privacy-policy` & `/terms-conditions` **404** (isinya sudah pindah ke `StaticPage`)
  - Judul & paragraf "What's New" dan judul "Reviews" kosong di homepage
  - Teks dari kolom `SiteSettings` baru kosong (tagline footer, Book Now, catatan harga, scan menu)
  - Tabel `Branch` kosong → daftar cabang hilang dari halaman kontak & form
  - Seed idempoten dan sengaja **tidak menimpa** suntingan admin.
- [ ] Keputusan: GIF hero 28 MB (`public/img/kama/incense_smoke_animated.gif`) diganti/dikonversi? Memperlambat muat halaman.
- [ ] Keputusan: URL utama treatment — `/menu/<slug>` vs `/treatments/...` + canonical.
- [ ] Env produksi yang wajib diisi: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (fail-closed), `RESEND_API_KEY`, `EMAIL_FROM`, opsional `CORPORATE_INQUIRY_TO`.
- [ ] Secret backup: GitHub `BACKUP_DATABASE_URL`, `BACKUP_PASSPHRASE`, `BACKUP_REPORT_URL`, `BACKUP_REPORT_SECRET`; Vercel `BACKUP_REPORT_SECRET`.

---

## 📊 Temuan: sumber konten homepage (`/`)

| Bagian | Sumber |
|---|---|
| Susunan/urutan/on-off section | DB `HomepageSection` (section lama tetap tampil walau belum ada baris; section baru hanya bila ada baris aktif) |
| Hero | DB `HomepageSection` (key `hero`); field kosong → default statis `HERO_DEFAULTS` (`src/lib/domain/homepage-banner.ts`) |
| Membership banner | DB `HomepageSection` + `MembershipProgram` (singleton); singleton belum ada → teks statis `src/data/content` (`membership`) |
| What's New | DB `HomepageHighlight` (kosong → grid tidak dirender, judul section tetap) |
| Reviews | DB `HomepageReview` (kosong → section disembunyikan) |
| Brand intro / stats | DB `HomepageStat`; teks kiri statis di `HeroStats` |
| Socials | DB `InstagramPost` + `SiteSettings.instagramUrl` (kosong semua → section hilang) |
| Booking banner | DB `HomepageSection`; kosong → `BOOKING_BANNER_DEFAULTS` statis |
| Signature Treatments | DB katalog menu (best seller); kosong → section hilang |
| Promo Highlight | DB promo/event; kosong → section hilang |
| Gallery Teaser | DB galeri; opsional feed Instagram Graph API (`INSTAGRAM_ACCESS_TOKEN`); kosong → section hilang |
| Navbar & tautan footer | DB `MenuItem` (lokasi HEADER/MOBILE/FOOTER) |
| Tagline footer, ikon sosial, nomor WA | DB `SiteSettings` |
| Teks CTA membership di footer + email partnership | Statis di kode (`src/components/footer.tsx`, sesuai keputusan arsitektur) |

Catatan: `src/data/content.ts` tinggal dipakai sebagai tipe/fallback statis terbatas (hero & membership), bukan sumber utama.

---

## ⏳ Permintaan user 9 Nov 2026 yang belum dikerjakan

### 1. Rombak layout admin (keempat area dipilih user)
- [x] **Sidebar berkelompok** — selesai. `ADMIN_GROUPS` di `src/app/admin/modules.ts`, render di `src/app/admin/admin-nav.tsx`.
- [x] **Dashboard ringkasan yang berguna** — selesai. Logika murni di `src/lib/domain/admin-dashboard.ts`.
- [ ] **Konsistensi form & daftar** — samakan pola tombol simpan, pesan sukses/galat, konfirmasi hapus, dan kontrol urutan (↑/↓) di seluruh modul. Catatan: ada dua kit yang hidup berdampingan — `admin/settings/_components/form-ui` dan `admin/promos/_kit/list-ui`; satukan dulu sebelum menyapu modul.
- [x] **Petunjuk konteks per modul** — selesai lewat field `hint` tiap modul.

### 2. Audit "dinamis + ada urutannya"
- [x] **Kategori** — treatment (`catalog.ts`) dan gallery (`gallery.ts`) sudah `orderBy: [{ sortOrder }, { name }]`. Journal dulu tidak punya urutan sama sekali; sekarang sudah lewat tabel `JournalCategory`.
- [x] **Menu** — `buildMenuTree` mengurutkan per `sortOrder` lalu label lalu id, batas 3 level dijaga `validateParent`, dan HEADER/MOBILE/FOOTER dibangun dari pohon yang sama. Tercakup `tests/unit/menu.test.mts`.

### 3. Setiap halaman dibuat di admin
- [x] **Setiap halaman publik punya barisnya di modul Halaman** — selesai, tapi tidak sebagai baris `StaticPage`. Halaman bawaan (Home, Our Story, Treatments, Gallery, Events, Promos, Gift Card, Corporate, Journal, Retail, Contact, dst.) adalah route dengan template sendiri dan slug-nya ada di `RESERVED_ROOT_SEGMENTS`, jadi tidak bisa dipindahkan ke `StaticPage` tanpa membuang tata letaknya. Modul Halaman & URL kini menampilkannya di tabel "Halaman bawaan situs" lengkap dengan modul pengisi isi dan tautan SEO-nya.
- [x] **Meta title/description + OG image** — sudah bisa diatur per halaman lewat modul SEO (`PageSeo.ogImageUrl`), termasuk untuk halaman bawaan.
- [ ] **Slug & status draft/published untuk halaman bawaan** — belum ada dan butuh keputusan: alamatnya hardcode di `src/app/`, dan menyembunyikan mis. `/gallery` akan mematikan tautan menu yang menunjuk ke sana. Halaman bebas (`StaticPage`) sudah punya keduanya.

---

## ✅ Sisa hardcode — sudah punya rumah di DB

Semua teks di daftar lama sekarang berasal dari `ContentBlock` lewat modul
**Teks Halaman** (`/admin/page-copy`); definisi kuncinya di
`src/lib/domain/page-copy.ts`. `src/data/content.ts` tinggal dipakai sebagai
tipe dan isi awal form admin (mis. `staticOurStory()`), bukan untuk dirender
ke pengunjung.

## ⏳ Hutang teknis & verifikasi

- [ ] **Empty state yang masih kurang** — `/gallery`, `/retail`, `/menu` bisa menerima daftar kosong setelah fallback dicabut tapi belum punya empty state yang wajar.
- [ ] **`membership.ts:92`** sengaja fallback ke `staticMembershipProgram()` bila singleton belum diisi — cocokkan dengan keputusan "tanpa fallback statis" atau biarkan sebagai pengecualian.
- [ ] **`next/image`** — belum dipakai di mana pun dan `next.config.ts` tidak punya `images.remotePatterns`, sehingga URL Supabase akan gagal dimuat dan layout Webflow legacy (`.image-cover`, `.image-container`) berisiko rusak. Butuh keputusan + uji visual terpisah.
- [ ] **Delta visual halaman legal** — kerangka accordion `<details>` hilang karena tag itu tidak ada di `ALLOWED_TAGS` sanitizer. Isi teks identik dan semula memang sudah terbuka. Tambahkan `details`/`summary` ke allowlist, atau terima apa adanya.
- [ ] **CSP belum dipasang** — perlu uji browser karena Leaflet/GA4/Maps.
- [ ] **Rate limit login & inquiry** tersimpan di memori per instance Vercel, tidak lintas instance.
- [ ] **Responsif & lintas browser** (Safari/Firefox/Edge) belum diverifikasi ulang.
- [ ] **Backup end-to-end** belum diuji setelah deploy.
- [ ] **BUILD-25 serah terima** — dokumen di `docs/` (perhatikan `.gitignore` mengabaikan `docs/*md`); `scripts/build-user-guide.mjs` belum di-commit.
- [ ] Uji manual CRUD seluruh modul di UI, GA4, Maps embed, feed Instagram, form inquiry + email.

---

## ✅ Refactor split ≤100 baris + verifikasi (14 Nov 2026)

Workflow `.claude/workflows/kama-admin-dynamic-refactor.js` fase Split & Verify diselesaikan:

1. **Split tuntas** — semua file `src/` ≤110 baris (target ≤100). `src/proxy.ts` 304→54 baris dipecah ke `proxy.{helpers,redirect,not-found,not-found-content,admin}.ts`; tiga file admin >110 dipecah (`analytics-data.ts`, `homepage-section-source-note.tsx`, `media-replace-hook.ts`).
2. **Fix build kritis** — 27 barrel `src/app/admin/actions/*.ts` membawa `"use server"` padahal isinya re-export; Next menolak (289 error build). Directive dipindah ke modul implementasi; barrel jadi modul biasa. Aturan ini dicatat di AGENTS.md.
3. **Fix infra test** — Playwright ikut memuat `tests/unit/*.test.mts` (loader CJS salah) → `testMatch: /\.spec\.ts$/` di `playwright.config.ts`. Import barrel yangreachable dari `node --test` diberi ekstensi `.ts` (`modules.ts`, `homepage-sections.ts`).
4. **Fix flake e2e (media S3 menahan event load)** — test hero: klik dot dulu (fokus menjeda autoplay); test layout: `reducedMotion` + abort image/media + tunggu `load` + `fonts.ready` + `test.slow()`; nav `beforeEach`: abort image/media. Semua flake sebelumnya berakar pada unduhan media S3 yang menahan `load`/`networkidle` saat worker paralel, bukan pada kode situs.
5. **AGENTS.md** — bagian Architecture decisions diperbarui: WhatsApp fully DB-driven (`waLink(message, number)`, reader `src/lib/content/whatsapp.ts`, 9 konteks), brand/SEO/footer-href/foto corporate/badge mega-menu admin-editable, form newsletter+reservasi live dengan inbox admin, microcopy via ContentBlock grup links/microcopy/forms, konvensi split ≤100 baris. Managed block tidak disentuh.

Verifikasi: `npx tsc --noEmit` ✅, `npm run build` ✅, `npm run test:unit` 593/593 ✅, `npm run test:e2e` **120 passed / 0 failed** (16 skip kondisional: drawer per-viewport & test butuh DATABASE_URL) termasuk proyek `admin-flows` ✅. Audit integritas split (97 barrel vs HEAD): bersih, tanpa simbol publik yang hilang tanpa pengganti. Verifikasi visual production (server sendiri :3312, 3 viewport + 6 route): **tanpa defect tingkat kode** — tanpa overflow horizontal, aturan anti-jomplang lolos (kartu treatment/package/membership/kontak/corporate equal-height + CTA rata bawah), clearance header benar, hero media ada, mobile bersih, tanpa masalah bucket S3. "Blank section" pada capture = artifact timing scroll-reveal (safety-net 10s), bukan konten tersembunyi; anomali gambar/empty-state = data uji e2e yang mutating DB bersama.
Sync doc tambahan: bagian "Maps" AGENTS.md ternyata stale bawaan lama (bukan regresi refactor) — `/contact` kini merender Leaflet/OSM overview (`location-map.tsx`) + kartu `LocationInfo` + iframe opsional `SiteSettings.mapsEmbedUrl`; route `/locations` & `location-cards.tsx` sudah tidak ada; cabang dari DB. Doc sudah dicocokkan ke kode.
Catatan lingkungan: port :3000 mesin ini dipakai proyek lain; dev KAMA di :3001, e2e production di :3311.

### Backlog DRY lintas-scope (audit 14 Nov 2026)

Duplikasi yang tersisa karena 4 split agent hanya boleh menyentuh scope masing-masing. **Subset aman sudah dikerjakan 14 Nov 2026** (type-check + unit 593/593 green; e2e konfirmasi menyusul):

- [x] `firstIssue` (pembaca error zod): 7 salinan lokal/inline → `src/app/admin/promos/_kit/schema.ts:22`.
- [x] `CONTENT_ROLES`/`ADMIN_ONLY` lokal (treatments.helpers, content-images.helpers, backup) → `src/lib/domain/roles.ts` (helpers kini re-export agar surface publik tetap).
- [x] Pembaca formData `field` (backup, settings.helpers, seo.settings) → delegasi `form-utils.ts:10 formStr`; `readStatus` (reservations) → `form-utils.ts:27 readInquiryStatus`.
- [x] Trio revalidasi redirect (6 salinan: journal/treatments/categories/packages/pages.helpers + events.save) → `redirects.helpers.ts:9 revalidateRedirects`.

Sisa (butuh keputusan desain / cakupan lebih besar, belum dikerjakan):

- [ ] `ActionState` `{ error: string|null; ok?: boolean }`: 23 deklarasi identik di `actions/*.helpers.ts` → satu type bersama (perhatikan varian: categories & journal-categories tanpa `ok`, media.types menambah `message`, users.helpers beda).
- [ ] Regex slug / `slugSchema` / union `imageUrl` / `optionalText`: beberapa salinan → `src/lib/domain/slug.ts` + `_kit/schema.ts` (putuskan dulu aturan imageUrl: bebas vs https-only).
- [ ] Swap adjacent index-based: 6 salinan setState client + `reorderIds` → satu helper bersama; `reorderSiblings` bisa dibangun di atas `reorderUpdates`.
- [ ] Wrapper confirm-delete (`_kit/form-buttons` vs `settings/_components/form-ui`) → satukan hati-hati (beda hanya label pending).
- [ ] Pagination inbox (PAGE_SIZE 25 + parse page) di reservations/newsletter/corporate.inquiries → helper bersama.
- [ ] `revalidateHighlights` vs `revalidateHeroSlides` identik modulo path → satu helper berparameter.
