import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { canSendNewsletterCampaign, getNewsletterCampaign } from "../../actions/newsletter";
import { CampaignForm } from "../campaign-form";

export const instant = false;

export default async function EditNewsletterCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  const [campaign, canSend] = await Promise.all([
    getNewsletterCampaign(id),
    canSendNewsletterCampaign(),
  ]);
  if (!campaign) notFound();

  return (
    <CampaignForm
      campaign={{
        id: campaign.id,
        subject: campaign.subject,
        previewText: campaign.previewText ?? "",
        bodyHtml: campaign.bodyHtml,
        status: campaign.status,
        canSend,
      }}
    />
  );
}
