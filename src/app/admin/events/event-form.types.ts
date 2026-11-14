import type { EventFormState } from "../actions/events";

export type EventFormData = {
  id: string | null;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  isCollaboration: boolean;
  partnerName: string;
  partnerLogoUrl: string;
  partnerUrl: string;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
};

export const initialState: EventFormState = { error: null };