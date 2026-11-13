/**
 * Schema Postgres tempat tabel KAMA berada.
 *
 * KAMA berbagi project Supabase dengan aplikasi lain, jadi tabelnya hidup di
 * schema tersendiri (`DATABASE_SCHEMA`, mis. `kama`) — bukan `public`, yang
 * berisi tabel aplikasi lain. Query Prisma biasa mendapat schema ini lewat
 * opsi adapter (`src/lib/prisma.ts`); SQL mentah wajib memakai `dbTable()`
 * supaya tidak pernah jatuh ke `search_path` (= `public`).
 */
import { Prisma } from "@prisma/client";

const raw = process.env.DATABASE_SCHEMA?.trim() || "public";

if (!/^[a-z_][a-z0-9_]*$/.test(raw)) {
  throw new Error(`DATABASE_SCHEMA tidak valid: ${raw}`);
}

export const DB_SCHEMA = raw;

/** Identifier tabel ber-schema untuk SQL mentah: `dbTable("PageView")` → `"kama"."PageView"`. */
export function dbTable(name: string): Prisma.Sql {
  return Prisma.raw(`"${DB_SCHEMA}"."${name}"`);
}
