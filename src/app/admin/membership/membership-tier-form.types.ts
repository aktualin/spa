import type { ActionState } from "../actions/membership";

export type TierFormData = {
  id: string | null;
  slug: string;
  name: string;
  priceLabel: string;
  billingNote: string;
  summary: string;
  benefits: string[];
  terms: string;
  isPublished: boolean;
  sortOrder: number;
};

export const initialState: ActionState = { error: null };