export type NavLink = {
  label: string;
  href: string;
  /** Dibuka di tab baru (target="_blank"). */
  external?: boolean;
};

export type NavHighlight = {
  image: string;
  /** Belum punya kolom di MenuItem; tidak dirender bila kosong. */
  badge?: string;
  eyebrow?: string;
  label: string;
  href: string;
};

/**
 * A dropdown group in the header. `columns` are the link lists, `highlights`
 * the small promo cards, `footerLink` an optional "see everything" escape
 * hatch.
 */
export type NavMegaGroup = {
  id: string;
  label: string;
  /** `wide` fits two link columns, `narrow` a single one. */
  panel: "wide" | "narrow";
  columns: { title: string; links: NavLink[] }[];
  highlights: NavHighlight[];
  footerLink?: NavLink;
};

export type NavPrimaryItem = {
  label: string;
  href: string;
  mega?: string;
  /** External links open in a new tab and are rendered as plain `<a>`. */
  external?: boolean;
};