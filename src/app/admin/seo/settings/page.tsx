import { getSiteUrl } from "@/lib/site-url";

import { requirePageAccess } from "../../access";
import { getSeoSettingsForAdmin } from "../../actions/seo";
import { StatusBanner } from "../../settings/_components/form-ui";
import { SeoSettingsForm } from "./seo-settings-form";

export const instant = false;

export default async function AdminSeoSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePageAccess("/admin/seo");

  const [settings, params] = await Promise.all([
    getSeoSettingsForAdmin(),
    searchParams,
  ]);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <StatusBanner
          saved={params.saved}
          savedText="Pengaturan SEO tersimpan dan langsung berlaku di situs."
        />
      </div>
      <SeoSettingsForm settings={settings} siteUrl={getSiteUrl()} />
    </>
  );
}
