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

## 🔄 Sedang dikerjakan subagent (saat catatan ini dibuat)

Ketiganya mengubah `scripts/seed.mts`, jadi **seed belum boleh dijalankan sampai ketiganya selesai**.

1. **Modul Cabang (Branch)** — reader `src/lib/content/branches.ts`, CRUD `/admin/branches`, dan render di `contact/page.tsx`, `reservation-form.tsx`, `newsletter-form.tsx`, `location-info.tsx`, `location-map.tsx` (`COORDS` hardcode → `latitude`/`longitude` dari DB).
2. **Teks `SiteSettings`** — `footerTagline`, `bookNowLabel`/`bookNowHref`, `priceDisclaimer`, dan **H-4** `menuScanUrls` + `menuPdfUrl` (10 scan menu & PDF ke Media Library), plus isiannya di modul Pengaturan.
3. **Mega-menu + corporate + retail** — `MenuItem.highlightImageUrl/highlightLabel/highlightHref/panelWidth` menggantikan preset statis di `navigation.ts:63-65`; `CorporateClient.year`/`description`; `RetailProduct.isCollaboration` dipisah dari `isHighlight`.

---

## ⚠️ Aksi user / langkah manual

- [ ] **Jalankan `node scripts/seed.mts`** setelah ketiga subagent di atas selesai. User sudah menyetujui ("konten halaman utama dijadikan seed di admin"). Dampak bila belum dijalankan:
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

## ⏳ Permintaan user 9 Nov 2026 yang belum dikerjakan

### 1. Rombak layout admin (keempat area dipilih user)
- [ ] **Sidebar berkelompok** — 19+ modul dikelompokkan (Konten, Katalog, Pengaturan, Sistem), tandai halaman aktif, bisa diciutkan.
- [ ] **Dashboard ringkasan yang berguna** — inquiry baru, artikel terjadwal, promo akan berakhir, section yang masih kosong, status backup.
- [ ] **Konsistensi form & daftar** — samakan pola tombol simpan, pesan sukses/galat, konfirmasi hapus, dan kontrol urutan (↑/↓) di seluruh modul.
- [ ] **Petunjuk konteks per modul** — tiap modul menjelaskan singkat konten itu tampil di mana pada situs. Berguna untuk training & serah terima.

### 2. Audit "dinamis + ada urutannya"
- [ ] Pastikan **kategori** (treatment, gallery, journal) benar-benar dari DB dan `sortOrder`-nya tercermin di web.
- [ ] Pastikan **menu** dinamis dan berurutan di header, footer, dan mobile (3 level). Sudah diaudit OK sebelumnya — verifikasi ulang setelah perubahan mega-menu selesai.

### 3. Setiap halaman dibuat di admin
- [ ] Pastikan **setiap halaman publik punya barisnya di modul Halaman** (`StaticPage`), bukan hanya halaman legal. Periksa: Home, Our Story, Treatments, Gallery, Events, Promos, Gift Card, Corporate Wellness, Journal, KAMA Retail.
- [ ] Setiap halaman bisa diatur slug, judul, meta title/description, OG image, dan status draft/published dari admin.

---

## ⏳ Sisa hardcode yang belum punya rumah di DB

| Teks | Lokasi | Catatan |
|---|---|---|
| Label "KAMA Journal" per kartu | `src/components/home/sections.tsx:36` | Milik `HomepageHighlight`, bukan `HomepageSection`. Butuh kolom `sourceLabel`, atau cukup andalkan `tag` yang sudah ada |
| "#kamaspa", "Follow Us" | `src/components/home/socials.tsx:57,69` | Butuh kolom teks |
| "Want to experience KAMA first?" | `src/app/contact/page.tsx:86` | Butuh kolom teks |
| "Main Benefits", "KAMA Essential Services", "Membership Plans", "Syarat & Ketentuan" | `src/app/membership/page.tsx:65,92,137-138,195` | Butuh kolom teks di `MembershipProgram` |
| Banner membership homepage | `src/components/home/hero.tsx:170-175` | Kolom `bannerCtaLabel`/`bannerCtaHref` **sudah dibuat**, tinggal dipakai |
| Pusat peta `[-6.234, 106.801]` | `src/components/contact/location-map.tsx:22` | Belum punya kolom; bisa dihitung dari rata-rata koordinat cabang |

---

## ⏳ Hutang teknis & verifikasi

- [ ] **Empty state yang masih kurang** — `/gallery`, `/retail`, `/menu` bisa menerima daftar kosong setelah fallback dicabut tapi belum punya empty state yang wajar.
- [ ] **`membership.ts:92`** masih punya `throw`-on-empty yang tersisa.
- [ ] **`next/image`** — belum dipakai di mana pun dan `next.config.ts` tidak punya `images.remotePatterns`, sehingga URL Supabase akan gagal dimuat dan layout Webflow legacy (`.image-cover`, `.image-container`) berisiko rusak. Butuh keputusan + uji visual terpisah.
- [ ] **Delta visual halaman legal** — kerangka accordion `<details>` hilang karena tag itu tidak ada di `ALLOWED_TAGS` sanitizer. Isi teks identik dan semula memang sudah terbuka. Tambahkan `details`/`summary` ke allowlist, atau terima apa adanya.
- [ ] **CSP belum dipasang** — perlu uji browser karena Leaflet/GA4/Maps.
- [ ] **Rate limit login & inquiry** tersimpan di memori per instance Vercel, tidak lintas instance.
- [ ] **Responsif & lintas browser** (Safari/Firefox/Edge) belum diverifikasi ulang.
- [ ] **Backup end-to-end** belum diuji setelah deploy.
- [ ] **BUILD-25 serah terima** — dokumen di `docs/` (perhatikan `.gitignore` mengabaikan `docs/*md`); `scripts/build-user-guide.mjs` belum di-commit.
- [ ] Uji manual CRUD seluruh modul di UI, GA4, Maps embed, feed Instagram, form inquiry + email.
