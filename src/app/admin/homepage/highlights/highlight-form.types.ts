import type { ActionState } from "../../actions/homepage-highlights";

export type HighlightFormData = {
  id: string | null;
  eyebrow: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
};

export const initialState: ActionState = { error: null };

export const LIST_PATH = "/admin/homepage/highlights";