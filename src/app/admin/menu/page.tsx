import { requireRole } from "@/lib/auth";
import { MAX_MENU_DEPTH } from "@/lib/domain/menu";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listMenuAdmin, listMenuPageOptions } from "../actions/menu";
import { StatusBanner } from "../settings/_components/form-ui";
import { MenuManager } from "./menu-manager";

export const instant = false;

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [rows, pages, params] = await Promise.all([
    listMenuAdmin(),
    listMenuPageOptions(),
    searchParams,
  ]);

  // Komponen klien di-reset setiap data server berubah (setelah simpan/hapus).
  const version = rows
    .map((r) => `${r.id}:${r.parentId}:${r.sortOrder}:${r.label}:${r.isVisible}`)
    .join("|");

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold text-neutral-900">Menu Navigasi</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Atur menu header, menu ponsel, dan footer. Maksimal {MAX_MENU_DEPTH}{" "}
        level: menu utama → sub-menu → sub-sub-menu. Seret item untuk
        memindahkan, lalu tekan <strong>Simpan susunan</strong>.
      </p>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Item menu beserta sub-menunya dihapus."
      />

      <div className="mt-6">
        <MenuManager key={version} rows={rows} pages={pages} />
      </div>
    </div>
  );
}
