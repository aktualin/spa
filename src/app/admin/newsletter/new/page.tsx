import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { CampaignForm } from "../campaign-form";

export const instant = false;

export default async function NewNewsletterCampaignPage() {
  await requireRole(CONTENT_ROLES);

  return (
    <CampaignForm
      campaign={{
        id: null,
        subject: "",
        previewText: "",
        bodyHtml: "",
        status: "DRAFT",
        canSend: false,
      }}
    />
  );
}
