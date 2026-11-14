import type { getGithubBackupConfig } from "@/lib/backup/github";
import type {
  getDeployInfo,
  getEnvStatus,
  getMigrationInfo,
  getPlatformVersions,
} from "@/lib/backup/status";

import type { getBackupOverview } from "../actions/backup";
import { Badge, type BadgeTone } from "../promos/_kit/list-ui";

export type BackupOverview = Awaited<ReturnType<typeof getBackupOverview>>;
export type PlatformVersions = Awaited<ReturnType<typeof getPlatformVersions>>;
export type MigrationInfo = Awaited<ReturnType<typeof getMigrationInfo>>;
export type EnvGroups = Awaited<ReturnType<typeof getEnvStatus>>;
export type DeployInfo = ReturnType<typeof getDeployInfo>;
export type GithubConfig = ReturnType<typeof getGithubBackupConfig>;

export const KIND_LABEL = { AUTO: "Otomatis", MANUAL: "Manual", HANDOVER: "Serah terima" } as const;

export const EXPORT_ERRORS: Record<string, string> = {
  confirm: "Centang pernyataan data pribadi terlebih dahulu sebelum mengunduh ekspor.",
  rate: "Ekspor dibatasi 3 kali per 15 menit. Coba lagi nanti.",
  invalid: "Permintaan ekspor tidak valid. Muat ulang halaman lalu coba lagi.",
};

export function Section({
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

export function Tile({
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