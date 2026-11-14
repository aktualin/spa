/** Tipe konteks template WhatsApp — lihat `whatsapp-template.ts`. */

export type WhatsAppContextKey =
  | "default"
  | "treatment"
  | "package"
  | "promo"
  | "gift"
  | "membership"
  | "retail"
  | "location"
  | "event";

export type WhatsAppPlaceholder = {
  /** Nama placeholder tanpa kurung kurawal. */
  name: string;
  /** Penjelasan untuk admin. */
  description: string;
  /** Nilai contoh untuk pratinjau. */
  sample: string;
};

export type WhatsAppContextDefinition = {
  key: WhatsAppContextKey;
  /** Label bawaan template (dipakai saat template dibuat). */
  label: string;
  /** Di mana template ini dipakai di website. */
  usedOn: string;
  /** Teks bawaan — sama persis dengan pesan yang dipakai situs selama ini. */
  builtIn: string;
  /** Placeholder yang benar-benar terisi untuk konteks ini. */
  placeholders: WhatsAppPlaceholder[];
  /** Nama lain yang juga diterima (kompatibilitas). */
  aliases?: string[];
  /** Placeholder utama; bila tidak ada, admin diberi peringatan. */
  primary?: string;
};