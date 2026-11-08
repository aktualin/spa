import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { TreatmentForm, type TreatmentFormData } from "../treatment-form";

export const instant = false;

export default async function EditTreatmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "EDITOR"]);

  const { id } = await params;
  const isNew = id === "new";

  const categories = await prisma.treatmentCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    return (
      <p className="text-sm text-neutral-600">
        Belum ada kategori treatment. Jalankan seeder terlebih dahulu.
      </p>
    );
  }

  let data: TreatmentFormData;

  if (isNew) {
    data = {
      id: null,
      name: "",
      slug: "",
      categoryId: categories[0].id,
      description: "",
      imageUrl: "",
      whatsappMessage: "",
      seoTitle: "",
      seoDescription: "",
      sortOrder: 0,
      isNew: false,
      isBestSeller: false,
      isPublished: true,
      options: [],
    };
  } else {
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    if (!treatment) notFound();

    data = {
      id: treatment.id,
      name: treatment.name,
      slug: treatment.slug,
      categoryId: treatment.categoryId,
      description: treatment.description ?? "",
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
    };
  }

  return <TreatmentForm treatment={data} categories={categories} />;
}
