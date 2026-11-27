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
            ? "Contact settings have never been saved. This form is prefilled with the default values currently shown on the site; press Save to store them in the database."
            : `The following fields are not yet saved in the database and are filled from the values currently shown on the site: ${defaults.prefilled.join(", ")}. Press Save to store them.`}
        </p>
      ) : null}
      <SiteSettingsForm settings={defaults.values} maxHours={MAX_OPENING_HOURS} />
    </>
  );
}
