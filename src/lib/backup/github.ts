import { parseGitRef, parseGithubRepo } from "@/lib/domain/backup";

/**
 * Memicu workflow `.github/workflows/backup.yml` (pg_dump terenkripsi) lewat
 * GitHub API `workflow_dispatch`. Aktif hanya bila `GITHUB_BACKUP_TOKEN` dan
 * `GITHUB_BACKUP_REPO` diisi. Token sebaiknya fine-grained PAT yang hanya
 * berhak "Actions: Read and write" pada satu repo itu.
 */

export const BACKUP_WORKFLOW_FILE = "backup.yml";

export type GithubBackupConfig =
  | { enabled: true; owner: string; repo: string; ref: string; token: string }
  | { enabled: false; reason: string };

export function getGithubBackupConfig(): GithubBackupConfig {
  const token = process.env.GITHUB_BACKUP_TOKEN?.trim();
  const rawRepo = process.env.GITHUB_BACKUP_REPO?.trim();
  if (!token || !rawRepo) {
    return {
      enabled: false,
      reason:
        "GITHUB_BACKUP_TOKEN dan GITHUB_BACKUP_REPO belum diisi di environment Vercel. Backup mingguan tetap berjalan otomatis; backup pg_dump dadakan bisa dijalankan dari tab Actions di GitHub (Run workflow).",
    };
  }
  const repo = parseGithubRepo(rawRepo);
  if (!repo) {
    return { enabled: false, reason: "GITHUB_BACKUP_REPO harus berformat pemilik/nama-repo." };
  }
  const ref = parseGitRef(process.env.GITHUB_BACKUP_REF);
  if (!ref) return { enabled: false, reason: "GITHUB_BACKUP_REF tidak valid." };
  return { enabled: true, owner: repo.owner, repo: repo.repo, ref, token };
}

export async function dispatchBackupWorkflow(
  requestedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getGithubBackupConfig();
  if (!config.enabled) return { ok: false, error: config.reason };

  const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/workflows/${BACKUP_WORKFLOW_FILE}/dispatches`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "kamaspa-admin-backup",
      },
      body: JSON.stringify({ ref: config.ref, inputs: { requested_by: requestedBy } }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 204) return { ok: true };
    if (response.status === 401 || response.status === 403) {
      return { ok: false, error: "GitHub menolak token (kedaluwarsa atau tidak punya izin Actions: write)." };
    }
    if (response.status === 404) {
      return { ok: false, error: "Repo atau workflow backup.yml tidak ditemukan di GitHub." };
    }
    if (response.status === 422) {
      return { ok: false, error: `Branch "${config.ref}" tidak punya workflow backup.yml yang bisa dipicu.` };
    }
    return { ok: false, error: `GitHub membalas status ${response.status}. Coba lagi nanti.` };
  } catch {
    return { ok: false, error: "Tidak bisa menghubungi GitHub (waktu habis atau jaringan bermasalah)." };
  }
}
