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
        How do events end up in “Upcoming”, “Past”, or “Past Collaborations”?
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Status is computed automatically from dates (WIB); no manual change needed. An
          event starts at 00.00 on its start date and ends at 23.59 on its end date (or
          on the start date when the end date is empty).
        </li>
        <li>
          <strong>Upcoming</strong> (<code>/events</code>): events that are upcoming or
          ongoing, plus events without dates (“Date TBA”). Collaboration events that have
          not passed also appear here.
        </li>
        <li>
          <strong>Past</strong> (<code>/events</code>): regular events whose end date has
          already passed.
        </li>
        <li>
          <strong>Past Collaborations</strong> (<code>/events/collaborations</code>):
          events marked as collaboration that have passed, or collaborations without
          dates (archive).
        </li>
        <li>
          The move between groups happens on its own, at most a few minutes after the
          event passes — no redeploy needed. Only events with “Show on website” appear on
          the public pages.
        </li>
      </ul>
    </details>
  );
}
