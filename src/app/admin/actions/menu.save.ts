"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { validateMenuLabel, validateMenuLink } from "@/lib/domain/menu";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { resolveMenuItemData } from "./menu.item-data";
import { itemSchema, revalidateMenu } from "./menu.schemas";
import type { ActionState } from "./menu.types";

export async function saveMenuItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const parsed = itemSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    parentId: String(formData.get("parentId") ?? "") || undefined,
    label: String(formData.get("label") ?? ""),
    linkType: formData.get("linkType"),
    url: String(formData.get("url") ?? ""),
    pageId: String(formData.get("pageId") ?? ""),
    isVisible: formData.get("isVisible") === "on",
    openInNew: formData.get("target") === "_blank",
    locations: formData.getAll("locations").map(String),
    panelKey: String(formData.get("panelKey") ?? ""),
    panelLinkLabel: String(formData.get("panelLinkLabel") ?? ""),
    panelWidth: String(formData.get("panelWidth") ?? ""),
    highlightImageUrl: String(formData.get("highlightImageUrl") ?? ""),
    highlightLabel: String(formData.get("highlightLabel") ?? ""),
    highlightHref: String(formData.get("highlightHref") ?? ""),
    highlightBadge: String(formData.get("highlightBadge") ?? ""),
    highlightEyebrow: String(formData.get("highlightEyebrow") ?? ""),
  });
  if (!parsed.success) return { error: "Isian menu tidak valid." };
  const input = parsed.data;

  const labelError = validateMenuLabel(input.label);
  if (labelError) return { error: labelError };

  const url = ["PAGE", "NO_LINK"].includes(input.linkType) ? null : input.url || null;
  const pageId = input.linkType === "PAGE" ? input.pageId || null : null;
  const linkError = validateMenuLink({ linkType: input.linkType, url, pageId });
  if (linkError) return { error: linkError };

  if (pageId && !(await prisma.staticPage.findUnique({ where: { id: pageId }, select: { id: true } }))) {
    return { error: "Halaman tujuan tidak ditemukan. Mungkin sudah dihapus." };
  }

  const all = await prisma.menuItem.findMany({
    select: { id: true, parentId: true, sortOrder: true },
  });

  const resolved = resolveMenuItemData(input, url, pageId, all);
  if (!resolved.ok) return { error: resolved.error };
  const { parentId, data } = resolved;

  if (input.id) {
    await prisma.menuItem.update({ where: { id: input.id }, data });
  } else {
    const siblingOrders = all.filter((row) => row.parentId === parentId).map((row) => row.sortOrder);
    await prisma.menuItem.create({
      data: {
        ...data,
        parentId,
        sortOrder: siblingOrders.length ? Math.max(...siblingOrders) + 1 : 0,
      },
    });
  }

  revalidateMenu();
  redirect("/admin/menu?saved=1");
}