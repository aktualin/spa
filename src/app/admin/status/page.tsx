import { Suspense } from "react";

import { getGithubBackupConfig } from "@/lib/backup/github";
import {
  getDeployInfo,
  getEnvStatus,
  getMigrationInfo,
  getPlatformVersions,
} from "@/lib/backup/status";
import { AUTO_BACKUP_STALE_DAYS, autoBackupHealth, formatBytes } from "@/lib/domain/backup";

import { getBackupOverview } from "../actions/backup";
import { Badge, PageHeader, type BadgeTone } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { GithubBackupForm, HandoverForm } from "./backup-forms";
import { requireAdminStatusPage } from "./guard";
import { SiteHealthSection } from "./site-health";

export const instant = false;

const KIND_LABEL = { AUTO: "Otomatis", MANUAL: "Manual", HANDOVER: "Serah terima" } as const;

const EXPORT_ERRORS: Record<string, string> = {
  confirm: "Centang pernyataan data pribadi terlebih dahulu sebelum mengunduh ekspor.",
  rate: "Ekspor dibatasi 3 kali per 15 menit. Coba lagi nanti.",
  invalid: "Permintaan ekspor tidak valid. Muat ulang halaman lalu coba lagi.",
};

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-8">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description ? <div className="mt-1 text-sm text-neutral-600">{description}</div> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Tile({
  label,
  value,
  detail,
  tone,
  badge,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: BadgeTone;
  badge?: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
        {badge ? <Badge tone={tone}>{badge}</Badge> : null}
      </div>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
      {detail ? <p className="mt-1 break-words text-xs text-neutral-500">{detail}</p> : null}
    </div>
  );
}

