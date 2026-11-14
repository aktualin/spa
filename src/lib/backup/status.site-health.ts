/** Status situs: HTTP + sertifikat SSL — lihat `status.ts`. */
import { cacheLife } from "next/cache";

import { siteUrlInfo } from "@/lib/domain/backup";
import { getSiteUrl } from "@/lib/site-url";

import type { HttpCheck } from "./status.http";
import { checkHttp } from "./status.http";
import type { TlsCheck } from "./status.tls";
import { checkCertificate } from "./status.tls";

export type SiteHealth = {
  siteUrl: string;
  host: string | null;
  isHttps: boolean;
  isLocal: boolean;
  explicitSiteUrl: boolean;
  http: HttpCheck | null;
  tls: TlsCheck | null;
  checkedAt: string;
};

async function checkSite(siteUrl: string, explicitSiteUrl: boolean): Promise<SiteHealth> {
  "use cache";
  // Dicache beberapa menit: membuka halaman status berulang tidak memicu
  // koneksi TLS/HTTP baru setiap kali.
  cacheLife("minutes");

  const info = siteUrlInfo(siteUrl);
  const base = {
    siteUrl,
    host: info?.host ?? null,
    isHttps: info?.isHttps ?? false,
    isLocal: info?.isLocal ?? false,
    explicitSiteUrl,
    checkedAt: new Date().toISOString(),
  };
  if (!info) return { ...base, http: null, tls: null };

  const [http, cert] = await Promise.all([
    checkHttp(info.url),
    info.isHttps && !info.isLocal ? checkCertificate(info.host) : Promise.resolve(null),
  ]);
  return { ...base, http, tls: cert };
}

export async function getSiteHealth(): Promise<SiteHealth> {
  return checkSite(getSiteUrl(), Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()));
}