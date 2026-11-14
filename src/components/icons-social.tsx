import { IconFrame, type IconProps } from "./icons-frame";

export function Instagram({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
    </IconFrame>
  );
}

export function Facebook({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      <path
        d="M14.5 3.5H17V1h-2.5C11.6 1 10 2.7 10 5.5V8H7.5v2.5H10V23h3.5v-12.5H16l.5-2.5h-3V5.5c0-1.1.4-2 1-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function TikTok({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      {/* The TikTok note: a "d" bowl on the left of a vertical stem. */}
      <path
        d="M13.9 2.5v11.6a3.9 3.9 0 1 1-3.9-3.9c.44 0 .86.07 1.25.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The flag of the note. */}
      <path
        d="M13.9 2.5c.5 2.85 2.7 4.8 5.8 5.05"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function Email({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      <rect
        x="2.75"
        y="4.75"
        width="18.5"
        height="14.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 6.5 12 13l8.5-6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}