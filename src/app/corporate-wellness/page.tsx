import { permanentRedirect } from "next/navigation";

/**
 * `/corporate-wellness` dulu adalah versi kedua halaman Corporate Wellness.
 * Sekarang hanya ada satu halaman — `/corporate` (desain asli yang ditautkan
 * menu & footer) yang membaca database dan memuat formulir inquiry. Path lama
 * dialihkan permanen (308) agar tautan/bookmark lama tetap berfungsi.
 */
export default function CorporateWellnessRedirect() {
  permanentRedirect("/corporate");
}
