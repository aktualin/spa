import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getNewsletterSettings } from "../../actions/newsletter";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { SettingsForm } from "./settings-form";

export const instant = false;

export default async function AdminNewsletterSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [settings, params] = await Promise.all([getNewsletterSettings(), searchParams]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">Pengaturan Newsletter</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Header & footer di sini otomatis dipakai semua kampanye — isi kampanye cukup fokus ke
        konten utamanya saja.
      </p>

      <StatusBanners saved={params.saved} />

      <SettingsForm
        settings={{
          headerHtml: settings?.headerHtml ?? "",
          footerHtml: settings?.footerHtml ?? "",
          senderName: settings?.senderName ?? "",
          replyTo: settings?.replyTo ?? "",
          physicalAddress: settings?.physicalAddress ?? "",
          unsubscribeNotice: settings?.unsubscribeNotice ?? "",
        }}
      />
    </div>
  );
}
