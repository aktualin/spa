import type { MenuLinkType, MenuLocation } from "@/lib/domain/menu";

export type ActionState = { error: string | null; ok?: boolean };

export type MenuAdminRow = {
  id: string;
  parentId: string | null;
  label: string;
  linkType: MenuLinkType;
  url: string | null;
  pageId: string | null;
  page: { slug: string; title: string; published: boolean } | null;
  sortOrder: number;
  isVisible: boolean;
  openInNew: boolean;
  locations: MenuLocation[];
  panelKey: string | null;
  panelLinkLabel: string | null;
  panelWidth: number | null;
  highlightImageUrl: string | null;
  highlightLabel: string | null;
  highlightHref: string | null;
  highlightBadge: string | null;
  highlightEyebrow: string | null;
};

export type MenuPageOption = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
};