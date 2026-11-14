import { formatBytes } from "@/lib/domain/backup";

import { Badge } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { KIND_LABEL, Section, type BackupOverview } from "./status-parts";

/** Riwayat backup: 30 catatan terbaru. */
export function BackupHistory({ overview }: { overview: BackupOverview }) {
  return (
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
  );
}