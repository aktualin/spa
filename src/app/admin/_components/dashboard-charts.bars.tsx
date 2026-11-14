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