import { AUTO_BACKUP_STALE_DAYS, autoBackupHealth, formatBytes } from "@/lib/domain/backup";

import { formatWibDateTime } from "../promos/_kit/schema";
import { HandoverForm } from "./backup-forms";
import { Section, Tile, type BackupOverview } from "./status-parts";

/** Ringkasan backup: otomatis, manual, serah terima. */
export function BackupSummary({
  overview,
  reportConfigured,
  now,
}: {
  overview: BackupOverview;
  reportConfigured: boolean;
  now: Date;
}) {
  const health = autoBackupHealth(overview.lastAuto?.createdAt, now);
  const autoTile =
    health === "ok"
      ? { badge: "Healthy", tone: "green" as const }
      : health === "stale"
        ? { badge: "Overdue", tone: "amber" as const }
        : { badge: "None yet", tone: "red" as const };
  const lastAutoFailed =
    overview.lastAutoAttempt?.status === "FAILED" &&
    overview.lastAutoAttempt.id !== overview.lastAuto?.id;

  return (
    <Section title="Backup summary">
      <div className="grid gap-3 sm:grid-cols-3">
        <Tile
          label="Automatic (weekly)"
          value={overview.lastAuto ? formatWibDateTime(overview.lastAuto.createdAt) : "Never"}
          detail={
            lastAutoFailed
              ? `Last attempt FAILED (${formatWibDateTime(overview.lastAutoAttempt?.createdAt)}).`
              : health === "stale"
                ? `More than ${AUTO_BACKUP_STALE_DAYS} days without a successful backup. Check the Actions tab on GitHub.`
                : overview.lastAuto
                  ? formatBytes(overview.lastAuto.sizeBytes)
                  : "Enable the GitHub Actions workflow (see the guide)."
          }
          badge={lastAutoFailed ? "Failed" : autoTile.badge}
          tone={lastAutoFailed ? "red" : autoTile.tone}
        />
        <Tile
          label="Last manual"
          value={overview.lastManual ? formatWibDateTime(overview.lastManual.createdAt) : "Never"}
          detail={overview.lastManual?.format}
        />
        <Tile
          label="Handover"
          value={overview.lastHandover ? formatWibDateTime(overview.lastHandover.createdAt) : "Not recorded"}
          detail={overview.lastHandover?.location ?? undefined}
          badge={overview.lastHandover ? "Recorded" : "Not yet"}
          tone={overview.lastHandover ? "green" : "amber"}
        />
      </div>
      {!reportConfigured ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          BACKUP_REPORT_SECRET is not set: automatic backups can still run on GitHub, but their
          results will not be recorded on this page.
        </p>
      ) : null}
    </Section>
  );
}

/** Form pencatatan backup serah terima (checksum SHA-256). */
export function HandoverSection() {
  return (
    <Section
      id="serah-terima"
      title="Handover backup"
      description={
        <>
          Run <code className="font-mono text-xs">./scripts/backup-db.sh</code> on the developer's
          computer, test restoring to a separate database, hand the file to the client, then record
          it here with the SHA-256 checksum so the file's authenticity can be verified later. The
          full steps are in the <code className="font-mono text-xs">docs/user-guide/status.md</code> guide.
        </>
      }
    >
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <HandoverForm />
      </div>
    </Section>
  );
}