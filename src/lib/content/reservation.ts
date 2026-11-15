/**
 * Pilihan layanan untuk form reservasi publik (`/contact` & `/reservation`):
 * treatment published dikelompokkan per kategori + satu grup paket. Nilai
 * opsinya adalah nama tampil — itulah yang disimpan ke `ReservationRequest`
 * supaya inbox admin tetap terbaca walau treatment nanti dihapus/diganti slug.
 * Pembacaannya menumpang cache `getCatalog`/`getPackages` (tag katalog).
 */
import type { ReservationServiceGroup } from "@/lib/domain/forms";

import { getCatalog } from "./catalog.categories";
import { getPackages } from "./catalog.packages";

export const PACKAGE_GROUP_LABEL = "Packages";

export async function getReservationServices(): Promise<ReservationServiceGroup[]> {
  const [catalog, packages] = await Promise.all([getCatalog(), getPackages()]);

  const groups: ReservationServiceGroup[] = catalog
    .filter((category) => category.kind === "TREATMENT" && category.treatments.length > 0)
    .map((category) => ({
      group: category.name,
      options: category.treatments.map((treatment) => treatment.name),
    }));

  if (packages.length > 0) {
    groups.push({
      group: PACKAGE_GROUP_LABEL,
      options: packages.map((pack) => pack.name),
    });
  }
  return groups;
}
