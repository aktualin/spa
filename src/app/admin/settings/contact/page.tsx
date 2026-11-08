import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getSiteSettings } from "../../actions/settings";
import { StatusBanner } from "../_components/form-ui";
import { SiteSettingsForm } from "./site-settings-form";

export const instant = false;

export default async function AdminContactSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [settings, params] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ]);

  return (
    <>
      <StatusBanner saved={params.saved} />
      <SiteSettingsForm
        settings={{
          address: settings?.address ?? "",
          mapsEmbedUrl: settings?.mapsEmbedUrl ?? "",
          whatsappNumber: settings?.whatsappNumber ?? "",
          email: settings?.email ?? "",
          phone: settings?.phone ?? "",
          instagramUrl: settings?.instagramUrl ?? "",
          tiktokUrl: settings?.tiktokUrl ?? "",
          facebookUrl: settings?.facebookUrl ?? "",
          freshaUrl: settings?.freshaUrl ?? "",
          openingHours: settings?.openingHours ?? [],
        }}
      />
    </>
  );
}
