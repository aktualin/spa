import type { getSiteHealth } from "@/lib/backup/status";
import { certificateState, daysUntil, type CertificateState } from "@/lib/domain/backup";

import { Badge, type BadgeTone } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";

const CERT_LABEL: Record<CertificateState, { label: string; tone: BadgeTone }> = {
  valid: { label: "Aktif", tone: "green" },
  expiring: { label: "Segera habis", tone: "amber" },
  expired: { label: "Kedaluwarsa", tone: "red" },
  invalid: { label: "Tidak sah", tone: "red" },
  unknown: { label: "Tidak diketahui", tone: "muted" },
};

type Health = Awaited<ReturnType<typeof getSiteHealth>>;

/** Isi baris sertifikat SSL (status, masa berlaku, penerbit). */
export function CertRowContent({ health, now }: { health: Health; now: Date }) {
  if (!health.isHttps || health.isLocal) {
    return <span className="text-neutral-500">Tidak diperiksa (bukan domain HTTPS publik).</span>;
  }
  if (!health.tls) {
    return <>—</>;
  }
  if (!health.tls.ok) {
    return (
      <>
        <Badge tone="red">Gagal diperiksa</Badge>
        <span className="ml-2 text-xs text-neutral-500">{health.tls.error}</span>
      </>
    );
  }

  const cert = health.tls;
  const validTo = cert.validTo ? new Date(cert.validTo) : null;
  const state = certificateState({ validTo, authorized: cert.authorized }, now);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={CERT_LABEL[state].tone}>{CERT_LABEL[state].label}</Badge>
        {validTo ? (
          <span>
            berlaku sampai {formatWibDate(validTo)} ({daysUntil(validTo, now)} hari lagi)
          </span>
        ) : null}
      </div>
      <p className="text-xs text-neutral-500">
        Penerbit: {cert.issuer ?? "—"}
        {cert.authorizationError ? ` · ${cert.authorizationError}` : ""}
      </p>
      <p className="text-xs text-neutral-500">
        Vercel memperpanjang sertifikat otomatis selama domain masih mengarah ke Vercel.
      </p>
    </div>
  );
}