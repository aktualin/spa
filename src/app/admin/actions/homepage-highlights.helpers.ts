import { revalidatePath, updateTag } from "next/cache";

import { CONTENT_TAGS } from "@/lib/content/tags";

export type ActionState = { error: string | null; ok?: boolean };

export const LIST_PATH = "/admin/homepage/highlights";

export function revalidateHighlights() {
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath(LIST_PATH);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}