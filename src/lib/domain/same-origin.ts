type HeaderReader = { get(name: string): string | null };

/**
 * Lapis CSRF untuk route handler yang memakai cookie sesi. Browser selalu
 * mengirim `Origin` pada POST lintas situs, jadi Origin yang ada tetapi berbeda
 * host berarti permintaan datang dari situs lain. Tanpa Origin (mis. curl) tidak
 * ada cookie korban yang ikut, sehingga tidak dianggap serangan CSRF.
 * Host dibaca dari header (bukan URL request) agar benar di belakang reverse proxy.
 */
export function isSameOrigin(headers: HeaderReader): boolean {
  const origin = headers.get("origin");
  if (!origin) return true;
  if (origin === "null") return false;

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isStateChangingMethod(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase());
}
