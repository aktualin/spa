"use server";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import type { MenuAdminRow, MenuPageOption } from "./menu.types";

export async function listMenuAdmin(): Promise<MenuAdminRow[]> {
  await requireRole(CONTENT_ROLES);
  const items = await prisma.menuItem.findMany({
    include: { page: { select: { slug: true, title: true, status: true } } },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  return items.map((item) => ({
    id: item.id,
    parentId: item.parentId,
    label: item.label,
    linkType: item.linkType,
    url: item.url,
    pageId: item.pageId,
    page: item.page
      ? {
          slug: item.page.slug,
          title: item.page.title,
          published: item.page.status === "PUBLISHED",
        }
      : null,
    sortOrder: item.sortOrder,
    isVisible: item.isVisible,
    openInNew: item.openInNew,
    locations: item.locations,
    panelKey: item.panelKey,
    panelLinkLabel: item.panelLinkLabel,
    panelWidth: item.panelWidth,
    highlightImageUrl: item.highlightImageUrl,
    highlightLabel: item.highlightLabel,
    highlightHref: item.highlightHref,
    highlightBadge: item.highlightBadge,
    highlightEyebrow: item.highlightEyebrow,
  }));
}

export async function listMenuPageOptions(): Promise<MenuPageOption[]> {
  await requireRole(CONTENT_ROLES);
  const pages = await prisma.staticPage.findMany({
    select: { id: true, title: true, slug: true, status: true },
    orderBy: { title: "asc" },
  });
  return pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    published: p.status === "PUBLISHED",
  }));
}