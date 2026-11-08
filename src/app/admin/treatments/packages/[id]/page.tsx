import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { PackageForm, type PackageFormData } from "../package-form";

export const instant = false;

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "EDITOR"]);

  const { id } = await params;
  const isNew = id === "new";

  const treatments = await prisma.treatment.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: { select: { name: true } } },
  });

  let data: PackageFormData;

  if (isNew) {
    data = {
      id: null,
      name: "",
      slug: "",
      subtitle: "",
      quote: "",
      description: "",
      imageUrl: "",
      priceIdr: "",
      durationMin: "",
      durationLabel: "",
      sortOrder: 0,
      isNew: false,
      isBestSeller: false,
      isPublished: true,
      seoTitle: "",
      seoDescription: "",
      whatsappMessage: "",
      items: [],
    };
  } else {
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    if (!pkg) notFound();

    data = {
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      subtitle: pkg.subtitle ?? "",
      quote: pkg.quote ?? "",
      description: pkg.description ?? "",
      imageUrl: pkg.imageUrl ?? "",
      priceIdr: String(pkg.priceIdr),
      durationMin: pkg.durationMin ? String(pkg.durationMin) : "",
      durationLabel: pkg.durationLabel ?? "",
      sortOrder: pkg.sortOrder,
      isNew: pkg.isNew,
      isBestSeller: pkg.isBestSeller,
      isPublished: pkg.isPublished,
      seoTitle: pkg.seoTitle ?? "",
      seoDescription: pkg.seoDescription ?? "",
      whatsappMessage: pkg.whatsappMessage ?? "",
      items: pkg.items.map((item) => ({
        treatmentId: item.treatmentId ?? "",
        label: item.label ?? "",
        minutes: item.minutes ? String(item.minutes) : "",
      })),
    };
  }

  return (
    <PackageForm
      pkg={data}
      treatments={treatments.map((treatment) => ({
        id: treatment.id,
        name: treatment.name,
        categoryName: treatment.category.name,
      }))}
    />
  );
}
