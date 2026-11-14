/** Konteks template: reservasi, treatment, paket, promo, gift, membership. */
import type { WhatsAppContextDefinition } from "./whatsapp-template.types.ts";

export const CORE_CONTEXTS: readonly WhatsAppContextDefinition[] = [
  {
    key: "default",
    label: "Reservasi umum",
    usedOn:
      "Tombol WhatsApp melayang (semua halaman) dan tombol WhatsApp di menu mobile.",
    builtIn: "Halo kak, saya mau reservasi",
    placeholders: [],
  },
  {
    key: "treatment",
    label: "Reservasi treatment tertentu",
    usedOn: "Halaman detail treatment dan kartu treatment.",
    builtIn: "Halo kak, saya mau reservasi {{treatment}}",
    placeholders: [
      { name: "treatment", description: "Nama treatment", sample: "Sukma Laya" },
      { name: "category", description: "Nama kategori treatment", sample: "Massage" },
    ],
    primary: "treatment",
  },
  {
    key: "package",
    label: "Reservasi paket",
    usedOn: "Halaman detail paket dan kartu paket.",
    builtIn: "Halo kak, saya mau reservasi {{package}}",
    placeholders: [
      { name: "package", description: "Nama paket", sample: "All Day Spa" },
      { name: "price", description: "Harga paket", sample: "Rp 1.250.000" },
      { name: "duration", description: "Durasi paket (kosong bila tidak diisi)", sample: "3 jam" },
    ],
    primary: "package",
  },
  {
    key: "promo",
    label: "Tanya promo",
    usedOn: "Tombol “Tanya Promo via WhatsApp” di halaman detail promo.",
    builtIn: "Halo kak, saya mau tanya promo {{promo}}",
    placeholders: [
      { name: "promo", description: "Judul promo", sample: "Promo Akhir Pekan" },
    ],
    primary: "promo",
  },
  {
    key: "gift",
    label: "Beli gift card",
    usedOn: "Tombol “Pesan via WhatsApp” di halaman Gift Card.",
    builtIn: "Halo kak, saya mau beli KAMA Gift Card",
    placeholders: [
      { name: "giftCard", description: "Judul gift card", sample: "KAMA Gift Card" },
    ],
  },
  {
    key: "membership",
    label: "Daftar membership",
    usedOn: "Tombol “Join KAMA Now” dan “Join Now” di halaman Membership.",
    builtIn: "Halo kak, saya mau join member",
    placeholders: [],
  },
];