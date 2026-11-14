/** Konteks template: retail, cabang, event. */
import type { WhatsAppContextDefinition } from "./whatsapp-template.types.ts";

export const EXTRA_CONTEXTS: readonly WhatsAppContextDefinition[] = [
  {
    key: "retail",
    label: "Pemesanan produk retail",
    usedOn: "Tombol “Pesan via WhatsApp” di halaman Retail.",
    builtIn: "Halo kak, saya mau pesan produk {{product}}",
    placeholders: [
      { name: "product", description: "Nama produk", sample: "KAMA Body Oil" },
      {
        name: "price",
        description: "Harga produk (bila tidak dipakai, harga ditambahkan di akhir)",
        sample: "Rp 185.000",
      },
    ],
    aliases: ["produk", "nama", "name", "harga"],
    primary: "product",
  },
  {
    key: "location",
    label: "Reservasi per cabang",
    usedOn: "Tombol WhatsApp pada kartu cabang di halaman Kontak.",
    builtIn:
      "Halo kak, apakah yang di {{address}} sudah buka dan bisa reservasi sekarang ?",
    placeholders: [
      { name: "address", description: "Alamat cabang", sample: "Jl. Kemang Raya No. 12" },
    ],
    primary: "address",
  },
  {
    key: "event",
    label: "Daftar event",
    usedOn: "Tombol “Register via WhatsApp” di halaman detail event.",
    builtIn: "Halo kak, saya mau ikut event {{event}}",
    placeholders: [
      { name: "event", description: "Judul event", sample: "Wellness Weekend" },
    ],
    primary: "event",
  },
];