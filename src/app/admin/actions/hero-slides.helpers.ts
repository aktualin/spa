import { revalidatePath, updateTag } from "next/cache";

import { CONTENT_TAGS } from "@/lib/content/tags";

export type ActionState = { error: string | null; ok?: boolean };

export const LIST_PATH = "/admin/homepage/hero";

export function revalidateHeroSlides() {
  updateTag(CONTENT_TAGS.homepage);
  revalidatePath(LIST_PATH);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export function uniqueUrls(...values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}