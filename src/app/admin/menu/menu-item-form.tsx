"use client";

import { useActionState, useState } from "react";

import {
  resolveMenuHref,
  validateMenuLink,
  type MenuLinkType,
} from "@/lib/domain/menu";

import {
  saveMenuItemAction,
  type MenuAdminRow,
  type MenuPageOption,
} from "../actions/menu";
import { ErrorMessage, Field, SaveButton, inputClass } from "../settings/_components/form-ui";
import { initialState } from "./menu-item-form.constants";
import { LinkTypeFields } from "./menu-item-link";
import { LinkPreview, MenuItemFormHeader } from "./menu-item-form-parts";
import { MegaMenuPanel } from "./menu-item-panel";
import { LocationsFieldset, TargetFields } from "./menu-item-root-fields";

export function MenuItemForm({
  item,
  parentId,
  parentLabel,
  depth,
  pages,
  onCancel,
}: {
  item: MenuAdminRow | null;
  parentId: string | null;
  parentLabel: string | null;
  depth: number;
  pages: MenuPageOption[];
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(saveMenuItemAction, initialState);
  const [linkType, setLinkType] = useState<MenuLinkType>(item?.linkType ?? "INTERNAL_URL");
  const [url, setUrl] = useState(item?.url ?? "");
  const [pageId, setPageId] = useState(item?.pageId ?? "");

  const isRoot = parentId === null;
  const selectedPage = pages.find((p) => p.id === pageId) ?? null;
  const needsUrl = linkType !== "PAGE" && linkType !== "NO_LINK";

  const linkError = validateMenuLink({
    linkType,
    url: needsUrl ? url : null,
    pageId: linkType === "PAGE" ? pageId || null : null,
  });
  const previewHref = linkError
    ? null
    : resolveMenuHref({
        linkType,
        url: needsUrl ? url : null,
        page: selectedPage ? { slug: selectedPage.slug, published: selectedPage.published } : null,
      });

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-300 bg-neutral-50 p-4"
    >
      <MenuItemFormHeader item={item} isRoot={isRoot} depth={depth} parentLabel={parentLabel} />

      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      {!item && parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}

      <Field label="Label" htmlFor="menu-label">
        <input
          id="menu-label"
          name="label"
          defaultValue={item?.label ?? ""}
          maxLength={60}
          required
          className={inputClass}
        />
      </Field>

      <LinkTypeFields
        linkType={linkType}
        setLinkType={setLinkType}
        url={url}
        setUrl={setUrl}
        pageId={pageId}
        setPageId={setPageId}
        pages={pages}
        needsUrl={needsUrl}
      />

      <LinkPreview linkError={linkError} linkType={linkType} previewHref={previewHref} />

      <TargetFields item={item} />

      {isRoot ? <LocationsFieldset item={item} /> : null}
      {isRoot ? <MegaMenuPanel item={item} /> : null}

      <ErrorMessage error={state.error} />

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
        <SaveButton label={item ? "Simpan perubahan" : "Tambah"} />
        <button type="button" onClick={onCancel} className="text-sm text-neutral-600 hover:underline">
          Batal
        </button>
      </div>
    </form>
  );
}