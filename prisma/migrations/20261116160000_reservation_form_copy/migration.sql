-- Jamin seluruh teks (ContentBlock grup "forms") yang dipakai form reservasi
-- publik (/contact & /reservation) tersedia di database.
--
-- Blok dasar ini dikelola seed-content.mts, tetapi tidak ada langkah seed saat
-- deploy (build hanya `prisma generate && next build`), sehingga database yang
-- di-seed sebelum kunci ini ada tidak memilikinya — form dirender kosong. Migrasi ini
-- mengisinya. Idempoten: ON CONFLICT DO NOTHING menghormati nilai yang sudah
-- ada (termasuk suntingan admin), jadi aman dijalankan di DB mana pun.

INSERT INTO "ContentBlock" ("key", "group", "value", "updatedAt") VALUES
  ('forms.reservation.title', 'forms', 'Reservasi', now()),
  ('forms.reservation.description', 'forms', 'Sampaikan treatment yang Anda inginkan — tim KAMA akan menghubungi Anda untuk konfirmasi jadwal.', now()),
  ('forms.reservation.name_label', 'forms', 'Nama', now()),
  ('forms.reservation.phone_label', 'forms', 'Nomor telepon', now()),
  ('forms.reservation.email_label', 'forms', 'Alamat email', now()),
  ('forms.reservation.branch_label', 'forms', 'Pilih cabang', now()),
  ('forms.reservation.message_label', 'forms', 'Catatan tambahan (opsional)', now()),
  ('forms.reservation.submit_label', 'forms', 'Kirim Reservasi', now()),
  ('forms.reservation.success', 'forms', 'Terima kasih! Permintaan reservasi Anda sudah diterima. Kami akan menghubungi Anda segera.', now()),
  ('forms.reservation.error', 'forms', 'Oops! Terjadi kesalahan. Coba lagi.', now())
ON CONFLICT ("key") DO NOTHING;
