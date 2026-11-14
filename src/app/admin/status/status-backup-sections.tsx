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
      ? { badge: "Sehat", tone: "green" as const }
      : health === "stale"
        ? { badge: "Terlambat", tone: "amber" as const }
        : { badge: "Belum ada", tone: "red" as const };
  const lastAutoFailed =
    overview.lastAutoAttempt?.status === "FAILED" &&
    overview.lastAutoAttempt.id !== overview.lastAuto?.id;

  return (
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
  );
}

/** Form pencatatan backup serah terima (checksum SHA-256). */
export function HandoverSection() {
  return (
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
  );
}