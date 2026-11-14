/** Verifikasi Google Search Console — lihat `seo.ts`. */

const GSC_TOKEN = /^[A-Za-z0-9_-]{10,100}$/;

export type GscParseResult =
  | { ok: true; code: string | null }
  | { ok: false; error: string };

/**
 * Menerima kode verifikasi saja, ATAU tempelan tag lengkap
 * `<meta name="google-site-verification" content="…" />`. Kosong = hapus.
 */
export function parseGscVerification(input: string | null | undefined): GscParseResult {
  const raw = (input ?? "").trim();
  if (!raw) return { ok: true, code: null };

  let code = raw;
  if (raw.startsWith("<")) {
    if (!/name\s*=\s*["']google-site-verification["']/i.test(raw)) {
      return {
        ok: false,
        error: 'Tag yang ditempel bukan tag "google-site-verification".',
      };
    }
    const match = raw.match(/content\s*=\s*["']([^"']*)["']/i);
    if (!match) {
      return { ok: false, error: "Atribut content pada tag tidak ditemukan." };
    }
    code = match[1].trim();
  } else if (/^google-site-verification\s*=/i.test(raw)) {
    return {
      ok: false,
      error:
        "Itu kode untuk metode DNS (record TXT di pengelola domain). Pilih metode \"Tag HTML\" di Search Console lalu tempel tag-nya di sini.",
    };
  }

  if (!GSC_TOKEN.test(code)) {
    return {
      ok: false,
      error:
        "Kode verifikasi tidak valid. Tempel tag <meta …> dari Search Console atau isi atribut content-nya saja.",
    };
  }
  return { ok: true, code };
}