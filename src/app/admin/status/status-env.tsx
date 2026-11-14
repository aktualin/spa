import { Badge } from "../promos/_kit/list-ui";
import { Section, type EnvGroups } from "./status-parts";

/** Konfigurasi environment: hanya terisi/kosong, nilai tidak ditampilkan. */
export function EnvSection({ envGroups }: { envGroups: EnvGroups }) {
  return (
    <Section
      title="Konfigurasi environment"
      description="Hanya ditampilkan terisi atau kosong — nilainya tidak pernah ditampilkan."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {envGroups.map((group) => (
          <div key={group.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{group.label}</h3>
            {group.items.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">Tidak terbaca.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
                    <span className="break-all font-mono text-xs text-neutral-800">{item.name}</span>
                    <Badge tone={item.set ? "green" : "muted"}>{item.set ? "Terisi" : "Kosong"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}