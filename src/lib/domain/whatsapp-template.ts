/**
 * Template pesan WhatsApp (click-to-chat `wa.me`, tanpa API berbayar).
 *
 * Admin mengatur template pesan per konteks (default, treatment, package,
 * promo, gift, membership, retail) di modul Kontak & Umum → Template WhatsApp.
 * Template boleh memuat placeholder seperti `{{treatment}}`; daftar
 * placeholder yang benar-benar terisi ada di `WHATSAPP_CONTEXTS`.
 *
 * Modul ini murni (tanpa I/O) supaya bisa diuji dengan `node --test`.
 */

const PLACEHOLDER_RE = /\{\{\s*(\w+)\s*\}\}/g;

/** Batas panjang pesan template (karakter). */
export const MAX_TEMPLATE_LENGTH = 1000;

/** Mengganti `{{key}}` dengan nilainya. Placeholder yang tak dikenal dibiarkan. */
export function renderTemplate(
  template: string,
  values: Record<string, string | number | null | undefined> = {},
): string {
  return template.replace(PLACEHOLDER_RE, (match, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return match;
    return String(value);
  });
}

/** Daftar placeholder yang ada di dalam sebuah template. */
export function extractPlaceholders(template: string): string[] {
  const found = new Set<string>();
  for (const match of template.matchAll(PLACEHOLDER_RE)) {
    found.add(match[1]);
  }
  return [...found];
}

/**
 * Mengisi template untuk dikirim ke tamu: placeholder yang tak terisi
 * (tidak dikenal, `null`, atau kosong) dihapus, lalu spasi ganda dan spasi
 * sebelum tanda baca dirapikan. Baris baru dipertahankan.
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number | null | undefined> = {},
): string {
  const filled = template.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return "";
    return String(value).trim();
  });

  return filled
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]{2,}/g, " ")
        .replace(/[ \t]+([,.!?;:])/g, "$1")
        .replace(/\(\s*\)/g, "")
        .replace(/[ \t]{2,}/g, " ")
        .trim(),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Membangun URL `wa.me` dari pesan. Semua nomor harus digit saja.
 * Fungsi ini satu-satunya tempat yang membentuk tautan WhatsApp.
 */
export function buildWhatsAppLink(
  message: string,
  number: string,
): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Normalisasi nomor yang diisi admin menjadi format `wa.me` (digit, awalan 62).
 *
 * Admin biasa menulis `0813-1605-2040`, `+62 813 1605 2040`, atau `62813...`.
 * Mengembalikan `null` kalau hasilnya tidak masuk akal sebagai nomor Indonesia,
 * supaya pemanggil bisa jatuh ke nomor default alih-alih membuat link rusak.
 */
export function normalizeWaNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;

  if (!digits.startsWith("62")) return null;
  // 62 + 9..13 digit nomor seluler Indonesia.
  if (digits.length < 11 || digits.length > 15) return null;

  return digits;
}

/* ---------- konteks template ---------- */

export type WhatsAppContextKey =
  | "default"
  | "treatment"
  | "package"
  | "promo"
  | "gift"
  | "membership"
  | "retail";

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

export const WHATSAPP_CONTEXTS: readonly WhatsAppContextDefinition[] = [
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
];

export const WHATSAPP_CONTEXT_KEYS: readonly WhatsAppContextKey[] =
  WHATSAPP_CONTEXTS.map((context) => context.key);

/** true bila key adalah template sistem (tidak boleh dihapus). */
export function isSystemTemplateKey(key: string): key is WhatsAppContextKey {
  return (WHATSAPP_CONTEXT_KEYS as readonly string[]).includes(key);
}

export function getContextDefinition(
  key: WhatsAppContextKey,
): WhatsAppContextDefinition {
  const found = WHATSAPP_CONTEXTS.find((context) => context.key === key);
  if (!found) throw new Error(`Konteks WhatsApp tidak dikenal: ${key}`);
  return found;
}

/** Teks bawaan sebuah konteks (pesan yang dipakai situs sebelum ada template). */
export function builtInMessage(key: WhatsAppContextKey): string {
  return getContextDefinition(key).builtIn;
}

