/**
 * Path halaman statis yang disarankan untuk dibuatkan entri SEO.
 *
 * Daftar ini hanya konstanta (bukan Server Action), jadi tidak memakai
 * `"use server"`.
 */
export const SUGGESTED_SEO_PATHS = [
  "/",
  "/contact",
  "/menu",
  "/treatments",
  "/treatments/packages",
  "/retail",
  "/gallery",
  "/events",
  "/events/collaborations",
  "/promos",
  "/promos/membership",
  "/gift-card",
  "/corporate-wellness",
  "/our-story",
  "/our-story/journal",
  "/membership",
] as const;
