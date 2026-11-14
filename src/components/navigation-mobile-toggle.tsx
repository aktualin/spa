"use client";

import { Close } from "./icons";

/** Tombol buka/tutup drawer mobile di header. */
export function MobileToggle({
  open,
  onToggle,
  openLabel,
  closeLabel,
}: {
  open: boolean;
  onToggle: () => void;
  openLabel: string;
  closeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-navigation"
      aria-label={open ? closeLabel : openLabel}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-cocoa/50 text-cocoa transition-colors hover:bg-cocoa/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa xl:hidden"
    >
      {open ? (
        <Close className="h-5 w-5" aria-hidden="true" />
      ) : (
        <span
          className="flex h-4 w-5 flex-col justify-center gap-[4px]"
          aria-hidden="true"
        >
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
        </span>
      )}
    </button>
  );
}