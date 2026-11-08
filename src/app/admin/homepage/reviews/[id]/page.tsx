import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getHomepageReview } from "../../../actions/homepage-content";
import { ReviewForm, type ReviewFormData } from "../../_components/content-forms";

export const instant = false;

export default async function HomepageReviewEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);
  const { id } = await params;

  let data: ReviewFormData;
  if (id === "new") {
    data = { id: null, quote: "", name: "", location: "", role: "", isPublished: true };
  } else {
    const review = await getHomepageReview(id);
    if (!review) notFound();
    data = {
      id: review.id,
      quote: review.quote,
      name: review.name,
      location: review.location ?? "",
      role: review.role ?? "",
      isPublished: review.isPublished,
    };
  }
  return <ReviewForm review={data} />;
}
