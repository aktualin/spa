/**
 * Pembatas laju (rate limit) berbasis memori.
 *
 * Dipakai form Corporate Wellness agar tidak bisa dipakai spam. Penyimpanan di
 * memori instance: cukup untuk satu instance Vercel, dan langsung reset ketika
 * instance di-restart. Bila proyek butuh limit lintas instance, penyimpanannya
 * perlu dipindah ke tempat bersama (tabel database baru atau Redis) — lihat
 * docs/TECH_HANDOVER.md.
 */

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  /** Milidetik sampai permintaan berikutnya diizinkan. */
  retryAfterMs: number;
};

type Bucket = { count: number; resetAt: number };

export type RateLimiter = {
  check(key: string): RateLimitDecision;
  reset(key?: string): void;
};

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const buckets = new Map<string, Bucket>();
  const { limit, windowMs } = options;

  function check(key: string): RateLimitDecision {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: bucket.resetAt - now,
      };
    }

    bucket.count += 1;
    return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 };
  }

  function reset(key?: string) {
    if (key === undefined) buckets.clear();
    else buckets.delete(key);
  }

  return { check, reset };
}

/** Limitir yang dipakai endpoint corporate inquiry. */
export const corporateInquiryLimiter = createRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000, // 5 permintaan per 10 menit per IP
});

/** Limitir login admin — lapis kedua setelah penguncian akun di database. */
export const loginLimiter = createRateLimiter({
  limit: 10,
  windowMs: 15 * 60 * 1000,
});
