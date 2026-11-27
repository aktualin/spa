import type { getSiteHealth } from "@/lib/backup/status";
import { certificateState, daysUntil, type CertificateState } from "@/lib/domain/backup";

import { Badge, type BadgeTone } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";

const CERT_LABEL: Record<CertificateState, { label: string; tone: BadgeTone }> = {
  valid: { label: "Active", tone: "green" },
  expiring: { label: "Expiring soon", tone: "amber" },
  expired: { label: "Expired", tone: "red" },
  invalid: { label: "Invalid", tone: "red" },
  unknown: { label: "Unknown", tone: "muted" },
};

type Health = Awaited<ReturnType<typeof getSiteHealth>>;

/** Isi baris sertifikat SSL (status, masa berlaku, penerbit). */
export function CertRowContent({ health, now }: { health: Health; now: Date }) {
  if (!health.isHttps || health.isLocal) {
    return <span className="text-neutral-500">Not checked (not a public HTTPS domain).</span>;
  }
  if (!health.tls) {
    return <>—</>;
  }
  if (!health.tls.ok) {
    return (
      <>
        <Badge tone="red">Check failed</Badge>
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
            valid until {formatWibDate(validTo)} ({daysUntil(validTo, now)} days left)
          </span>
        ) : null}
      </div>
      <p className="text-xs text-neutral-500">
        Issuer: {cert.issuer ?? "—"}
        {cert.authorizationError ? ` · ${cert.authorizationError}` : ""}
      </p>
      <p className="text-xs text-neutral-500">
        Vercel renews the certificate automatically as long as the domain still points to Vercel.
      </p>
    </div>
  );
}