import { GithubBackupForm } from "./backup-forms";
import { Section, type GithubConfig } from "./status-parts";

/** Backup manual: ekspor JSON ke perangkat + pg_dump via GitHub Actions. */
export function ManualBackupSection({ github }: { github: GithubConfig }) {
  return (
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
  );
}