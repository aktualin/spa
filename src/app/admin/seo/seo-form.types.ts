import type { ActionState } from "../actions/seo";

export type PageSeoFormData = {
  id: string | null;
  path: string;
  title: string;
  description: string;
  ogImageUrl: string;
};

export const initialState: ActionState = { error: null };