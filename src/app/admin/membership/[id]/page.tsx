import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { MembershipTierForm, type TierFormData } from "../membership-tier-form";

export const instant = false;

export default async function MembershipTierEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  const isNew = id === "new";

  let data: TierFormData;

  if (isNew) {
    data = {
      id: null,
      slug: "",
      name: "",
      priceLabel: "",
      billingNote: "",
      summary: "",
      benefits: [],
      terms: "",
      isPublished: true,
      sortOrder: 0,
    };
  } else {
    const tier = await prisma.membershipTier.findUnique({ where: { id } });
    if (!tier) notFound();

    data = {
      id: tier.id,
      slug: tier.slug,
      name: tier.name,
      priceLabel: tier.priceLabel,
      billingNote: tier.billingNote ?? "",
      summary: tier.summary ?? "",
      benefits: tier.benefits,
      terms: tier.terms ?? "",
      isPublished: tier.isPublished,
      sortOrder: tier.sortOrder,
    };
  }

  return <MembershipTierForm tier={data} />;
}
