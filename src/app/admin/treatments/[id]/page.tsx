import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { TreatmentForm } from "../treatment-form";
import { loadTreatmentFormData } from "../treatment-page-data";

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

  const data = await loadTreatmentFormData(id, defaultCategory?.id ?? null);

  return <TreatmentForm treatment={data} categories={categories} />;
}