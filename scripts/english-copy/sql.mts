/** Helper encoding SQL untuk generator migrasi English (dollar-quote, array, jsonb). */
export function q(name: string): string {
  return `"${name}"`;
}

/** Dollar-quote dengan tag unik agar HTML/kutip tidak perlu escaping manual. */
export function sqlString(value: string): string {
  let tag = "q";
  let i = 0;
  while (value.includes(`$${tag}$`)) tag = `q${++i}`;
  return `$${tag}$${value}$${tag}$`;
}

const ARRAY_COLS: Record<string, string[]> = {
  SiteSettings: ["openingHours", "seoKeywords"],
  JournalPost: ["tags"],
  CorporateContent: ["benefits", "inSpaItems"],
  CorporateProgram: ["features"],
  MembershipTier: ["benefits"],
  Branch: ["openingHours"],
};
const JSON_COLS: Record<string, string[]> = {
  CorporateContent: ["solutions"],
  MembershipProgram: ["benefits", "services"],
};

export function encodeValue(table: string, field: string, value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (ARRAY_COLS[table]?.includes(field)) {
    const arr = value as unknown[];
    if (arr.length === 0) return "ARRAY[]::text[]";
    return `ARRAY[${arr.map((v) => sqlString(String(v))).join(",")}]::text[]`;
  }
  if (JSON_COLS[table]?.includes(field)) return `${sqlString(JSON.stringify(value))}::jsonb`;
  if (typeof value === "number") return String(value);
  return sqlString(String(value));
}

/** Klausa WHERE identitas dari match logis baris copy. */
export function whereFor(table: string, match: Record<string, string | number>): string {
  if (table === "TreatmentOption")
    return `"treatmentId" = (SELECT "id" FROM "Treatment" WHERE "slug" = ${sqlString(String(match.treatmentSlug))}) AND "sortOrder" = ${match.sortOrder}`;
  if (table === "PackageItem")
    return `"packageId" = (SELECT "id" FROM "Package" WHERE "slug" = ${sqlString(String(match.packageSlug))}) AND "sortOrder" = ${match.sortOrder}`;
  return Object.entries(match)
    .map(([k, v]) => `${q(k)} = ${typeof v === "number" ? v : sqlString(String(v))}`)
    .join(" AND ");
}

export function fieldGuard(table: string, field: string, value: unknown): string {
  if (value === null || value === undefined) return `${q(field)} IS NULL`;
  return `${q(field)} = ${encodeValue(table, field, value)}`;
}
