/** Tipe baris copy kanonik untuk generator migrasi English (tanpa DB). */
export type CopyRow = {
  table: string;
  match: Record<string, string | number>;
  fields: Record<string, unknown>;
};

export function row(
  table: string,
  match: Record<string, string | number>,
  fields: Record<string, unknown>,
): CopyRow {
  return { table, match, fields };
}
