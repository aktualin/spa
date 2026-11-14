import { IconFrame, type IconProps } from "./icons-frame";

export function ArrowRight({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 32 32" className={className}>
      <path
        d="M3.2717 16H28.7275M28.7275 16L24.4849 11.7574M28.7275 16L24.4849 20.2426"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function ArrowRightThin({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 32 20" className={className}>
      <path
        d="M3.2717 10H28.7275M28.7275 10L24.4849 5.75736M28.7275 10L24.4849 14.2426"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function ArrowLeft({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 88 10" className={className}>
      <path
        d="M87 5L1 5M1 5L5.23144 9M1 5L5.23144 1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

export function ArrowRightLong({ className }: IconProps) {
  return (
    <IconFrame viewBox="0 0 88 10" className={className}>
      <path
        d="M1 5H87M87 5L82.7686 1M87 5L82.7686 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}