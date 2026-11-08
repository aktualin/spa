/**
 * Tombol WhatsApp untuk halaman publik.
 *
 * Semua link `wa.me` dibangun lewat `@/lib/whatsapp` — satu-satunya tempat
 * yang boleh membentuk URL WhatsApp.
 */
import { waLink } from "@/lib/whatsapp";

type WaButtonProps = {
  /** Pesan yang dilihat tamu di WhatsApp. */
  message: string;
  /** Label tombol. */
  label: string;
  /** Gaya tombol; default mengikuti `.button` gaya halaman lama. */
  className?: string;
};

/** Pesan default pemesanan treatment. */
export function reserveMessage(name: string): string {
  return `Halo kak, saya mau reservasi ${name}`;
}

/** Pesan default pembelian produk retail. */
export function buyMessage(name: string): string {
  return `Halo kak, saya mau beli ${name}`;
}

export function WaButton({
  message,
  label,
  className = "button is-secondary is-icon w-inline-block",
}: WaButtonProps) {
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <div>{label}</div>
    </a>
  );
}
