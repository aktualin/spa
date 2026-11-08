import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getOurStoryContent } from "../actions/our-story";
import { StatusBanner } from "../settings/_components/form-ui";
import { OurStoryForm } from "./our-story-form";

export const instant = false;

export default async function AdminOurStoryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [content, params] = await Promise.all([
    getOurStoryContent(),
    searchParams,
  ]);

  return (
    <>
      <StatusBanner saved={params.saved} />
      <OurStoryForm
        content={{
          heroTitle: content?.heroTitle ?? "Our Story",
          heroImageUrl: content?.heroImageUrl ?? "",
          philosophyHtml: content?.philosophyHtml ?? "",
          valuesHtml: content?.valuesHtml ?? "",
          seoTitle: content?.seoTitle ?? "",
          seoDescription: content?.seoDescription ?? "",
        }}
      />
    </>
  );
}
