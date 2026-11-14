import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { toWibDateInput } from "../promos/_kit/schema";
import type { EventFormData } from "./event-form";

/** Data form event baru (kosong). */
export function newEventData(): EventFormData {
  return {
    id: null,
    slug: "",
    title: "",
    description: "",
    coverUrl: "",
    location: "",
    startDate: "",
    endDate: "",
    isCollaboration: false,
    partnerName: "",
    partnerLogoUrl: "",
    partnerUrl: "",
    isPublished: true,
    sortOrder: 0,
    seoTitle: "",
    seoDescription: "",
  };
}

/** Data form event yang sudah ada, dari database. */
export async function loadEventFormData(id: string) {
  const event = await prisma.eventItem.findUnique({
    where: { id },
    include: { photos: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  if (!event) notFound();

  const data: EventFormData = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description ?? "",
    coverUrl: event.coverUrl ?? "",
    location: event.location ?? "",
    startDate: toWibDateInput(event.startDate),
    endDate: toWibDateInput(event.endDate),
    isCollaboration: event.isCollaboration,
    partnerName: event.partnerName ?? "",
    partnerLogoUrl: event.partnerLogoUrl ?? "",
    partnerUrl: event.partnerUrl ?? "",
    isPublished: event.isPublished,
    sortOrder: event.sortOrder,
    seoTitle: event.seoTitle ?? "",
    seoDescription: event.seoDescription ?? "",
  };

  return { event, data };
}