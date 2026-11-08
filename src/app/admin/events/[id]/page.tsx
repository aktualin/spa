import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { toWibDateInput } from "../../promos/_kit/schema";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { EventForm, type EventFormData } from "../event-form";
import { EventPhotoManager } from "../event-photo-manager";

export const instant = false;

export default async function EventEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const isNew = id === "new";

  let data: EventFormData;

  if (isNew) {
    data = {
      id: null,
      slug: "",
      title: "",
      description: "",
      coverUrl: "",
      location: "",
      startDate: "",
      endDate: "",
      isCollaboration: false,
      isPublished: true,
      sortOrder: 0,
      seoTitle: "",
      seoDescription: "",
    };
  } else {
    const event = await prisma.eventItem.findUnique({
      where: { id },
      include: { photos: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    });
    if (!event) notFound();

    data = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description ?? "",
      coverUrl: event.coverUrl ?? "",
      location: event.location ?? "",
      startDate: toWibDateInput(event.startDate),
      endDate: toWibDateInput(event.endDate),
      isCollaboration: event.isCollaboration,
      isPublished: event.isPublished,
      sortOrder: event.sortOrder,
      seoTitle: event.seoTitle ?? "",
      seoDescription: event.seoDescription ?? "",
    };

    return (
      <div className="mx-auto max-w-2xl space-y-10">
        <StatusBanners
          saved={query.saved}
          deleted={query.deleted}
          deletedLabel="Foto event dihapus."
        />

        <EventForm event={data} />

        <section className="border-t border-neutral-200 pt-8">
          <EventPhotoManager
            eventId={event.id}
            photos={event.photos.map((photo) => ({
              id: photo.id,
              imageUrl: photo.imageUrl,
              caption: photo.caption ?? "",
              sortOrder: photo.sortOrder,
            }))}
          />
        </section>
      </div>
    );
  }

  return <EventForm event={data} />;
}
