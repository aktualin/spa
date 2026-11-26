/** Copy katalog: kategori, treatment, option, package, item. */
import { treatments, packages, additionalServices } from "../../src/data/content.ts";
import { buildStaticCatalogSeed } from "../../src/lib/domain/catalog-seed.ts";
import { row, type CopyRow } from "./collect.types.mts";

export function catalog(): CopyRow[] {
  const seed = buildStaticCatalogSeed({ treatments, packages, additionalServices });
  const rows: CopyRow[] = [];
  for (const c of seed.categories) {
    rows.push(row("TreatmentCategory", { slug: c.slug }, { name: c.name }));
  }
  for (const t of seed.treatments) {
    rows.push(row("Treatment", { slug: t.slug }, {
      name: t.name, tagline: t.tagline, description: t.description, note: t.note,
    }));
    t.options.forEach((o, i) =>
      rows.push(row("TreatmentOption", { treatmentSlug: t.slug, sortOrder: i }, { label: o.label })),
    );
  }
  for (const p of seed.packages) {
    rows.push(row("Package", { slug: p.slug }, {
      name: p.name, subtitle: p.subtitle, quote: p.quote,
      description: p.description, durationLabel: p.durationLabel,
    }));
    p.items.forEach((it, i) =>
      rows.push(row("PackageItem", { packageSlug: p.slug, sortOrder: i }, { label: it.name })),
    );
  }
  return rows;
}
