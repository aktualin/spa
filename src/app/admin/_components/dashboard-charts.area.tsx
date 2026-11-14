import type { TrendPoint } from "@/lib/domain/admin-dashboard";

import {
  DataList,
  EmptyChart,
  GridLines,
  HEIGHT,
  PAD_TOP,
  PAD_X,
  PLOT_H,
  PLOT_W,
  WIDTH,
} from "./dashboard-charts.shared";

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