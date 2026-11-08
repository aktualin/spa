import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getCorporateStep } from "../../../actions/corporate-items";
import { CorporateStepForm, type StepFormData } from "../step-form";

export const instant = false;

export default async function CorporateStepEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  let data: StepFormData;

  if (id === "new") {
    data = { id: null, title: "", body: "" };
  } else {
    const step = await getCorporateStep(id);
    if (!step) notFound();
    data = { id: step.id, title: step.title, body: step.body ?? "" };
  }

  return <CorporateStepForm step={data} />;
}
