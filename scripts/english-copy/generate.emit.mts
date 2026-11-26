/** Emisi statement forward/rollback per permukaan (generic, menu, tier, forms). */
import { q, sqlString, encodeValue, whereFor, fieldGuard } from "./sql.mts";
import { isFrozen, deepEq, menuWhere, type Emitter } from "./generate.helpers.mts";
import type { CopyRow } from "./collect.types.mts";

function pushUpdate(
  e: Emitter, table: string, where: string, field: string,
  oldVal: unknown, newVal: unknown, frozen: boolean,
): void {
  const setNew = encodeValue(table, field, newVal);
  const setOld = encodeValue(table, field, oldVal ?? null);
  if (frozen) {
    e.fwd.push(`UPDATE ${q(table)} SET ${q(field)} = ${setNew} WHERE ${where} AND ${q(field)} IS DISTINCT FROM ${setNew};`);
    e.rev.push(`UPDATE ${q(table)} SET ${q(field)} = ${setOld} WHERE ${where} AND ${q(field)} IS DISTINCT FROM ${setOld};`);
  } else {
    e.fwd.push(`UPDATE ${q(table)} SET ${q(field)} = ${setNew} WHERE ${where} AND ${fieldGuard(table, field, oldVal)};`);
    e.rev.push(`UPDATE ${q(table)} SET ${q(field)} = ${setOld} WHERE ${where} AND ${fieldGuard(table, field, newVal)};`);
  }
  e.changed++;
  e.coverage.set(table, (e.coverage.get(table) ?? 0) + 1);
}

export function emitGeneric(e: Emitter, oldRow: CopyRow | undefined, newRow: CopyRow): void {
  const where = whereFor(newRow.table, newRow.match);
  for (const [field, newVal] of Object.entries(newRow.fields)) {
    const oldVal = oldRow?.fields[field];
    if (deepEq(oldVal, newVal)) continue;
    pushUpdate(e, newRow.table, where, field, oldVal, newVal, isFrozen(newRow.table, field));
  }
}

export function emitMenu(e: Emitter, oldRow: CopyRow | undefined, newRow: CopyRow): void {
  const changes = Object.entries(newRow.fields).filter(([f, v]) => !deepEq(oldRow?.fields[f], v));
  if (changes.length === 0) return;
  const where = menuWhere(String(newRow.match.key));
  for (const [field, newVal] of changes) {
    pushUpdate(e, "MenuItem", where, field, oldRow?.fields[field], newVal, true);
  }
}

/** Tier: satu UPDATE atomik (rename slug + field), guard slug+name lama. */
export function emitTier(e: Emitter, oldRow: CopyRow, newRow: CopyRow): void {
  const sets: string[] = [];
  const revSets: string[] = [];
  for (const [field, newVal] of Object.entries(newRow.fields)) {
    const oldVal = oldRow.fields[field];
    if (deepEq(oldVal, newVal)) continue;
    sets.push(`${q(field)} = ${encodeValue("MembershipTier", field, newVal)}`);
    revSets.push(`${q(field)} = ${encodeValue("MembershipTier", field, oldVal)}`);
  }
  if (sets.length === 0) return;
  const oldSlug = sqlString(String(oldRow.fields.slug));
  const newSlug = sqlString(String(newRow.fields.slug));
  e.fwd.push(`UPDATE "MembershipTier" SET ${sets.join(", ")} WHERE "slug" = ${oldSlug} AND "name" = ${sqlString(String(oldRow.fields.name))};`);
  e.rev.push(`UPDATE "MembershipTier" SET ${revSets.join(", ")} WHERE "slug" = ${newSlug} AND "name" = ${sqlString(String(newRow.fields.name))};`);
  e.changed += sets.length;
  e.coverage.set("MembershipTier", (e.coverage.get("MembershipTier") ?? 0) + sets.length);
}

/** forms.reservation.*: jamin key ada di DB yang di-seed sebelum key dibuat. */
export function emitFormsInsert(e: Emitter, newRow: CopyRow): void {
  const key = sqlString(String(newRow.match.key));
  const val = sqlString(String(newRow.fields.value));
  e.fwd.push(`INSERT INTO "ContentBlock" ("key", "group", "value") VALUES (${key}, 'forms', ${val}) ON CONFLICT ("key") DO NOTHING;`);
}
