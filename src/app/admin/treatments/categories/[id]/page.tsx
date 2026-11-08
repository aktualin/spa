import { notFound } from "next/navigation";

import { getCategory } from "../../../actions/categories";
import { CategoryForm } from "../category-form";

export const instant = false;

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notEmpty?: string }>;
}) {
  const [{ id }, { notEmpty }] = await Promise.all([params, searchParams]);

  if (id === "new") {
    return (
      <CategoryForm
        category={{
          id: null,
          name: "",
          slug: "",
          kind: "TREATMENT",
          description: "",
          imageUrl: "",
          sortOrder: 0,
          isPublished: true,
          seoTitle: "",
          seoDescription: "",
          wasPublished: false,
          itemCount: 0,
        }}
      />
    );
  }

  const category = await getCategory(id);
  if (!category) notFound();

  return (
    <CategoryForm
      notEmpty={Boolean(notEmpty)}
      category={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        kind: category.kind,
        description: category.description ?? "",
        imageUrl: category.imageUrl ?? "",
        sortOrder: category.sortOrder,
        isPublished: category.isPublished,
        seoTitle: category.seoTitle ?? "",
        seoDescription: category.seoDescription ?? "",
        wasPublished: category.isPublished,
        itemCount: category._count.treatments,
      }}
    />
  );
}
