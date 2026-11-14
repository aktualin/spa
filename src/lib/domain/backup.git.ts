/** Parsing input GitHub (repo, ref, commit) — lihat `backup.ts`. */

/** `owner/nama-repo` → objek, atau null bila formatnya tidak sah. */
export function parseGithubRepo(raw: string | undefined | null): { owner: string; repo: string } | null {
  const value = (raw ?? "").trim();
  const match = /^([A-Za-z0-9-]{1,39})\/([A-Za-z0-9_.-]{1,100})$/.exec(value);
  if (!match) return null;
  if (match[2] === "." || match[2] === ".." || match[2].includes("..")) return null;
  return { owner: match[1], repo: match[2] };
}

/** Nama branch/tag aman untuk `workflow_dispatch` (default `main`). */
export function parseGitRef(raw: string | undefined | null): string | null {
  const value = (raw ?? "").trim() || "main";
  if (!/^[A-Za-z0-9._/-]{1,100}$/.test(value)) return null;
  if (value.includes("..") || value.startsWith("/") || value.endsWith("/")) return null;
  return value;
}

/** 7 karakter pertama commit SHA (validasi heksadesimal). */
export function shortCommit(sha: string | undefined | null): string | null {
  const value = (sha ?? "").trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(value) ? value.slice(0, 7) : null;
}