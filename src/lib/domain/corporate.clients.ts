/** Klien corporate: validasi isian — lihat `corporate.ts`. */
import {
  CORPORATE_LIMITS,
  readImageUrl,
  type Validation,
} from "./corporate.validation.ts";
import { collapseSpaces } from "./text.ts";

/**
 * Website klien: boleh tanpa "https://" (ditambahkan otomatis). Hanya http(s).
 */
export function normalizeWebsiteUrl(value: string): Validation<string | null> {
  const raw = value.trim();
  if (!raw) return { ok: true, data: null };
  if (raw.length > CORPORATE_LIMITS.websiteUrl) {
    return { ok: false, error: "Alamat website terlalu panjang." };
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { ok: false, error: "Website harus diawali http:// atau https://." };
    }
    if (!url.hostname.includes(".")) {
      return { ok: false, error: "Alamat website tidak valid." };
    }
    return { ok: true, data: url.toString() };
  } catch {
    return { ok: false, error: "Alamat website tidak valid." };
  }
}

export type ClientData = {
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  photoUrls: string[];
  isPublished: boolean;
};

export function validateClientInput(input: {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  photoUrls: readonly unknown[];
  isPublished: boolean;
}): Validation<ClientData> {
  const name = collapseSpaces(input.name);
  if (!name) return { ok: false, error: "Nama klien wajib diisi." };
  if (name.length > CORPORATE_LIMITS.clientName) {
    return { ok: false, error: `Nama klien maksimal ${CORPORATE_LIMITS.clientName} karakter.` };
  }
  const logo = readImageUrl(input.logoUrl);
  if (!logo.ok) return { ok: false, error: "URL logo tidak valid." };
  const website = normalizeWebsiteUrl(input.websiteUrl);
  if (!website.ok) return website;

  const photoUrls: string[] = [];
  for (const value of input.photoUrls) {
    if (typeof value !== "string" || !value.trim()) continue;
    const photo = readImageUrl(value);
    if (!photo.ok || !photo.data) return { ok: false, error: "Ada URL foto dokumentasi yang tidak valid." };
    if (!photoUrls.includes(photo.data)) photoUrls.push(photo.data);
  }
  if (photoUrls.length > CORPORATE_LIMITS.maxClientPhotos) {
    return {
      ok: false,
      error: `Maksimal ${CORPORATE_LIMITS.maxClientPhotos} foto dokumentasi per klien.`,
    };
  }

  return {
    ok: true,
    data: {
      name,
      logoUrl: logo.data,
      websiteUrl: website.data,
      photoUrls,
      isPublished: input.isPublished,
    },
  };
}