/** Nama placeholder yang diterima sebuah konteks (termasuk alias). */
export function allowedPlaceholders(key: WhatsAppContextKey): string[] {
  const context = getContextDefinition(key);
  return [
    ...context.placeholders.map((placeholder) => placeholder.name),
    ...(context.aliases ?? []),
  ];
}

/** Nilai contoh untuk pratinjau template di admin. */
export function sampleValues(key: WhatsAppContextKey): Record<string, string> {
  const values: Record<string, string> = {};
  for (const placeholder of getContextDefinition(key).placeholders) {
    values[placeholder.name] = placeholder.sample;
  }
  return values;
}

export type TemplateValidation = {
  /** Kesalahan yang membuat template ditolak. */
  errors: string[];
  /** Hal yang perlu diperhatikan, tetapi template tetap boleh disimpan. */
  warnings: string[];
};

/** Validasi isi template untuk sebuah konteks. */
export function validateTemplate(
  key: WhatsAppContextKey,
  message: string,
): TemplateValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const text = message.trim();

  if (!text) errors.push("Isi pesan wajib diisi.");
  if (text.length > MAX_TEMPLATE_LENGTH) {
    errors.push(
      `Pesan terlalu panjang (${text.length} karakter, maksimal ${MAX_TEMPLATE_LENGTH}).`,
    );
  }

  // Kurung kurawal yang tersisa setelah placeholder valid dibuang = salah tulis.
  if (/\{\{|\}\}/.test(text.replace(PLACEHOLDER_RE, ""))) {
    errors.push(
      "Penulisan placeholder tidak lengkap. Gunakan bentuk {{nama}} dengan dua kurung kurawal di kedua sisi.",
    );
  }

  const allowed = allowedPlaceholders(key);
  const unknown = extractPlaceholders(text).filter((name) => !allowed.includes(name));
  if (unknown.length > 0) {
    const list = unknown.map((name) => `{{${name}}}`).join(", ");
    errors.push(
      allowed.length > 0
        ? `Placeholder tidak dikenal: ${list}. Yang tersedia: ${getContextDefinition(key)
            .placeholders.map((placeholder) => `{{${placeholder.name}}}`)
            .join(", ")}.`
        : `Placeholder tidak dikenal: ${list}. Template ini tidak memakai placeholder.`,
    );
  }

  const context = getContextDefinition(key);
  if (context.primary && text && !extractPlaceholders(text).includes(context.primary)) {
    const acceptedAlias =
      key === "retail" &&
      extractPlaceholders(text).some((name) => ["produk", "nama", "name"].includes(name));
    if (!acceptedAlias) {
      warnings.push(
        key === "retail"
          ? `Pesan tidak memuat {{${context.primary}}}; halaman Retail akan tetap memakai teks bawaan.`
          : `Pesan tidak memuat {{${context.primary}}}, jadi tamu tidak menyebut nama yang dipilih.`,
      );
    }
  }

  return { errors, warnings };
}

/**
 * Menentukan pesan WhatsApp untuk sebuah tombol.
 *
 * Urutan prioritas:
 * 1. `custom` — pesan khusus konten (mis. `promo.whatsappMessage`);
 * 2. `template` — template konteks dari modul Kontak & Umum;
 * 3. teks bawaan konteks (`builtInMessage`) — pesan yang dipakai selama ini.
 *
 * Setiap kandidat diisi lewat `fillTemplate`; kandidat yang hasilnya kosong
 * dilewati.
 */
export function resolveWhatsAppMessage({
  context,
  custom,
  template,
  values = {},
}: {
  context: WhatsAppContextKey;
  custom?: string | null;
  template?: string | null;
  values?: Record<string, string | number | null | undefined>;
}): string {
  for (const candidate of [custom, template, builtInMessage(context)]) {
    if (!candidate?.trim()) continue;
    const message = fillTemplate(candidate, values);
    if (message) return message;
  }
  return builtInMessage("default");
}
