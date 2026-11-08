import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getHomepageHighlight } from "../../../actions/homepage-highlights";
import { toWibDateInput } from "../../../promos/_kit/schema";
import { HighlightForm, type HighlightFormData } from "../highlight-form";

export const instant = false;

export default async function HomepageHighlightEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;

  let data: HighlightFormData;

  if (id === "new") {
    data = {
      id: null,
      eyebrow: "",
      title: "",
      imageUrl: "",
      imageAlt: "",
      href: "",
      ctaLabel: "",
      startDate: "",
      endDate: "",
      isPublished: true,
    };
  } else {
    const highlight = await getHomepageHighlight(id);
    if (!highlight) notFound();

    data = {
      id: highlight.id,
      eyebrow: highlight.eyebrow ?? "",
      title: highlight.title,
      imageUrl: highlight.imageUrl ?? "",
      imageAlt: highlight.imageAlt ?? "",
      href: highlight.href ?? "",
      ctaLabel: highlight.ctaLabel ?? "",
      startDate: toWibDateInput(highlight.startDate),
      endDate: toWibDateInput(highlight.endDate),
      isPublished: highlight.isPublished,
    };
  }

  return <HighlightForm highlight={data} />;
}
