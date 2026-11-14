"use client";

import { isBrokenMenuLink, resolveMenuHref } from "@/lib/domain/menu";

import type { MenuAdminRow } from "../actions/menu";
import { Badge } from "../settings/_components/form-ui";
import { LINK_TYPE_LABEL, LOCATION_LABEL } from "./menu-manager.constants";

/** Label item menu + badge tipe/lokasi + alamat tujuan. */
export function RowLabel({ row, depth }: { row: MenuAdminRow; depth: number }) {
  const href = resolveMenuHref(row);
  const broken = isBrokenMenuLink(row);
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-medium text-neutral-900">{row.label}</span>
        <Badge tone="muted">{LINK_TYPE_LABEL[row.linkType]}</Badge>
        {!row.isVisible ? <Badge tone="muted">Tersembunyi</Badge> : null}
        {broken ? <Badge tone="warn">Tujuan hilang</Badge> : null}
        {row.openInNew ? <Badge tone="muted">Tab baru</Badge> : null}
        {depth === 1
          ? row.locations.map((loc) => (
              <Badge key={loc}>{LOCATION_LABEL[loc]}</Badge>
            ))
          : null}
      </div>
      <p className="truncate font-mono text-xs text-neutral-500">
        {broken
          ? "Halaman tujuan sudah dihapus atau belum terbit — item ini tidak tampil di situs."
          : (href ?? "— (judul tanpa tautan)")}
      </p>
    </div>
  );
}