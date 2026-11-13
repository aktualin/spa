import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js menyimpan rahasia di .env.local; muat juga untuk Prisma CLI.
loadEnv({ path: ".env.local" });

/**
 * Migrate/CLI memakai koneksi langsung (port 5432), bukan transaction pooler;
 * aplikasi sendiri terhubung lewat DATABASE_URL di adapter saat runtime.
 *
 * Sengaja TIDAK memakai `env("DIRECT_URL")`: helper itu melempar saat berkas
 * konfigurasi ini dimuat kalau variabelnya kosong, sehingga `prisma generate`
 * ikut gagal di lingkungan build yang memang tidak punya kredensial database.
 * Akibatnya Prisma Client tidak pernah dibuat dan `@prisma/client` jadi kosong.
 * Perintah yang benar-benar menyentuh database (migrate, db execute) tetap
 * gagal dengan jelas bila URL-nya tidak ada.
 */
const rawUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

// Tabel KAMA hidup di schema sendiri (DATABASE_SCHEMA, lihat src/lib/db-schema.ts)
// karena project Supabase-nya dipakai bersama aplikasi lain. Migrate membaca
// schema dari parameter `?schema=` di URL dan membuatnya bila belum ada.
const datasourceUrl = (() => {
  const schema = process.env.DATABASE_SCHEMA?.trim();
  if (!rawUrl || !schema) return rawUrl;
  const url = new URL(rawUrl);
  url.searchParams.set("schema", schema);
  return url.toString();
})();

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(datasourceUrl ? { datasource: { url: datasourceUrl } } : {}),
});
