import type { ActionState } from "../actions/homepage";

export type HomepageSectionRow = {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  imageUrl: string;
  mobileImageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  isEnabled: boolean;
  sortOrder: number;
};

export const initialState: ActionState = { error: null };