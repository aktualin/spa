import { requireRole } from "@/lib/auth";
import { staticOurStory } from "@/lib/content/our-story";
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

  // Belum pernah disimpan: form diisi teks yang saat ini tampil di situs.
  const source = content ?? staticOurStory();

  return (
    <>
      <StatusBanner saved={params.saved} />
      <OurStoryForm
        isNew={!content}
        content={{
          heroTitle: source.heroTitle,
          heroImageUrl: source.heroImageUrl ?? "",
          philosophyHtml: source.philosophyHtml ?? "",
          valuesHtml: source.valuesHtml ?? "",
          seoTitle: source.seoTitle ?? "",
          seoDescription: source.seoDescription ?? "",
        }}
      />
    </>
  );
}
