import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { StatusBanners } from "../../promos/_kit/list-ui";
import { EventForm } from "../event-form";
import { EventPhotoManager } from "../event-photo-manager";
import { loadEventFormData, newEventData } from "../event-page-data";

export const instant = false;

export default async function EventEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; photoDeleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ id }, query] = await Promise.all([params, searchParams]);

  if (id === "new") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <EventForm event={newEventData()} />
        <p className="text-xs text-neutral-500">
          Foto galeri event bisa ditambahkan setelah event pertama kali disimpan.
        </p>
      </div>
    );
  }

  const { event, data } = await loadEventFormData(id);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {query.created ? (
        <p
          role="status"
          className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Event tersimpan. Tambahkan foto galeri di bagian bawah halaman ini.
        </p>
      ) : null}
      <StatusBanners
        saved={query.saved}
        deleted={query.photoDeleted}
        deletedLabel="Foto event dihapus."
      />

      <EventForm event={data} publishedSlug={event.isPublished ? event.slug : null} />

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