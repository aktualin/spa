import { Suspense } from "react";

import { getGithubBackupConfig } from "@/lib/backup/github";
import {
  getDeployInfo,
  getEnvStatus,
  getMigrationInfo,
  getPlatformVersions,
} from "@/lib/backup/status";

import { getBackupOverview } from "../actions/backup";
import { PageHeader } from "../promos/_kit/list-ui";
import { requireAdminStatusPage } from "./guard";
import { SiteHealthSection } from "./site-health";
import { BackupSummary, HandoverSection } from "./status-backup-sections";
import { EnvSection } from "./status-env";
import { BackupHistory } from "./status-history";
import { ManualBackupSection } from "./status-manual";
import { PlatformSection } from "./status-platform";
import { EXPORT_ERRORS, Section } from "./status-parts";

export const instant = false;

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
  const exportError = params.exportError ? EXPORT_ERRORS[params.exportError] : null;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Backup & Status"
        subtitle="Latest backup info, domain & SSL status, platform versions, and configuration. ADMIN role only."
      />

      {params.handover ? (
        <p role="status" className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Handover backup recorded.
        </p>
      ) : null}
      {exportError ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {exportError}
        </p>
      ) : null}

      <BackupSummary overview={overview} reportConfigured={reportConfigured} now={now} />
      <ManualBackupSection github={github} />
      <HandoverSection />
      <BackupHistory overview={overview} />

      <Section title="Site status">
        <Suspense
          fallback={
            <p className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Checking the domain and SSL certificate…
            </p>
          }
        >
          <SiteHealthSection />
        </Suspense>
      </Section>

      <PlatformSection deploy={deploy} migrations={migrations} versions={versions} />
      <EnvSection envGroups={envGroups} />
    </div>
  );
}