import { createRateLimiter } from "@/lib/domain/rate-limit";

/**
 * Rate limit sederhana (memori per instance) untuk aksi backup. Cukup untuk
 * mencegah klik beruntun / penyalahgunaan; bukan batas lintas instance.
 */

/** Ekspor JSON: 3 kali per 15 menit per admin. */
export const jsonExportLimiter = createRateLimiter({ limit: 3, windowMs: 15 * 60 * 1000 });

/** Memicu GitHub Actions: 3 kali per jam per admin. */
export const githubDispatchLimiter = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

/** Endpoint laporan backup otomatis: 30 permintaan per jam per IP (hash). */
export const backupReportLimiter = createRateLimiter({ limit: 30, windowMs: 60 * 60 * 1000 });
