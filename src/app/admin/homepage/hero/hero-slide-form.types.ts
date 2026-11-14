import type { HeroSlideMediaType } from "@/lib/domain/hero-slide";

import type { ActionState } from "../../actions/hero-slides";

export type HeroSlideFormData = {
  id: string | null;
  mediaType: HeroSlideMediaType;
  imageUrl: string;
  mobileImageUrl: string;
  videoUrl: string;
  imageAlt: string;
  isPublished: boolean;
};

export const initialState: ActionState = { error: null };
export const LIST_PATH = "/admin/homepage/hero";