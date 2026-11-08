import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getRetailProduct } from "../../actions/retail";
import { RetailForm, type RetailFormData } from "../retail-form";

export const instant = false;

export default async function EditRetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;
  let data: RetailFormData;

  if (id === "new") {
    data = {
      id: null,
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      priceIdr: "",
      whatsappMessage: "",
      sortOrder: 0,
      isHighlight: false,
      isPublished: true,
    };
  } else {
    const product = await getRetailProduct(id);
    if (!product) notFound();
    data = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
      priceIdr: product.priceIdr === null ? "" : String(product.priceIdr),
      whatsappMessage: product.whatsappMessage ?? "",
      sortOrder: product.sortOrder,
      isHighlight: product.isHighlight,
      isPublished: product.isPublished,
    };
  }

  return <RetailForm product={data} />;
}
