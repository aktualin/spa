/* Shared link styling for the desktop bar. */
export const linkBase =
  "flex items-center gap-1.5 rounded-sm px-3 py-2 text-[0.9375rem] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa";

/* Status halaman saat ini (aktif) vs idle — dipakai desktop & mobile. */
export const linkActive = "bg-cocoa/8 text-ink";
export const linkIdle = "text-cocoa/85 hover:bg-cocoa/5 hover:text-ink";