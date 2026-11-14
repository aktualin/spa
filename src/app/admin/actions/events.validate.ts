import { eventDatesError, eventSlugError, normalizePartnerUrl } from "@/lib/domain/events";
import { richTextInput } from "@/lib/domain/rich-text";

import type { EventFormData } from "../events/event-form";
import { checked, firstIssue, parseWibInput, text } from "../promos/_kit/schema";
import { eventSchema, type EventData } from "./events.helpers";

/** Baca seluruh isian form event apa adanya (belum divalidasi). */
export function readFormValues(formData: FormData): EventFormData {
  const id = String(formData.get("id") ?? "");
  return {
    id: id || null,
    slug: text(formData, "slug")?.trim() ?? "",
    title: text(formData, "title") ?? "",
    description: richTextInput(formData.get("description")),
    coverUrl: text(formData, "coverUrl") ?? "",
    location: text(formData, "location") ?? "",
    startDate: text(formData, "startDate") ?? "",
    endDate: text(formData, "endDate") ?? "",
    isCollaboration: checked(formData, "isCollaboration"),
    partnerName: text(formData, "partnerName") ?? "",
    partnerLogoUrl: text(formData, "partnerLogoUrl") ?? "",
    partnerUrl: text(formData, "partnerUrl") ?? "",
    isPublished: checked(formData, "isPublished"),
    sortOrder: Number(text(formData, "sortOrder") ?? 0) || 0,
    seoTitle: text(formData, "seoTitle") ?? "",
    seoDescription: text(formData, "seoDescription") ?? "",
  };
}

/** Validasi isian form event; menghasilkan data siap tulis atau pesan galat. */
export function validateEventValues(
  values: EventFormData,
  formData: FormData,
): { ok: true; data: EventData } | { ok: false; error: string } {
  const slugError = eventSlugError(values.slug);
  if (slugError) return { ok: false, error: slugError };

  const startDate = parseWibInput(values.startDate);
  const endDate = parseWibInput(values.endDate, { endOfDay: true });
  if (startDate === undefined) return { ok: false, error: "Tanggal mulai tidak valid." };
  if (endDate === undefined) return { ok: false, error: "Tanggal selesai tidak valid." };
  const datesError = eventDatesError(startDate, endDate);
  if (datesError) return { ok: false, error: datesError };

  const partnerUrl = normalizePartnerUrl(values.partnerUrl);
  if (partnerUrl === undefined) {
    return { ok: false, error: "Tautan mitra tidak valid. Contoh: https://namabrand.com" };
  }

  const parsed = eventSchema.safeParse({
    title: values.title,
    description: values.description,
    coverUrl: values.coverUrl,
    location: values.location,
    partnerName: values.partnerName,
    partnerLogoUrl: values.partnerLogoUrl,
    isCollaboration: values.isCollaboration,
    isPublished: values.isPublished,
    sortOrder: text(formData, "sortOrder") ?? 0,
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  return {
    ok: true,
    data: { ...parsed.data, slug: values.slug, startDate, endDate, partnerUrl },
  };
}