/**
 * Placeholder teks ContentBlock (grup "microcopy" & "links"): kurung tunggal
 * `{n}`, `{m}`, `{name}`, `{title}` diganti saat render. Placeholder yang
 * tidak diberi nilai dibiarkan apa adanya supaya salah tulis terlihat jelas,
 * bukan menghasilkan teks kosong yang diam-diam rusak.
 *
 * Modul murni tanpa I/O — aman diimpor komponen server maupun client.
 */
export function fillCopy(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}