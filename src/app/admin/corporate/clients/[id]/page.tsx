import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CORPORATE_LIMITS } from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getCorporateClient } from "../../../actions/corporate-items";
import { CorporateClientForm, type ClientFormData } from "../client-form";

export const instant = false;

export default async function CorporateClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  let data: ClientFormData;

  if (id === "new") {
    data = { id: null, name: "", logoUrl: "", websiteUrl: "", photoUrls: [], isPublished: true };
  } else {
    const client = await getCorporateClient(id);
    if (!client) notFound();
    data = {
      id: client.id,
      name: client.name,
      logoUrl: client.logoUrl ?? "",
      websiteUrl: client.websiteUrl ?? "",
      photoUrls: client.photoUrls,
      isPublished: client.isPublished,
    };
  }

  return <CorporateClientForm client={data} maxPhotos={CORPORATE_LIMITS.maxClientPhotos} />;
}
