import type { ActionState } from "../actions/branches";

export type BranchFormData = {
  id: string | null;
  name: string;
  slug: string;
  area: string;
  tag: string;
  address: string;
  /** Satu baris per entri, dipisah "\n". */
  openingHours: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  mapsEmbedUrl: string;
  mapsUrl: string;
  latitude: string;
  longitude: string;
  /** String kosong = cabang baru diletakkan di akhir daftar. */
  sortOrder: string;
  isPublished: boolean;
};

export const initialState: ActionState = { error: null };