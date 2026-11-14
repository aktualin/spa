/** Pemeriksaan HTTP situs untuk halaman status — lihat `status.ts`. */

export type HttpCheck =
  | { ok: true; status: number; location: string | null; ms: number }
  | { ok: false; error: string };

export const CHECK_TIMEOUT_MS = 5000;

export function errorLabel(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code) {
    return String((error as { code: unknown }).code);
  }
  if (error instanceof Error && error.name === "TimeoutError") return "Waktu habis (5 detik)";
  return error instanceof Error ? error.name : "Gagal";
}

export async function checkHttp(url: string): Promise<HttpCheck> {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    return {
      ok: true,
      status: response.status,
      location: response.headers.get("location"),
      ms: Date.now() - started,
    };
  } catch (error) {
    return { ok: false, error: errorLabel(error) };
  }
}