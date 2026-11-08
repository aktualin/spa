import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getHomepageStat } from "../../../actions/homepage-content";
import { StatForm, type StatFormData } from "../../_components/content-forms";

export const instant = false;

export default async function HomepageStatEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const { id } = await params;

  let data: StatFormData;
  if (id === "new") {
    data = { id: null, value: "", label: "", isPublished: true };
  } else {
    const stat = await getHomepageStat(id);
    if (!stat) notFound();
    data = { id: stat.id, value: stat.value, label: stat.label, isPublished: stat.isPublished };
  }
  return <StatForm stat={data} />;
}
