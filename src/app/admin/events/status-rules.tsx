/**
 * Penjelasan aturan status event untuk admin. Status tidak disimpan di
 * database — dihitung dari tanggal (lihat `@/lib/domain/events`).
 */
export function EventStatusRules({ compact = false }: { compact?: boolean }) {
  return (
    <details
      open={!compact}
      className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"
    >
      <summary className="cursor-pointer font-medium">
        Bagaimana event masuk “Upcoming”, “Past”, atau “Past Collaborations”?
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Status dihitung otomatis dari tanggal (WIB), tidak perlu diubah manual. Event
          dimulai pukul 00.00 pada tanggal mulai dan selesai pukul 23.59 pada tanggal
          selesai (atau pada tanggal mulai bila tanggal selesai kosong).
        </li>
        <li>
          <strong>Upcoming</strong> (<code>/events</code>): event yang akan datang atau
          sedang berlangsung, juga event tanpa tanggal (“Tanggal menyusul”). Event
          kolaborasi yang belum lewat juga tampil di sini.
        </li>
        <li>
          <strong>Past / Telah berlalu</strong> (<code>/events</code>): event biasa yang
          tanggal selesainya sudah lewat.
        </li>
        <li>
          <strong>Past Collaborations</strong> (<code>/events/collaborations</code>):
          event bertanda kolaborasi yang sudah lewat, atau kolaborasi tanpa tanggal
          (arsip).
        </li>
        <li>
          Perpindahan kelompok terjadi sendiri, paling lambat beberapa menit setelah
          event lewat — tanpa deploy ulang. Hanya event dengan “Tampilkan di website”
          yang muncul di halaman publik.
        </li>
      </ul>
    </details>
  );
}
