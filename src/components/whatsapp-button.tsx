import { WhatsAppBrand } from "./icons";
import { whatsAppHref } from "@/lib/content/whatsapp";

/**
 * The floating WhatsApp button (bottom-right on every page).
 *
 * It uses the official WhatsApp glyph and a soft pulse so it reads as the
 * primary contact action without shouting.
 *
 * Nomor dan pesan (template "default") dibaca dari modul Kontak & Umum.
 */
export async function WhatsAppButton() {
  const href = await whatsAppHref("default");
  return (
    <a
      href={href}
      data-wa-context="default"
      target="_blank"
      rel="noopener noreferrer"
      className="kama-whatsapp-fab group fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25d366] sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      aria-label="Chat via WhatsApp"
    >
      <WhatsAppBrand className="relative z-[1] h-7 w-7 transition-transform duration-300 group-hover:rotate-6 sm:h-8 sm:w-8" />
    </a>
  );
}
