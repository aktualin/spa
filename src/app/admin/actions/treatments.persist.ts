import type { Prisma } from "@prisma/client";
import type { z } from "zod";

import { parseContentImageRows } from "@/lib/domain/content-image";
import { recordPathMoves, treatmentPath } from "@/lib/path-moves";
import { prisma } from "@/lib/prisma";

import { syncContentImages } from "./content-images";
import type { optionSchema } from "./treatments.schema";

type PreviousTreatment = {
  slug: string;
  isPublished: boolean;
  category: { slug: string; isPublished: boolean };
} | null;

/**
 * Tulis treatment + opsi harganya, galeri gambar tambahan, dan redirect slug
 * lama. Opsi ditulis ulang utuh — lebih sederhana dan aman daripada melacak
 * baris mana yang dihapus/ditambah di form.
 */
export async function persistTreatment(
  id: string,
  data: Prisma.TreatmentUncheckedCreateInput,
  options: z.infer<typeof optionSchema>[],
  previous: PreviousTreatment,
  categorySlug: string,
  formData: FormData,
) {
  const treatment = id
    ? await prisma.treatment.update({ where: { id }, data })
    : await prisma.treatment.create({ data });

  await prisma.treatmentOption.deleteMany({
    where: { treatmentId: treatment.id },
  });
  await prisma.treatmentOption.createMany({
    data: options.map((option, index) => ({
      ...option,
      treatmentId: treatment.id,
      sortOrder: index,
    })),
  });

  // Galeri gambar tambahan (0..N); bila lebih dari satu, /menu/[slug]
  // menampilkannya sebagai carousel.
  await syncContentImages("treatment", treatment.id, parseContentImageRows(formData));

  // URL publik lama tetap hidup (301) bila slug atau kategorinya berubah.
  const wasPublic = previous?.isPublished && previous.category.isPublished;
  const redirectsChanged =
    previous && wasPublic
      ? await recordPathMoves(
          prisma,
          [
            {
              from: treatmentPath(previous.category.slug, previous.slug),
              to: treatmentPath(categorySlug, treatment.slug),
            },
          ],
          `Treatment "${treatment.name}" pindah alamat`,
        )
      : false;

  return { treatment, redirectsChanged };
}