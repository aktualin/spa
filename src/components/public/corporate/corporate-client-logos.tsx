import type { CorporateClientItem } from "@/lib/domain/corporate";

/**
 * Deretan logo klien corporate di bagian "Past Collaborations".
 * Klien tanpa logo tampil sebagai nama. Tautan website membuka tab baru.
 */
export function CorporateClientLogos({ clients }: { clients: CorporateClientItem[] }) {
  if (clients.length === 0) return null;

  return (
    <ul className="mb-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
      {clients.map((client) => {
        const mark = client.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={client.logoUrl}
            alt={client.name}
            loading="lazy"
            className="h-12 w-auto max-w-[10rem] object-contain md:h-14"
          />
        ) : (
          <span className="eyebrow-s text-style-allcaps">{client.name}</span>
        );

        return (
          <li key={client.id} className="flex min-w-0 items-center">
            {client.websiteUrl ? (
              <a
                href={client.websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={client.name}
                className="flex items-center"
              >
                {mark}
              </a>
            ) : (
              mark
            )}
          </li>
        );
      })}
    </ul>
  );
}
