import { notFound } from "next/navigation";

import { getJournalCategory } from "../../../actions/journal-categories";
import {
  JournalCategoryForm,
  type JournalCategoryFormData,
} from "../category-form";

export const instant = false;

export default async function AdminJournalCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notEmpty?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const category = isNew ? null : await getJournalCategory(id);
  if (!isNew && !category) notFound();

  const data: JournalCategoryFormData = category
    ? {
        id: category.id,
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isPublished: category.isPublished,
        postCount: category._count.posts,
      }
    : {
        id: null,
        name: "",
        slug: "",
        sortOrder: 0,
        isPublished: true,
        postCount: 0,
      };

  return <JournalCategoryForm category={data} notEmpty={query.notEmpty === "1"} />;
}
