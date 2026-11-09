import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getHeroSlide } from "../../../actions/hero-slides";
import { HeroSlideForm, type HeroSlideFormData } from "../hero-slide-form";

export const instant = false;

export default async function HeroSlideEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { id } = await params;

  let data: HeroSlideFormData;

  if (id === "new") {
    data = {
      id: null,
      mediaType: "IMAGE",
      imageUrl: "",
      mobileImageUrl: "",
      videoUrl: "",
      imageAlt: "",
      isPublished: true,
    };
  } else {
    const slide = await getHeroSlide(id);
    if (!slide) notFound();

    data = {
      id: slide.id,
      mediaType: slide.mediaType,
      imageUrl: slide.imageUrl ?? "",
      mobileImageUrl: slide.mobileImageUrl ?? "",
      videoUrl: slide.videoUrl ?? "",
      imageAlt: slide.imageAlt ?? "",
      isPublished: slide.isPublished,
    };
  }

  return <HeroSlideForm slide={data} />;
}
