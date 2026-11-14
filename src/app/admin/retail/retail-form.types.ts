import type { ActionState } from "../actions/retail";

export type RetailFormData = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  priceIdr: string;
  whatsappMessage: string;
  /** String kosong = produk baru diletakkan di akhir daftar. */
  sortOrder: string;
  isHighlight: boolean;
  isPublished: boolean;
};

export const initialState: ActionState = { error: null };