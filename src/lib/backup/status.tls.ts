/** Pemeriksaan sertifikat SSL situs — lihat `status.ts`. */
import tls from "node:tls";

import { CHECK_TIMEOUT_MS, errorLabel } from "./status.http";

export type TlsCheck =
  | {
      ok: true;
      authorized: boolean;
      authorizationError: string | null;
      /** ISO string (hasil cache harus bisa diserialisasi). */
      validFrom: string | null;
      validTo: string | null;
      issuer: string | null;
      subject: string | null;
    }
  | { ok: false; error: string };

function certName(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const name = record.O ?? record.CN;
  if (Array.isArray(name)) return name.map(String).join(", ");
  return typeof name === "string" ? name : null;
}

function toIso(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Baca sertifikat host:443 (timeout 5 detik). Tidak pernah melempar. */
export function checkCertificate(host: string): Promise<TlsCheck> {
  return new Promise((resolve) => {
    let settled = false;
    const socket = tls.connect({
      host,
      port: 443,
      servername: host,
      // Tetap baca sertifikat yang tidak sah supaya alasannya bisa ditampilkan.
      rejectUnauthorized: false,
      timeout: CHECK_TIMEOUT_MS,
    });
    const finish = (result: TlsCheck) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(result);
    };
    const timer = setTimeout(
      () => finish({ ok: false, error: "Waktu habis (5 detik)" }),
      CHECK_TIMEOUT_MS + 500,
    );

    socket.once("secureConnect", () => {
      const cert = socket.getPeerCertificate();
      if (!cert || Object.keys(cert).length === 0) {
        finish({ ok: false, error: "Server tidak mengirim sertifikat" });
        return;
      }
      finish({
        ok: true,
        authorized: socket.authorized,
        authorizationError: socket.authorizationError ? String(socket.authorizationError) : null,
        validFrom: toIso(cert.valid_from),
        validTo: toIso(cert.valid_to),
        issuer: certName(cert.issuer),
        subject: certName(cert.subject),
      });
    });
    socket.once("timeout", () => finish({ ok: false, error: "Waktu habis (5 detik)" }));
    socket.once("error", (error) => finish({ ok: false, error: errorLabel(error) }));
  });
}