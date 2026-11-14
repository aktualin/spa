import type {
  JournalStatusSegment,
  TrendPoint,
} from "@/lib/domain/admin-dashboard";

export const WIDTH = 320;
export const HEIGHT = 168;
export const PAD_X = 8;
export const PAD_TOP = 22;
export const PAD_BOTTOM = 28;
export const PLOT_W = WIDTH - PAD_X * 2;
export const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

export const STATUS_COLOR: Record<JournalStatusSegment["key"], string> = {
  PUBLISHED: "var(--color-cocoa)",
  SCHEDULED: "var(--color-caramel)",
  DRAFT: "var(--color-clay)",
};

/** Ringkasan angka yang tetap terbaca pembaca layar dari grafik SVG. */
export function DataList({
  label,
  points,
  suffix = "",
}: {
  label: string;
  points: readonly TrendPoint[];
  suffix?: string;
}) {
  return (
    <ul className="sr-only" aria-label={label}>
      {points.map((point) => (
        <li key={point.key}>
          {point.label}: {point.value}
          {suffix}
        </li>
      ))}
    </ul>
  );
}

export function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50/60 px-4 text-center text-xs text-neutral-400">
      {label}
    </div>
  );
}

export function GridLines() {
  return (
    <>
      {[0, 0.5, 1].map((fraction) => {
        const y = PAD_TOP + PLOT_H - PLOT_H * fraction;
        return (
          <line
            key={fraction}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={y}
            y2={y}
            stroke="#e5e5e5"
            strokeDasharray={fraction === 0 ? undefined : "3 5"}
          />
        );
      })}
    </>
  );
}

/** Daftar legenda donut status journal (label, jumlah, persentase). */
export function StatusLegend({
  segments,
  total,
}: {
  segments: readonly JournalStatusSegment[];
  total: number;
}) {
  return (
    <ul className="w-full space-y-2">
      {segments.map((segment) => (
        <li key={segment.key} className="flex items-center gap-2 text-xs">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: STATUS_COLOR[segment.key] }}
          />
          <span className="text-neutral-600">{segment.label}</span>
          <span className="ml-auto font-medium tabular-nums text-neutral-900">
            {segment.value}
          </span>
          <span className="w-9 text-right tabular-nums text-neutral-400">
            {total === 0 ? "—" : `${Math.round(segment.share * 100)}%`}
          </span>
        </li>
      ))}
    </ul>
  );
}