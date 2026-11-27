import { GithubBackupForm } from "./backup-forms";
import { Section, type GithubConfig } from "./status-parts";

/** Backup manual: ekspor JSON ke perangkat + pg_dump via GitHub Actions. */
export function ManualBackupSection({ github }: { github: GithubConfig }) {
  return (
    <Section
      id="backup-manual"
      title="Manual backup"
      description="No cost. Backup contents are never stored on the server or in site storage."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-900">A. Download data export (JSON)</h3>
          <p className="mt-1 text-sm text-neutral-600">
            All tables are downloaded straight to your device. Admin passwords are not included.
            This is a<strong> data</strong> backup, not a pg_dump replacement: table structure and
            migration history are not included, so use a pg_dump backup for full recovery.
          </p>
          <form method="post" action="/api/admin/backup/export" className="mt-3 space-y-3">
            <label className="flex items-start gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="includePersonalData"
                className="mt-0.5 size-4 rounded border-neutral-300"
              />
              <span>Include Corporate Wellness inquiry data (sender name, email, phone)</span>
            </label>
            <label className="flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-900">
              <input
                type="checkbox"
                name="confirm"
                required
                className="mt-0.5 size-4 rounded border-neutral-300"
              />
              <span>
                I understand this file contains personal data (PDP Law): I will keep it in an
                encrypted/password-protected place, not share it, and not upload it to public
                storage.
              </span>
            </label>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Download JSON export
            </button>
            <p className="text-xs text-neutral-500">Limited to 3 times per 15 minutes. Every download is recorded in the history.</p>
          </form>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-900">B. Full database backup (pg_dump)</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Runs the backup workflow on GitHub Actions right now — the same as the weekly backup:
            pg_dump, encrypted with AES-256, stored as a GitHub artifact (max. 90 days).
            Can be used for a full restore.
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
  );
}