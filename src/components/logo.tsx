/**
 * KAMA Spa logo.
 *
 * The mark is drawn as SVG so it stays crisp at any size; the wordmark is
 * rendered with the site's display and label faces so the lockup matches.
 */
export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const fill = variant === "light" ? "#FFFFFF" : "#603009";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="136"
      height="22"
      viewBox="0 0 136 22"
      fill="none"
      className={className}
      role="img"
      aria-label="KAMA Spa"
    >
      {/* Circular lotus mark */}
      <g fill={fill}>
        <circle cx="11" cy="11" r="10.25" stroke={fill} strokeWidth="1.5" fill="none" />
        <path d="M11 3.6c1.9 1.7 2.85 3.55 2.85 5.55S12.9 12.95 11 14.6c-1.9-1.65-2.85-3.5-2.85-5.45S9.1 5.3 11 3.6Z" />
        <path d="M4.15 9.4c2.35.15 4.05.75 5.1 1.8 1.05 1.05 1.65 2.75 1.8 5.1-2.35-.15-4.05-.75-5.1-1.8-1.05-1.05-1.65-2.75-1.8-5.1Z" />
        <path d="M17.85 9.4c-2.35.15-4.05.75-5.1 1.8-1.05 1.05-1.65 2.75-1.8 5.1 2.35-.15 4.05-.75 5.1-1.8 1.05-1.05 1.65-2.75 1.8-5.1Z" />
      </g>

      {/* Wordmark */}
      <text
        x="29"
        y="17"
        fill={fill}
        style={{
          fontFamily: '"Faesa Breages", serif',
          fontSize: "20px",
          letterSpacing: "0.06em",
        }}
      >
        KAMA
      </text>
      <text
        x="94"
        y="16.5"
        fill={fill}
        style={{
          fontFamily: '"POI Carbonic", sans-serif',
          fontSize: "9px",
          fontWeight: 500,
          letterSpacing: "0.28em",
        }}
      >
        SPA
      </text>
    </svg>
  );
}
