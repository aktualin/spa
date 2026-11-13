/**
 * Muat .env.local (lalu .env) SEBELUM modul lain dievaluasi. Import ESM
 * dievaluasi berurutan, jadi skrip yang mengimpor data situs (mis.
 * src/data/content.ts, yang memanggil `asset()` saat dimuat) wajib mengimpor
 * modul ini paling atas — kalau tidak, URL gambar jatuh ke path lokal.
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });
