/** Tipe bacaan cabang publik — lihat `branches.ts`. */

export type Branch = {
  slug: string;
  name: string;
  area: string;
  tag: string | null;
  address: string;
  openingHours: string[];
  /** Nomor tampilan, mis. "+62 813-1605-2040". */
  phone: string;
  email: string;
  /** Digit saja untuk `wa.me`; kosong bila belum diatur di mana pun. */
  whatsappNumber: string;
  mapsEmbedUrl: string;
  /** Tautan "Dapatkan Rute"; diturunkan dari alamat bila belum diisi. */
  mapsUrl: string;
  latitude: number | null;
  longitude: number | null;
};

export type BranchRow = {
  slug: string;
  name: string;
  area: string;
  tag: string | null;
  address: string | null;
  openingHours: string[];
  whatsappNumber: string | null;
  phone: string | null;
  email: string | null;
  mapsEmbedUrl: string | null;
  mapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  sortOrder: number;
  id: string;
};