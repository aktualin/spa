import { getSiteHealth } from "@/lib/backup/status";

import { Badge } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { CertRowContent } from "./site-health-cert";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr]">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-neutral-900">{children}</dd>
    </div>
  );
}

/**
 * Domain, HTTP, dan sertifikat SSL. Dirender di dalam <Suspense> karena
 * memanggil jaringan (timeout 5 detik); hasilnya dicache beberapa menit.
 */
export async function SiteHealthSection() {
  const health = await getSiteHealth();
  const now = new Date();

  return (
    <dl className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
      <Row label="Domain">
        <span className="font-mono">{health.host ?? "—"}</span>
        <span className="ml-2 text-xs text-neutral-500">
          {health.explicitSiteUrl ? "dari NEXT_PUBLIC_SITE_URL" : "bawaan (NEXT_PUBLIC_SITE_URL kosong)"}
        </span>
      </Row>
      <Row label="HTTPS">
        {health.isHttps ? (
          <Badge tone="green">Ya</Badge>
        ) : (
          <Badge tone="red">Tidak — alamat situs bukan https://</Badge>
        )}
      </Row>
      <Row label="Respons situs">
        {!health.http ? (
          "Alamat situs tidak valid."
        ) : health.http.ok ? (
          <>
            <Badge tone={health.http.status < 400 ? "green" : "red"}>HTTP {health.http.status}</Badge>
            <span className="ml-2 text-xs text-neutral-500">
              {health.http.ms} ms
              {health.http.location ? ` · dialihkan ke ${health.http.location}` : ""}
            </span>
          </>
        ) : (
          <>
            <Badge tone="red">Tidak terjangkau</Badge>
            <span className="ml-2 text-xs text-neutral-500">{health.http.error}</span>
          </>
        )}
      </Row>
      <Row label="Sertifikat SSL">
        <CertRowContent health={health} now={now} />
      </Row>
      <Row label="Diperiksa">
        <span className="text-neutral-500">{formatWibDateTime(new Date(health.checkedAt))} (cache ± 5 menit)</span>
      </Row>
    </dl>
  );
}