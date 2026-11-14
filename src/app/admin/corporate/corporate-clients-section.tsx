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
      title="Klien & dokumentasi"
      description='Logo klien dan foto kegiatan di bagian "Past Collaborations".'
      addHref="/admin/corporate/clients/new"
      addLabel="Tambah klien"
    >
      {clients.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
          Belum ada klien — halaman publik menampilkan 3 foto kolaborasi bawaan. Setelah klien
          pertama ditambahkan, bagian ini memakai logo & foto dokumentasi klien.
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
              badge={client.isPublished ? <Badge tone="green">Tayang</Badge> : <Badge tone="muted">Draf</Badge>}
              meta={[`${client.photoUrls.length} foto`, client.websiteUrl].filter(Boolean).join(" · ")}
            />
          ))}
        </SortableList>
      )}
    </Section>
  );
}