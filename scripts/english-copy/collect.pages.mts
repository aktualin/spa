/** Copy halaman: journal, corporate, branch, legal (StaticPage). */
import { journalPosts, locations } from "../../src/data/content.ts";
import { privacyPolicy, termsConditions } from "../../src/data/pages.ts";
import {
  staticCorporateContent,
  staticCorporatePrograms,
  staticCorporateSteps,
  escapeHtml,
} from "../../src/lib/domain/corporate.ts";
import { slugify } from "../../src/lib/domain/slug.ts";
import { row, type CopyRow } from "./collect.types.mts";

type PolicyPage = {
  intro: string;
  sections: { title: string; paragraphs: string[]; bullets?: string[] }[];
};

/** Render persis `policyBodyHtml` di seed.mts agar guard byte-exact. */
function policyBodyHtml(page: PolicyPage): string {
  return page.sections
    .map((section) => {
      const parts = [`<h5>${escapeHtml(section.title)}</h5>`];
      for (const paragraph of section.paragraphs) {
        parts.push(`<p>${escapeHtml(paragraph)}</p>`);
      }
      if (section.bullets?.length) {
        const items = section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");
        parts.push(`<ul>${items}</ul>`);
      }
      return parts.join("");
    })
    .join("");
}

export function journal(): CopyRow[] {
  const rows: CopyRow[] = [];
  const seen = new Set<string>();
  for (const post of journalPosts) {
    const tag = post.tag?.trim();
    if (tag && !seen.has(tag.toLowerCase())) {
      seen.add(tag.toLowerCase());
      rows.push(row("JournalCategory", { slug: slugify(tag) }, { name: tag }));
    }
  }
  for (const post of journalPosts) {
    rows.push(row("JournalPost", { slug: post.slug }, {
      title: post.title,
      excerpt: post.excerpt,
      bodyHtml: `<p>${post.excerpt}</p>`,
    }));
  }
  return rows;
}

export function corporate(): CopyRow[] {
  const c = staticCorporateContent();
  const rows: CopyRow[] = [row("CorporateContent", { id: "singleton" }, {
    heroTitle: c.heroTitle,
    intro: c.intro,
    benefits: c.benefits,
    solutions: c.solutions,
    inSpaItems: c.inSpaItems,
    picName: c.pic.name,
  })];
  staticCorporatePrograms().forEach((p, i) =>
    rows.push(row("CorporateProgram", { sortOrder: i }, {
      name: p.name, description: p.description, features: p.features,
    })),
  );
  staticCorporateSteps().forEach((s, i) =>
    rows.push(row("CorporateStep", { sortOrder: i }, { title: s.title, body: s.body })),
  );
  return rows;
}

export function branches(): CopyRow[] {
  return locations.map((loc) =>
    row("Branch", { slug: loc.slug }, {
      name: loc.name, area: loc.area, tag: loc.tag || null,
      address: loc.address, openingHours: [loc.hours],
    }),
  );
}

export function legalPages(): CopyRow[] {
  return [
    row("StaticPage", { slug: "privacy-policy" }, {
      title: "Privacy Policy",
      bodyHtml: policyBodyHtml(privacyPolicy),
      seoDescription: privacyPolicy.intro,
    }),
    row("StaticPage", { slug: "terms-conditions" }, {
      title: "Terms & Conditions",
      bodyHtml: policyBodyHtml(termsConditions),
      seoDescription: termsConditions.intro,
    }),
  ];
}
