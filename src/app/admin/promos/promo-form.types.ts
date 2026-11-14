import type { ActionState } from "../actions/promos";

export type PromoFormData = {
  id: string | null;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  terms: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  whatsappMessage: string;
};

export const initialState: ActionState = { error: null };