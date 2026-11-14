import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { CONTENT_TAGS } from "@/lib/content/tags";
import { MENU_LINK_TYPES, MENU_LOCATIONS } from "@/lib/domain/menu";

export function revalidateMenu() {
  updateTag(CONTENT_TAGS.menu);
  revalidatePath("/admin/menu");
}

export const itemSchema = z.object({
  id: z.string().trim().optional(),
  parentId: z.string().trim().optional(),
  label: z.string(),
  linkType: z.enum(MENU_LINK_TYPES),
  url: z.string().trim().optional(),
  pageId: z.string().trim().optional(),
  isVisible: z.boolean(),
  openInNew: z.boolean(),
  locations: z.array(z.enum(MENU_LOCATIONS)),
  panelKey: z.string().trim().max(40).optional(),
  panelLinkLabel: z.string().trim().max(60).optional(),
  panelWidth: z.enum(["", "narrow", "wide"]),
  highlightImageUrl: z.string().trim().max(500).optional(),
  highlightLabel: z.string().trim().max(60).optional(),
  highlightHref: z.string().trim().max(500).optional(),
  highlightBadge: z.string().trim().max(30, "Badge kartu maks. 30 karakter.").optional(),
  highlightEyebrow: z.string().trim().max(60, "Eyebrow kartu maks. 60 karakter.").optional(),
});

export type MenuItemInput = z.infer<typeof itemSchema>;

export const structureSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      parentId: z.string().min(1).nullable(),
      sortOrder: z.number().int().min(0),
    }),
  )
  .max(500);