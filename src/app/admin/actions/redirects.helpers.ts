import { revalidatePath, updateTag } from "next/cache";

import { CONTENT_TAGS } from "@/lib/content/tags";

export type ActionState = { error: string | null; ok?: boolean };

export const NOTE_MAX = 200;

export function revalidateRedirects() {
  updateTag(CONTENT_TAGS.redirects);
  revalidatePath("/admin/redirects");
}