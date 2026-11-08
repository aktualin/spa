import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import {
  getSiteSettings,
  listWhatsAppTemplates,
} from "../../actions/settings";
import { StatusBanner } from "../_components/form-ui";
import { WhatsAppTemplateList } from "./whatsapp-template-list";

export const instant = false;

export default async function AdminWhatsAppSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [templates, settings, params] = await Promise.all([
    listWhatsAppTemplates(),
    getSiteSettings(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-900">
        Template Pesan WhatsApp
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Pesan yang dipakai tombol WhatsApp di seluruh website. Placeholder
        ditulis seperti {"{{nama}}"} dan otomatis diganti saat tautan dibuka.
      </p>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Template dihapus."
      />

      <div className="mt-6">
        <WhatsAppTemplateList
          templates={templates.map((template) => ({
            id: template.id,
            key: template.key,
            label: template.label,
            message: template.message,
          }))}
          number={settings?.whatsappNumber ?? ""}
        />
      </div>
    </div>
  );
}
