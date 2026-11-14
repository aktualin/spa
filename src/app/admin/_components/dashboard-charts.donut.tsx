import type { JournalStatusSegment } from "@/lib/domain/admin-dashboard";

import { STATUS_COLOR, StatusLegend } from "./dashboard-charts.shared";

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

      <StatusLegend segments={segments} total={total} />
    </div>
  );
}