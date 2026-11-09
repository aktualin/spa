import type {
  JournalStatusSegment,
  TrendPoint,
} from "@/lib/domain/admin-dashboard";

const WIDTH = 320;
const HEIGHT = 168;
const PAD_X = 8;
const PAD_TOP = 22;
const PAD_BOTTOM = 28;
const PLOT_W = WIDTH - PAD_X * 2;
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

const STATUS_COLOR: Record<JournalStatusSegment["key"], string> = {
  PUBLISHED: "var(--color-cocoa)",
  SCHEDULED: "var(--color-caramel)",
  DRAFT: "var(--color-clay)",
};

/** Ringkasan angka yang tetap terbaca pembaca layar dari grafik SVG. */
function DataList({
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

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50/60 px-4 text-center text-xs text-neutral-400">
      {label}
    </div>
  );
}

function GridLines() {
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

export function TrendBars({
  points,
  label,
  suffix = "",
}: {
  points: readonly TrendPoint[];
  label: string;
  suffix?: string;
}) {
  if (points.length === 0 || points.every((point) => point.value === 0)) {
    return <EmptyChart label="Belum ada data pada periode ini." />;
  }

  const max = Math.max(...points.map((point) => point.value));
  const step = PLOT_W / points.length;
  const barWidth = Math.min(30, step * 0.5);
  // Seri 30/90 hari: label sumbu X dijarangkan supaya tidak bertumpuk.
  const labelEvery = points.length <= 12 ? 1 : Math.ceil(points.length / 5);
  const showValues = points.length <= 12;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-40 w-full"
        role="img"
        aria-label={label}
      >
        <title>{label}</title>
        <GridLines />
        {points.map((point, index) => {
          const height = (point.value / max) * PLOT_H;
          const x = PAD_X + step * index + (step - barWidth) / 2;
          const y = PAD_TOP + PLOT_H - height;
          const center = PAD_X + step * index + step / 2;

          return (
            <g key={point.key}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(height, point.value > 0 ? 3 : 0)}
                rx={4}
                fill="var(--color-cocoa)"
              >
                <title>{`${point.label}: ${point.value}${suffix}`}</title>
              </rect>
              {showValues && point.value > 0 ? (
                <text
                  x={center}
                  y={y - 7}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#737373"
                >
                  {point.value}
                </text>
              ) : null}
              {index % labelEvery === 0 || index === points.length - 1 ? (
                <text
                  x={center}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#a3a3a3"
                >
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <DataList label={label} points={points} suffix={suffix} />
    </figure>
  );
}

export function TrendArea({
  points,
  label,
  suffix = "",
}: {
  points: readonly TrendPoint[];
  label: string;
  suffix?: string;
}) {
  if (points.length === 0 || points.every((point) => point.value === 0)) {
    return <EmptyChart label="Belum ada data pada periode ini." />;
  }

  const max = Math.max(...points.map((point) => point.value));
  const step = PLOT_W / Math.max(points.length, 1);
  const coordinates = points.map((point, index) => ({
    x: PAD_X + step * index + step / 2,
    y: PAD_TOP + PLOT_H - (point.value / max) * PLOT_H,
    point,
  }));
  const line = coordinates
    .map((coordinate, index) => `${index === 0 ? "M" : "L"}${coordinate.x} ${coordinate.y}`)
    .join(" ");
  const area = `${line} L${coordinates.at(-1)!.x} ${PAD_TOP + PLOT_H} L${coordinates[0]!.x} ${PAD_TOP + PLOT_H} Z`;
  // Seri panjang (30/90 hari): jarangkan label, sembunyikan titik & angka.
  const labelEvery = points.length <= 12 ? 1 : Math.ceil(points.length / 5);
  const showDots = points.length <= 14;
  const showValues = points.length <= 12;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-40 w-full"
        role="img"
        aria-label={label}
      >
        <title>{label}</title>
        <GridLines />
        <path d={area} fill="var(--color-cocoa)" opacity={0.07} />
        <path
          d={line}
          fill="none"
          stroke="var(--color-cocoa)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coordinates.map(({ x, y, point }, index) => (
          <g key={point.key}>
            {showDots ? (
              <circle cx={x} cy={y} r={4} fill="#fff" stroke="var(--color-cocoa)" strokeWidth={2}>
                <title>{`${point.label}: ${point.value}${suffix}`}</title>
              </circle>
            ) : null}
            {showValues && point.value > 0 ? (
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize={10}
                fill="#737373"
              >
                {point.value}
              </text>
            ) : null}
            {index % labelEvery === 0 || index === points.length - 1 ? (
              <text
                x={x}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize={10}
                fill="#a3a3a3"
              >
                {point.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <DataList label={label} points={points} suffix={suffix} />
    </figure>
  );
}

export function StatusDonut({
  segments,
  label,
}: {
  segments: readonly JournalStatusSegment[];
  label: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const size = 168;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let consumed = 0;
  const arcs = segments.map((segment) => {
    const dash = segment.share * circumference;
    const arc = { ...segment, dash, offset: consumed };
    consumed += dash;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-40 shrink-0"
        role="img"
        aria-label={`${label}: ${total} artikel`}
      >
        <title>{`${label}: ${total} artikel`}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f5f5f5"
          strokeWidth={stroke}
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcs.map((segment) => (
            <circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={STATUS_COLOR[segment.key]}
              strokeWidth={stroke}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
            >
              <title>{`${segment.label}: ${segment.value}`}</title>
            </circle>
          ))}
        </g>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fontSize={26}
          fontWeight={600}
          fill="var(--color-espresso)"
        >
          {total}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          fontSize={10}
          letterSpacing={1}
          fill="#a3a3a3"
        >
          ARTIKEL
        </text>
      </svg>

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
    </div>
  );
}
