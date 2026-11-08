import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listMenuItems } from "../actions/menu";
import { StatusBanner } from "../settings/_components/form-ui";
import { MenuItemList } from "./menu-item-list";

export const instant = false;

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [items, params] = await Promise.all([listMenuItems(), searchParams]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-900">
        Menu Navigasi
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Item navigasi yang dipakai navbar &amp; footer publik. Sub-menu
        dibatasi satu level di bawah induknya.
      </p>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Item menu dihapus."
      />

      <div className="mt-6">
        <MenuItemList
          items={items.map((item) => ({
            id: item.id,
            label: item.label,
            url: item.url,
            sortOrder: item.sortOrder,
            isVisible: item.isVisible,
            openInNew: item.openInNew,
            parentId: item.parentId,
            children: item.children.map((child) => ({
              id: child.id,
              label: child.label,
              url: child.url,
              sortOrder: child.sortOrder,
              isVisible: child.isVisible,
              openInNew: child.openInNew,
              parentId: child.parentId,
            })),
          }))}
        />
      </div>
    </div>
  );
}
