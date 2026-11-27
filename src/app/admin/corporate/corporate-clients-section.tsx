import {
  moveClientAction,
  type listCorporateItems,
} from "../actions/corporate-items";
import { Badge, Thumb } from "../promos/_kit/list-ui";
import { Section, SortableList } from "./corporate-hub-cards";
import { Row } from "./corporate-hub-row";

type Items = Awaited<ReturnType<typeof listCorporateItems>>;

/** Daftar klien & foto dokumentasi. */
export function ClientsSection({ clients }: { clients: Items["clients"] }) {
  return (
    <Section
      id="klien"
      title="Clients & documentation"
      description='Client logos and event photos in the "Past Collaborations" section.'
      addHref="/admin/corporate/clients/new"
      addLabel="Add client"
    >
      {clients.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
          No clients yet — the public page shows 3 default collaboration photos. Once the first
          client is added, this section uses client logos & documentation photos.
        </p>
      ) : (
        <SortableList>
          {clients.map((client, index) => (
            <Row
              key={client.id}
              id={client.id}
              index={index}
              count={clients.length}
              moveAction={moveClientAction}
              href={`/admin/corporate/clients/${client.id}`}
              thumb={<Thumb src={client.logoUrl} alt="" />}
              title={client.name}
              badge={client.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="muted">Draft</Badge>}
              meta={[`${client.photoUrls.length} photos`, client.websiteUrl].filter(Boolean).join(" · ")}
            />
          ))}
        </SortableList>
      )}
    </Section>
  );
}