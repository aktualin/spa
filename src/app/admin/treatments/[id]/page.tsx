import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { TreatmentForm, type TreatmentFormData } from "../treatment-form";

export const instant = false;

export default async function EditTreatmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  await requireRole(["ADMIN", "EDITOR"]);

  const [{ id }, { kind }] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const wantAddon = kind === "addon";

  const categories = await prisma.treatmentCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, kind: true },
  });

  const defaultCategory = categories.find((c) => c.kind === (wantAddon ? "ADDON" : "TREATMENT"));

  if (isNew && !defaultCategory) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 text-sm text-neutral-600">
        <p>
          Belum ada kategori berjenis {wantAddon ? "Add-on" : "Treatment"}. Buat kategorinya
          terlebih dahulu.
        </p>
        <Link
          href="/admin/treatments/categories/new"
          className="inline-block rounded-md bg-neutral-900 px-4 py-2 font-medium text-white"
        >
          Tambah kategori
        </Link>
      </div>
    );
  }

  let data: TreatmentFormData;

  if (isNew) {
    data = {
      id: null,
      name: "",
      slug: "",
      categoryId: defaultCategory!.id,
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
    };
  }

  return <TreatmentForm treatment={data} categories={categories} />;
}