export default async function AdminStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ exportError?: string; handover?: string }>;
}) {
  await requireAdminStatusPage();

  const [overview, params, versions, migrations, envGroups] = await Promise.all([
    getBackupOverview(),
    searchParams,
    getPlatformVersions(),
    getMigrationInfo(),
    getEnvStatus(),
  ]);
  const deploy = getDeployInfo();
  const github = getGithubBackupConfig();
  const reportConfigured = Boolean(process.env.BACKUP_REPORT_SECRET?.trim());

  const now = new Date();
  const health = autoBackupHealth(overview.lastAuto?.createdAt, now);
  const autoTile =
    health === "ok"
      ? { badge: "Sehat", tone: "green" as const }
      : health === "stale"
        ? { badge: "Terlambat", tone: "amber" as const }
        : { badge: "Belum ada", tone: "red" as const };
  const lastAutoFailed =
    overview.lastAutoAttempt?.status === "FAILED" &&
    overview.lastAutoAttempt.id !== overview.lastAuto?.id;
  const exportError = params.exportError ? EXPORT_ERRORS[params.exportError] : null;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Backup & Status"
        subtitle="Info backup terakhir, status domain & SSL, versi platform, dan konfigurasi. Khusus role ADMIN."
      />

      {params.handover ? (
        <p role="status" className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Backup serah terima tercatat.
        </p>
      ) : null}
      {exportError ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {exportError}
        </p>
      ) : null}

      <Section title="Ringkasan backup">
        <div className="grid gap-3 sm:grid-cols-3">
          <Tile
            label="Otomatis (mingguan)"
            value={overview.lastAuto ? formatWibDateTime(overview.lastAuto.createdAt) : "Belum pernah"}
            detail={
              lastAutoFailed
                ? `Percobaan terakhir GAGAL (${formatWibDateTime(overview.lastAutoAttempt?.createdAt)}).`
                : health === "stale"
                  ? `Lebih dari ${AUTO_BACKUP_STALE_DAYS} hari tanpa backup sukses. Cek tab Actions di GitHub.`
                  : overview.lastAuto
                    ? formatBytes(overview.lastAuto.sizeBytes)
                    : "Aktifkan workflow GitHub Actions (lihat panduan)."
            }
            badge={lastAutoFailed ? "Gagal" : autoTile.badge}
            tone={lastAutoFailed ? "red" : autoTile.tone}
          />
          <Tile
            label="Manual terakhir"
            value={overview.lastManual ? formatWibDateTime(overview.lastManual.createdAt) : "Belum pernah"}
            detail={overview.lastManual?.format}
          />
          <Tile
            label="Serah terima"
            value={overview.lastHandover ? formatWibDateTime(overview.lastHandover.createdAt) : "Belum dicatat"}
            detail={overview.lastHandover?.location ?? undefined}
            badge={overview.lastHandover ? "Tercatat" : "Belum"}
            tone={overview.lastHandover ? "green" : "amber"}
          />
        </div>
        {!reportConfigured ? (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            BACKUP_REPORT_SECRET belum diisi: backup otomatis tetap bisa berjalan di GitHub, tetapi
            hasilnya tidak akan tercatat di halaman ini.
          </p>
        ) : null}
      </Section>

      <Section
        id="backup-manual"
        title="Backup manual"
        description="Tanpa biaya. Isi backup tidak pernah disimpan di server maupun storage situs."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-neutral-900">A. Unduh ekspor data (JSON)</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Semua tabel diunduh langsung ke perangkat Anda. Password admin tidak ikut. Ini backup
              <strong> data</strong>, bukan pengganti pg_dump: struktur tabel dan riwayat migrasi
              tidak ikut, jadi untuk pemulihan penuh gunakan backup pg_dump.
            </p>
            <form method="post" action="/api/admin/backup/export" className="mt-3 space-y-3">
              <label className="flex items-start gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="includePersonalData"
                  className="mt-0.5 size-4 rounded border-neutral-300"
                />
                <span>Sertakan data inquiry Corporate Wellness (nama, e-mail, telepon pengirim)</span>
              </label>
              <label className="flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-900">
                <input
                  type="checkbox"
                  name="confirm"
                  required
                  className="mt-0.5 size-4 rounded border-neutral-300"
                />
                <span>
                  Saya paham berkas ini berisi data pribadi (UU PDP): akan saya simpan di tempat
                  terenkripsi/berkata sandi, tidak saya bagikan, dan tidak saya unggah ke storage
                  publik.
                </span>
              </label>
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Unduh ekspor JSON
              </button>
              <p className="text-xs text-neutral-500">Dibatasi 3 kali per 15 menit. Setiap unduhan tercatat di riwayat.</p>
            </form>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-neutral-900">B. Backup database lengkap (pg_dump)</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Menjalankan workflow backup di GitHub Actions sekarang juga — sama dengan backup
              mingguan: pg_dump, dienkripsi AES-256, disimpan sebagai artifact GitHub (maks. 90 hari).
              Bisa dipakai untuk restore penuh.
            </p>
            <div className="mt-3">
              <GithubBackupForm
                enabled={github.enabled}
                reason={github.enabled ? null : github.reason}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="serah-terima"
        title="Backup serah terima"
        description={
          <>
            Jalankan <code className="font-mono text-xs">./scripts/backup-db.sh</code> di komputer
            developer, uji restore ke database terpisah, serahkan berkasnya ke klien, lalu catat di
            sini beserta checksum SHA-256 agar keaslian berkas bisa dicek kemudian. Langkah lengkap
            ada di panduan <code className="font-mono text-xs">docs/user-guide/status.md</code>.
          </>
        }
      >
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <HandoverForm />
        </div>
      </Section>

      <Section id="riwayat" title="Riwayat backup" description="30 catatan terbaru. Isi backup tidak ditampilkan di dashboard.">
        {overview.runs.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada catatan backup.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {overview.runs.map((run) => (
              <li key={run.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge tone={run.status === "SUCCESS" ? "green" : "red"}>
                    {run.status === "SUCCESS" ? "Sukses" : "Gagal"}
                  </Badge>
                  <Badge tone={run.kind === "AUTO" ? "blue" : run.kind === "HANDOVER" ? "default" : "muted"}>
                    {KIND_LABEL[run.kind]}
                  </Badge>
                  <span className="text-neutral-900">{formatWibDateTime(run.createdAt)}</span>
                  <span className="text-neutral-500">· {run.format}</span>
                  {run.sizeBytes !== null ? (
                    <span className="text-neutral-500">· {formatBytes(run.sizeBytes)}</span>
                  ) : null}
                </div>
                <div className="mt-1 space-y-0.5 text-xs text-neutral-500">
                  {run.location ? <p className="break-all">Lokasi: {run.location}</p> : null}
                  {run.note ? <p className="break-all">{run.note}</p> : null}
                  {run.triggeredBy ? <p>Oleh: {run.triggeredBy.name}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Status situs">
        <Suspense
          fallback={
            <p className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Memeriksa domain dan sertifikat SSL…
            </p>
          }
        >
          <SiteHealthSection />
        </Suspense>
      </Section>

      <Section title="Versi platform">
        <dl className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
          <div className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr]">
            <dt className="text-neutral-500">Node.js</dt>
            <dd className="font-mono">{deploy.node}</dd>
          </div>
          <div className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr]">
            <dt className="text-neutral-500">Deploy</dt>
            <dd>
              {deploy.vercelEnv ? (
                <>
                  Vercel <Badge tone={deploy.vercelEnv === "production" ? "green" : "amber"}>{deploy.vercelEnv}</Badge>
                  {deploy.commit ? <span className="ml-2 font-mono">commit {deploy.commit}</span> : null}
                  {deploy.branch ? <span className="ml-2 text-neutral-500">({deploy.branch})</span> : null}
                  {deploy.region ? <span className="ml-2 text-neutral-500">· region {deploy.region}</span> : null}
                  {deploy.deploymentUrl ? (
                    <p className="mt-0.5 break-all font-mono text-xs text-neutral-500">{deploy.deploymentUrl}</p>
                  ) : null}
                </>
              ) : (
                <span className="text-neutral-500">Bukan di Vercel (lokal/development)</span>
              )}
            </dd>
          </div>
          <div className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr]">
            <dt className="text-neutral-500">Migrasi database</dt>
            <dd>
              {migrations.ok ? (
                <>
                  {migrations.applied} migrasi terapan
                  {migrations.latest ? (
                    <span className="ml-1 text-neutral-500">
                      · terakhir <span className="font-mono">{migrations.latest}</span> ({formatWibDateTime(migrations.latestAt)})
                    </span>
                  ) : null}
                  {migrations.pending > 0 ? (
                    <span className="ml-2">
                      <Badge tone="red">{migrations.pending} gagal/belum selesai</Badge>
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-red-700">Tabel _prisma_migrations tidak terbaca.</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Paket</th>
                <th className="px-4 py-2 font-medium">Terpasang</th>
                <th className="px-4 py-2 font-medium">Di package.json</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {versions.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-2 font-mono">{row.name}</td>
                  <td className="px-4 py-2 font-mono">{row.installed ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-neutral-500">{row.declared ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Konfigurasi environment"
        description="Hanya ditampilkan terisi atau kosong — nilainya tidak pernah ditampilkan."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {envGroups.map((group) => (
            <div key={group.label} className="rounded-lg border border-neutral-200 bg-white p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{group.label}</h3>
              {group.items.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">Tidak terbaca.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
                      <span className="break-all font-mono text-xs text-neutral-800">{item.name}</span>
                      <Badge tone={item.set ? "green" : "muted"}>{item.set ? "Terisi" : "Kosong"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
