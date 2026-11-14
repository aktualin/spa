import { Badge } from "../promos/_kit/list-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import {
  Section,
  type DeployInfo,
  type MigrationInfo,
  type PlatformVersions,
} from "./status-parts";

/** Versi Node/deploy, status migrasi, dan tabel versi paket. */
export function PlatformSection({
  deploy,
  migrations,
  versions,
}: {
  deploy: DeployInfo;
  migrations: MigrationInfo;
  versions: PlatformVersions;
}) {
  return (
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
  );
}