import type { ActionState } from "../../actions/journal-categories";

export type JournalCategoryFormData = {
  id: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  isPublished: boolean;
  postCount: number;
};

export const LIST_PATH = "/admin/journal/categories";
export const initialState: ActionState = { error: null };