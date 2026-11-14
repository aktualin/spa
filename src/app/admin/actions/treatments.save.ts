"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { firstIssue } from "../promos/_kit/schema";
import { CONTENT_ROLES, readForm, revalidateCatalog, type ActionState } from "./treatments.helpers";
import { persistTreatment } from "./treatments.persist";
import { treatmentSchema } from "./treatments.schema";

export async function saveTreatmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = treatmentSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { options, imageUrl, seoTitle, seoDescription, tagline, note, addonSection, ...rest } =
    parsed.data;

  const category = await prisma.treatmentCategory.findUnique({
    where: { id: rest.categoryId },
    select: { slug: true, kind: true, isPublished: true },
  });
  if (!category) return { error: "Kategori tidak ditemukan." };
  if (category.kind === "ADDON" && !addonSection) {
    return { error: "Pilih letak add-on di halaman Menu (Body, Face, Head & Scalp, atau Bath)." };
  }

  // Field opsional yang dikosongkan admin disimpan sebagai NULL, bukan "".
  const data = {
    ...rest,
    imageUrl: imageUrl ? imageUrl : null,
    seoTitle: seoTitle ? seoTitle : null,
    seoDescription: seoDescription ? seoDescription : null,
    tagline: tagline ? tagline : null,
    note: note ? note : null,
    // Letak di /menu hanya berarti untuk add-on.
    addonSection: category.kind === "ADDON" ? (addonSection ?? null) : null,
  };

  // Slug dipakai di URL publik, jadi harus unik lintas treatment.
  const clash = await prisma.treatment.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai treatment lain.` };
  }

  // Gambar lama yang diganti/dihapus ikut dibuang dari bucket supaya tidak
  // menumpuk file yatim. Kegagalan hapus tidak boleh menggagalkan simpan.
  const previous = id
    ? await prisma.treatment.findUnique({
        where: { id },
        select: {
          imageUrl: true,
          slug: true,
          isPublished: true,
          category: { select: { slug: true, isPublished: true } },
        },
      })
    : null;
  if (previous?.imageUrl && previous.imageUrl !== data.imageUrl) {
    await deleteImageByUrl(previous.imageUrl).catch(() => {});
  }

  const { treatment, redirectsChanged } = await persistTreatment(
    id,
    data,
    options,
    previous,
    category.slug,
    formData,
  );

  revalidateCatalog(redirectsChanged);
  revalidatePath(`/menu/${treatment.slug}`);

  redirect(
    category.kind === "ADDON" ? "/admin/treatments/addons?saved=1" : "/admin/treatments?saved=1",
  );
}