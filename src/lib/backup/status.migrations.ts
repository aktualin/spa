/** Status migrasi database — lihat `status.ts`. */
import { dbTable } from "@/lib/db-schema";
import { prisma } from "@/lib/prisma";

export type MigrationInfo =
  | { ok: true; applied: number; pending: number; latest: string | null; latestAt: Date | null }
  | { ok: false };

export async function getMigrationInfo(): Promise<MigrationInfo> {
  try {
    const rows = await prisma.$queryRaw<
      { migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]
    >`SELECT migration_name, finished_at, rolled_back_at FROM ${dbTable("_prisma_migrations")} ORDER BY started_at DESC`;
    const applied = rows.filter((r) => r.finished_at && !r.rolled_back_at);
    const pending = rows.filter((r) => !r.finished_at && !r.rolled_back_at);
    return {
      ok: true,
      applied: applied.length,
      pending: pending.length,
      latest: applied[0]?.migration_name ?? null,
      latestAt: applied[0]?.finished_at ?? null,
    };
  } catch {
    return { ok: false };
  }
}