/** Foto "Past Collaborations" — lihat `corporate.ts`. */
import type { CollabPhoto, CorporateClientItem } from "./corporate.types.ts";

/**
 * Foto "Past Collaborations" dari dokumentasi klien yang tayang, berurutan.
 * Belum ada klien → daftar kosong dan bagiannya disembunyikan. `altSuffix`
 * (teks CB corporate.collab_alt_suffix) ditempel setelah nama klien; kosong
 * → alt cukup nama klien.
 */
export function collabPhotosFor(
  clients: readonly CorporateClientItem[] | null,
  altSuffix = "",
): CollabPhoto[] {
  if (clients === null) return [];
  const suffix = altSuffix.trim();
  return clients.flatMap((client) =>
    client.photoUrls.map((src) => ({
      src,
      alt: suffix ? `${client.name} — ${suffix}` : client.name,
    })),
  );
}