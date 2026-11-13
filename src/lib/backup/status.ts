import { readFile } from "node:fs/promises";
import path from "node:path";
import tls from "node:tls";

import { Prisma } from "@prisma/client";
import { cacheLife } from "next/cache";
import { version as reactVersion } from "react";

import rootPackage from "../../../package.json";

import { envPresence, shortCommit, siteUrlInfo, type EnvPresence } from "@/lib/domain/backup";
import { dbTable } from "@/lib/db-schema";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

/* ---------- Status situs: HTTP + sertifikat SSL ---------- */

export type HttpCheck =
  | { ok: true; status: number; location: string | null; ms: number }
  | { ok: false; error: string };

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

const CHECK_TIMEOUT_MS = 5000;

function errorLabel(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code) {
    return String((error as { code: unknown }).code);
  }
  if (error instanceof Error && error.name === "TimeoutError") return "Waktu habis (5 detik)";
  return error instanceof Error ? error.name : "Gagal";
}

async function checkHttp(url: string): Promise<HttpCheck> {
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
function checkCertificate(host: string): Promise<TlsCheck> {
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

/* ---------- Versi platform ---------- */

export type VersionRow = { name: string; installed: string | null; declared: string | null };

const TRACKED_PACKAGES = [
  "next",
  "react",
  "react-dom",
  "@prisma/client",
  "prisma",
  "@prisma/adapter-pg",
  "pg",
  "@aws-sdk/client-s3",
  "jose",
  "zod",
  "flyonui",
  "tailwindcss",
  "typescript",
] as const;

const declaredVersions: Record<string, string> = {
  ...(rootPackage.devDependencies as Record<string, string>),
  ...(rootPackage.dependencies as Record<string, string>),
};

async function installedVersion(name: string): Promise<string | null> {
  try {
    const file = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "node_modules",
      name,
      "package.json",
    );
    const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
    const version = (parsed as { version?: unknown }).version;
    return typeof version === "string" ? version : null;
  } catch {
    // Di Vercel node_modules tidak selalu ikut terbawa: pakai versi runtime/deklarasi.
    return null;
  }
}

export async function getPlatformVersions(): Promise<VersionRow[]> {
  const runtime: Record<string, string> = {
    react: reactVersion,
    "@prisma/client": Prisma.prismaVersion.client,
  };
  return Promise.all(
    TRACKED_PACKAGES.map(async (name) => ({
      name,
      installed: (await installedVersion(name)) ?? runtime[name] ?? null,
      declared: declaredVersions[name] ?? null,
    })),
  );
}

export type DeployInfo = {
  node: string;
  vercelEnv: string | null;
  commit: string | null;
  branch: string | null;
  deploymentUrl: string | null;
  region: string | null;
};

export function getDeployInfo(): DeployInfo {
  return {
    node: process.version,
    vercelEnv: process.env.VERCEL_ENV?.trim() || null,
    commit: shortCommit(process.env.VERCEL_GIT_COMMIT_SHA),
    branch: process.env.VERCEL_GIT_COMMIT_REF?.trim() || null,
    deploymentUrl: process.env.VERCEL_URL?.trim() || null,
    region: process.env.VERCEL_REGION?.trim() || null,
  };
}

/* ---------- Migrasi database ---------- */

export type MigrationInfo =
  | { ok: true; applied: number; pending: number; latest: string | null; latestAt: Date | null }
  | { ok: false };

export async function getMigrationInfo(): Promise<MigrationInfo> {
  try {
    const rows = await prisma.$queryRaw<
      { migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]
    >`SELECT migration_name, finished_at, rolled_back_at FROM ${dbTable("_prisma_migrations")} ORDER BY started_at DESC`;
    const applied = rows.filter((r) => r.finished_at && !r.rolled_back_at);
    const pending = rows.filter((r) => !r.finished_at && !r.rolled_back_at);
    return {
      ok: true,
      applied: applied.length,
      pending: pending.length,
      latest: applied[0]?.migration_name ?? null,
      latestAt: applied[0]?.finished_at ?? null,
    };
  } catch {
    return { ok: false };
  }
}

/* ---------- Status environment (terisi/kosong saja) ---------- */

export type EnvGroup = { label: string; items: EnvPresence[] };

const ENV_GROUPS: { label: string; names: string[] }[] = [
  { label: "Inti", names: ["DATABASE_URL", "ADMIN_SESSION_SECRET", "NEXT_PUBLIC_SITE_URL"] },
  {
    label: "Storage (Supabase S3)",
    names: [
      "SUPABASE_S3_ENDPOINT_URL",
      "SUPABASE_S3_REGION",
      "SUPABASE_S3_BUCKET",
      "SUPABASE_S3_ACCESS_KEY_ID",
      "SUPABASE_S3_SECRET_ACCESS_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLIC_URL",
    ],
  },
  { label: "Captcha", names: ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] },
  { label: "E-mail", names: ["RESEND_API_KEY", "EMAIL_FROM", "CORPORATE_INQUIRY_TO"] },
  { label: "Instagram", names: ["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_USER_ID"] },
  {
    label: "Backup",
    names: ["BACKUP_REPORT_SECRET", "GITHUB_BACKUP_TOKEN", "GITHUB_BACKUP_REPO"],
  },
];

export async function getEnvStatus(): Promise<EnvGroup[]> {
  const groups = ENV_GROUPS.map((group) => ({
    label: group.label,
    items: envPresence(process.env, group.names),
  }));

  // GA4 diatur dari dashboard (SiteSettings), bukan env.
  let ga4 = false;
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { ga4MeasurementId: true, gscVerification: true },
    });
    ga4 = Boolean(settings?.ga4MeasurementId?.trim());
    groups.push({
      label: "Analitik & verifikasi (diatur dari dashboard)",
      items: [
        { name: "GA4 Measurement ID", set: ga4 },
        { name: "Verifikasi Google Search Console", set: Boolean(settings?.gscVerification?.trim()) },
      ],
    });
  } catch {
    groups.push({ label: "Analitik & verifikasi (diatur dari dashboard)", items: [] });
  }
  return groups;
}
