import type { Dispatch, RefObject, SetStateAction } from "react";

import type { NavData } from "@/lib/domain/menu-nav";
import type { LogoBrand } from "./logo";

export type NavigationClientProps = {
  header: NavData;
  mobile: NavData;
  /** Label & tujuan tombol Book Now; salah satu kosong → tombol disembunyikan. */
  bookNow: string;
  bookNowHref: string;
  /** Tautan wa.me (nomor + template "default") — dibangun di server. */
  whatsappHref: string | null;
  /** Identitas brand dari Kontak & Umum (mark, wordmark, alt). */
  brand?: LogoBrand;
  /** Aria nav utama & buka/tutup menu mobile — dari CB global.*. */
  navAria: string;
  navOpen: string;
  navClose: string;
  /** Aria tombol WhatsApp (drawer mobile) — CB global.fab_aria. */
  fabAria: string;
};

/** Fungsi hover intent dari useHoverIntent, diteruskan ke nav desktop. */
export type HoverIntent = {
  clearTimers: () => void;
  scheduleOpen: (id: string) => void;
  scheduleClose: () => void;
};

export type SetOpenGroup = Dispatch<SetStateAction<string | null>>;

/** Ref bersama untuk menutup dropdown saat klik di luar / menekan Escape. */
export type NavRefs = {
  headerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  mobilePanelRef: RefObject<HTMLDivElement | null>;
  triggerRefs: RefObject<Record<string, HTMLButtonElement | null>>;
};

export type DesktopNavProps = {
  header: NavData;
  bookNow: string;
  bookNowHref: string;
  openGroup: string | null;
  setOpenGroup: SetOpenGroup;
  hover: HoverIntent;
  panelRef: RefObject<HTMLDivElement | null>;
  triggerRefs: RefObject<Record<string, HTMLButtonElement | null>>;
};

export type MobileDrawerProps = {
  mobile: NavData;
  bookNow: string;
  bookNowHref: string;
  whatsappHref: string | null;
  fabAria: string;
  openGroup: string | null;
  setOpenGroup: SetOpenGroup;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
};