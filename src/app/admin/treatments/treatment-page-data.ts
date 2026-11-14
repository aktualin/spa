import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import type { TreatmentFormData } from "./treatment-form";

/** Data form treatment baru (kosong) atau yang sudah ada, dari database. */
export async function loadTreatmentFormData(
  id: string,
  defaultCategoryId: string | null,
): Promise<TreatmentFormData> {
  if (id === "new") {
    return {
      id: null,
      name: "",
      slug: "",
      categoryId: defaultCategoryId!,
      tagline: "",
      description: "",
      note: "",
      addonSection: "",
      imageUrl: "",
      whatsappMessage: "",
      seoTitle: "",
      seoDescription: "",
      sortOrder: 0,
      isNew: false,
      isBestSeller: false,
      isPublished: true,
      options: [],
      contentImages: [],
    };
  }

  const [treatment, contentImages] = await Promise.all([
    prisma.treatment.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.contentImage.findMany({
      where: { entityType: "treatment", entityId: id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: { imageUrl: true, altText: true },
    }),
  ]);
  if (!treatment) notFound();

  return {
    id: treatment.id,
    name: treatment.name,
    slug: treatment.slug,
    categoryId: treatment.categoryId,
    tagline: treatment.tagline ?? "",
    description: treatment.description ?? "",
    note: treatment.note ?? "",
    addonSection: treatment.addonSection ?? "",
    imageUrl: treatment.imageUrl ?? "",
    whatsappMessage: treatment.whatsappMessage ?? "",
    seoTitle: treatment.seoTitle ?? "",
    seoDescription: treatment.seoDescription ?? "",
    sortOrder: treatment.sortOrder,
    isNew: treatment.isNew,
    isBestSeller: treatment.isBestSeller,
    isPublished: treatment.isPublished,
    options: treatment.options.map((option) => ({
      label: option.label,
      durationMin: String(option.durationMin),
      priceIdr: String(option.priceIdr),
    })),
    contentImages,
  };
}