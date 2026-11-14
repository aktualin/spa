"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { asset } from "@/lib/asset-url";

import {
  INSTAGRAM_PATH,
  ORDER,
  moveHomepageRow,
  revalidateAll,
  toggleHomepageRow,
} from "./homepage-content.helpers";

/**
 * Foto grid bawaan feed Instagram. Salinan dari `galleryImages` di
 * `src/components/home/socials.tsx` (file itu tidak mengekspornya).
 */
const DEFAULT_INSTAGRAM_IMAGES = [
  asset("img/kama/01-incense.jpg"),
  asset("img/kama/02-bottle-shadows.jpg"),
  asset("img/kama/03-oil-bowl.jpg"),
  asset("img/kama/04-turmeric-scrub.jpg"),
  asset("img/kama/05-foot-bath.jpg"),
  asset("img/kama/06-bride.jpg"),
  asset("img/kama/07-flower-bowl.jpg"),
  asset("img/kama/08-water-drop.jpg"),
  asset("img/kama/09-leaf-drop.jpg"),
  asset("img/kama/corporate/02-massage.jpg"),
  asset("img/kama/corporate/05-lounge.jpg"),
  asset("img/kama/corporate/12-guest-lounge.jpg"),
];

export async function moveInstagramPostAction(formData: FormData) {
  await moveHomepageRow(
    formData,
    INSTAGRAM_PATH,
    () => prisma.instagramPost.findMany({ orderBy: ORDER, select: { id: true } }),
    (next) =>
      prisma.$transaction(
        next.map((rowId, index) =>
          prisma.instagramPost.update({ where: { id: rowId }, data: { sortOrder: index } }),
        ),
      ),
  );
}

export async function toggleInstagramPostAction(formData: FormData) {
  await toggleHomepageRow(formData, INSTAGRAM_PATH, (id, isPublished) =>
    prisma.instagramPost.updateMany({ where: { id }, data: { isPublished } }),
  );
}

/** Salin 12 foto grid bawaan; hanya bila tabel masih kosong. */
export async function importDefaultInstagramAction() {
  await requireRole(CONTENT_ROLES);
  if ((await prisma.instagramPost.count()) > 0) redirect(INSTAGRAM_PATH);
  await prisma.instagramPost.createMany({
    data: DEFAULT_INSTAGRAM_IMAGES.map((imageUrl, index) => ({
      imageUrl,
      isPublished: true,
      sortOrder: index,
    })),
  });
  revalidateAll(INSTAGRAM_PATH);
  redirect(`${INSTAGRAM_PATH}?saved=1`);
}