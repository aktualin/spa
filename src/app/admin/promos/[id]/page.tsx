import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { toWibDateInput } from "../_kit/schema";
import { PromoForm, type PromoFormData } from "../promo-form";

export const instant = false;

export default async function PromoEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  const isNew = id === "new";

  let data: PromoFormData;

  if (isNew) {
    data = {
      id: null,
      slug: "",
      title: "",
      description: "",
      bannerUrl: "",
      terms: "",
      startDate: "",
      endDate: "",
      isPublished: true,
      sortOrder: 0,
      seoTitle: "",
      seoDescription: "",
      whatsappMessage: "",
    };
  } else {
    const promo = await prisma.promo.findUnique({ where: { id } });
    if (!promo) notFound();

    data = {
      id: promo.id,
      slug: promo.slug,
      title: promo.title,
      description: promo.description ?? "",
      bannerUrl: promo.bannerUrl ?? "",
      terms: promo.terms ?? "",
      startDate: toWibDateInput(promo.startDate),
      endDate: toWibDateInput(promo.endDate),
      isPublished: promo.isPublished,
      sortOrder: promo.sortOrder,
      seoTitle: promo.seoTitle ?? "",
      seoDescription: promo.seoDescription ?? "",
      whatsappMessage: promo.whatsappMessage ?? "",
    };
  }

  return <PromoForm promo={data} />;
}
