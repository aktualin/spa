/**
 * Sumber data untuk halaman lama /menu.
 *
 * Pembacaan DB memakai helper di `@/lib/content/catalog` yang sudah cached.
 * Suspense fallback-nya berupa skeleton netral, bukan konten statis, supaya
 * tidak ada daftar treatment hardcode yang sempat tampil ke tamu.
 */
import { getMenuEntries, getMenuPackages, getMenuTreatments } from "@/lib/content/catalog";

import { MassageGrid, PackagesGrid } from "./menu-grids";

/** Grid treatment bagian "Massage" — versi dari DB. */
export async function MenuTreatmentsGrid({
  categoryLabels,
}: {
  categoryLabels: Record<string, string>;
}) {
  const treatments = await getMenuTreatments();
  return (
    <MassageGrid
      items={treatments.filter((t) => t.category === "Massage")}
      categoryLabels={categoryLabels}
    />
  );
}

/** Baris abu-abu sebagai penanda muat; jumlahnya sekadar menjaga tinggi area. */
function GridSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-hidden className="animate-pulse space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 rounded bg-cocoa/5" />
      ))}
    </div>
  );
}

export function MenuTreatmentsGridFallback() {
  return <GridSkeleton rows={6} />;
}

/** Grid package All Day Spa — versi dari DB. */
export async function MenuPackagesGrid() {
  const packages = await getMenuPackages();
  return <PackagesGrid items={packages} />;
}

export function MenuPackagesGridFallback() {
  return <GridSkeleton rows={3} />;
}

export { getMenuEntries };
