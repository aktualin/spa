import { notFound } from "next/navigation";

import { requirePageAccess } from "../../access";
import { getBranch } from "../../actions/branches";
import { BranchForm, type BranchFormData } from "../branch-form";

export const instant = false;

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAccess("/admin/branches");

  const { id } = await params;
  let data: BranchFormData;

  if (id === "new") {
    data = {
      id: null,
      name: "",
      slug: "",
      area: "",
      tag: "",
      address: "",
      openingHours: "",
      whatsappNumber: "",
      phone: "",
      email: "",
      mapsEmbedUrl: "",
      mapsUrl: "",
      latitude: "",
      longitude: "",
      sortOrder: "",
      isPublished: true,
    };
  } else {
    const branch = await getBranch(id);
    if (!branch) notFound();
    data = {
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
      area: branch.area,
      tag: branch.tag ?? "",
      address: branch.address ?? "",
      openingHours: branch.openingHours.join("\n"),
      whatsappNumber: branch.whatsappNumber ?? "",
      phone: branch.phone ?? "",
      email: branch.email ?? "",
      mapsEmbedUrl: branch.mapsEmbedUrl ?? "",
      mapsUrl: branch.mapsUrl ?? "",
      latitude: branch.latitude === null ? "" : String(branch.latitude),
      longitude: branch.longitude === null ? "" : String(branch.longitude),
      sortOrder: String(branch.sortOrder),
      isPublished: branch.isPublished,
    };
  }

  return <BranchForm branch={data} />;
}
