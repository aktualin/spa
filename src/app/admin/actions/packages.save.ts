"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { parseContentImageRows } from "@/lib/domain/content-image";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/storage";

import { firstIssue } from "../promos/_kit/schema";
import { syncContentImages } from "./content-images";
import { parseItems, parsePackagePrice, readForm, revalidatePackages, type ActionState } from "./packages.helpers";
import { persistPackage } from "./packages.persist";
import { packageSchema } from "./packages.schema";

export async function savePackageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = String(formData.get("id") ?? "");
  const parsed = packageSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { priceIdr: rawPrice, durationMin: rawDuration, imageUrl, ...rest } =
    parsed.data;

  const price = parsePackagePrice(rawPrice, rawDuration);
  if ("error" in price) return { error: price.error };
  const { priceIdr, durationMin } = price;

  const items = parseItems(formData);

  // Treatment yang dipilih harus benar-benar ada (mencegah id palsu dari client).
  const treatmentIds = [
    ...new Set(items.flatMap((item) => (item.treatmentId ? [item.treatmentId] : []))),
  ];
  if (treatmentIds.length > 0) {
    const found = await prisma.treatment.count({
      where: { id: { in: treatmentIds } },
    });
    if (found !== treatmentIds.length) {
      return { error: "Ada treatment yang dipilih sudah tidak tersedia." };
    }
  }

  const data = {
    ...rest,
    priceIdr,
    durationMin,
    imageUrl: imageUrl ? imageUrl : null,
  };

  // Slug dipakai di URL publik, jadi harus unik lintas package.
  const clash = await prisma.package.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) {
    return { error: `Slug "${data.slug}" sudah dipakai package lain.` };
  }

  let previousSlug: string | undefined;
  let wasPublished = false;
  if (id) {
    const previous = await prisma.package.findUnique({
      where: { id },
      select: { imageUrl: true, slug: true, isPublished: true },
    });
    if (!previous) return { error: "Package tidak ditemukan." };
    previousSlug = previous.slug;
    wasPublished = previous.isPublished;
    // Gambar lama yang diganti/dihapus ikut dibuang dari bucket.
    if (previous.imageUrl && previous.imageUrl !== data.imageUrl) {
      await deleteImageByUrl(previous.imageUrl).catch(() => {});
    }
  }

  const { pkg, redirectsChanged } = await persistPackage(id, data, items, wasPublished, previousSlug);

  // Galeri gambar tambahan (0..N); bila lebih dari satu, halaman detail
  // menampilkannya sebagai carousel.
  await syncContentImages("package", pkg.id, parseContentImageRows(formData));

  revalidatePackages(pkg.slug, redirectsChanged);
  if (previousSlug && previousSlug !== pkg.slug) {
    revalidatePath(`/treatments/packages/${previousSlug}`);
  }

  redirect("/admin/treatments/packages?saved=1");
}