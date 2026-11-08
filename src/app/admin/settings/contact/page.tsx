import {
  MAX_OPENING_HOURS,
  siteSettingsFormDefaults,
} from "@/lib/domain/site-settings";

import { requirePageAccess } from "../../access";
import { getContactSettingsRow } from "../../actions/settings";
import { StatusBanner } from "../_components/form-ui";
import { SiteSettingsForm } from "./site-settings-form";

export const instant = false;

export default async function AdminContactSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePageAccess("/admin/settings/contact");

  const [row, params] = await Promise.all([
    getContactSettingsRow(),
    searchParams,
  ]);
  const defaults = siteSettingsFormDefaults(row);

  return (
    <>
      <StatusBanner saved={params.saved} />
      {defaults.noRow || defaults.prefilled.length > 0 ? (
        <p
          role="status"
          className="mx-auto mt-4 max-w-2xl rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {defaults.noRow
            ? "Pengaturan kontak belum pernah disimpan. Form ini diisi nilai bawaan yang saat ini tampil di situs; tekan Simpan untuk menyimpannya ke database."
            : `Field berikut belum tersimpan di database dan diisi dari nilai yang saat ini tampil di situs: ${defaults.prefilled.join(", ")}. Tekan Simpan untuk menyimpannya.`}
        </p>
      ) : null}
      <SiteSettingsForm settings={defaults.values} maxHours={MAX_OPENING_HOURS} />
    </>
  );
}
