/**
 * Sumber data untuk halaman lama /menu.
 *
 * Pembacaan DB memakai helper di `@/lib/content/catalog` yang sudah cached.
 * Fallback-nya (saat DB kosong/down) identik dengan data statis, sehingga
 * markup halaman /menu tidak berubah.
 */
import {
  packages as staticPackages,
  treatments as staticTreatments,
} from "@/data/content";
import { getMenuEntries, getMenuPackages, getMenuTreatments } from "@/lib/content/catalog";

import { MassageGrid, PackagesGrid } from "./menu-grids";

/** Grid treatment bagian "Massage" — versi dari DB. */
export async function MenuTreatmentsGrid() {
  const treatments = await getMenuTreatments();
  return <MassageGrid items={treatments.filter((t) => t.category === "Massage")} />;
}

/** Fallback grid treatment (dipakai sebagai Suspense fallback). */
export function MenuTreatmentsGridFallback() {
  return (
    <MassageGrid items={staticTreatments.filter((t) => t.category === "Massage")} />
  );
}

/** Grid package All Day Spa — versi dari DB. */
export async function MenuPackagesGrid() {
  const packages = await getMenuPackages();
  return <PackagesGrid items={packages} />;
}

/** Fallback grid package (dipakai sebagai Suspense fallback). */
export function MenuPackagesGridFallback() {
  return <PackagesGrid items={staticPackages} />;
}

export { getMenuEntries };
