import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CORPORATE_LIMITS } from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getCorporateProgram } from "../../../actions/corporate-items";
import { CorporateProgramForm, type ProgramFormData } from "../program-form";

export const instant = false;

export default async function CorporateProgramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  let data: ProgramFormData;

  if (id === "new") {
    data = { id: null, name: "", description: "", features: [], imageUrl: "", isPublished: true };
  } else {
    const program = await getCorporateProgram(id);
    if (!program) notFound();
    data = {
      id: program.id,
      name: program.name,
      description: program.description ?? "",
      features: program.features,
      imageUrl: program.imageUrl ?? "",
      isPublished: program.isPublished,
    };
  }

  return <CorporateProgramForm program={data} maxFeatures={CORPORATE_LIMITS.maxFeatures} />;
}
