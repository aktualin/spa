const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

/** Tanggal & jam lokal untuk daftar akun admin. */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}
