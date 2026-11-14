"use client";

import { isFixedPositionSection } from "@/lib/domain/homepage";
import type { BannerDefaults, BannerKey } from "@/lib/domain/homepage-banner";

import { AddCustomSection, AddMissingSections } from "./homepage-section-add";
import { HomepageSectionCard } from "./homepage-section-card";
import type { HomepageSectionRow } from "./homepage-section-shared";

export type { HomepageSectionRow } from "./homepage-section-shared";

export function HomepageSectionList({
  sections,
  missing,
  bannerDefaults,
}: {
  sections: HomepageSectionRow[];
  missing: string[];
  bannerDefaults: Record<BannerKey, BannerDefaults>;
}) {
  // Footer tidak ikut diurutkan — selalu ditampilkan paling bawah.
  const ordered = sections.filter((section) => !isFixedPositionSection(section.key));
  const fixed = sections.filter((section) => isFixedPositionSection(section.key));

  return (
    <div className="space-y-6">
      {ordered.map((section, index) => (
        <HomepageSectionCard
          key={section.id}
          section={section}
          bannerDefaults={bannerDefaults}
          isFirst={index === 0}
          isLast={index === ordered.length - 1}
        />
      ))}

      {fixed.map((section) => (
        <HomepageSectionCard
          key={section.id}
          section={section}
          bannerDefaults={bannerDefaults}
          isFirst
          isLast
          fixedPosition
        />
      ))}

      <AddMissingSections missing={missing} />
      <AddCustomSection />
    </div>
  );
}