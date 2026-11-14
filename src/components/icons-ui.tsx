import { IconFrame, type IconProps } from "./icons-frame";

export function Search({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 20 20" className={className}>
      <path
        d="M17.5003 17.4974L14.4703 14.4674M14.4703 14.4674C15.8275 13.1101 16.667 11.2351 16.667 9.16406C16.667 5.02193 13.3091 1.66406 9.16699 1.66406C5.02486 1.66406 1.66699 5.02193 1.66699 9.16406C1.66699 13.3062 5.02486 16.6641 9.16699 16.6641C11.2381 16.6641 13.1131 15.8246 14.4703 14.4674Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </IconFrame>
  );
}

export function Close({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      <path
        d="M6 18L18 6M6 6L18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function CloseCircle({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 32 32" className={className}>
      <path
        d="M24 8L8 24M24 24L8 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 12 8" className={className}>
      <path
        d="M1 1.5L6 6.5L11 1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function ExternalLink({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 24 24" className={className}>
      <path
        d="M14 4h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 4 11.5 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function Check({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 16 16" className={className}>
      <path
        d="M2.5 8.5L6 12L13.5 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}