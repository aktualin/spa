import { IconFrame, type IconProps } from "./icons-frame";

export function LocationPin({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      <path
        d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </IconFrame>
  );
}

export function Clock({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5.5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}