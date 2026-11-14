"use client";

import { useActionState } from "react";

import { saveHomepageSectionAction } from "../actions/homepage";
import { ErrorMessage, SaveButton } from "../settings/_components/form-ui";
import { isBannerKey, type BannerDefaults, type BannerKey } from "@/lib/domain/homepage-banner";
import { BannerFields } from "./homepage-banner-fields";
import { SectionCardActions } from "./homepage-section-actions";
import { GenericSectionForm } from "./homepage-section-forms";
import { initialState, type HomepageSectionRow } from "./homepage-section-shared";
import { SectionSourceNote } from "./homepage-section-source-note";
import {
  SECTION_SOURCE,
  hasEditableCta,
  hasEditableText,
  isCustomSectionKey,
  sectionKeyLabel,
} from "./homepage-sections";

export function HomepageSectionCard({
  section,
  bannerDefaults,
  isFirst,
  isLast,
  fixedPosition = false,
}: {
  section: HomepageSectionRow;
  bannerDefaults: Record<BannerKey, BannerDefaults>;
  isFirst: boolean;
  isLast: boolean;
  /** Section berposisi tetap (footer): tanpa tombol urutan. */
  fixedPosition?: boolean;
}) {
  const [state, formAction] = useActionState(
    saveHomepageSectionAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            {sectionKeyLabel(section.key)}
            {isCustomSectionKey(section.key) ? `: ${section.title}` : null}
          </h2>
          <p className="text-xs text-neutral-500">
            key: {section.key} ·{" "}
            {fixedPosition ? "selalu paling bawah" : `urutan ${section.sortOrder}`}
          </p>
        </div>

        <SectionCardActions
          section={section}
          isFirst={isFirst}
          isLast={isLast}
          fixedPosition={fixedPosition}
        />
      </div>

      {isBannerKey(section.key) ? (
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={section.id} />

          <BannerFields
            section={section}
            bannerKey={section.key}
            defaults={bannerDefaults[section.key]}
          />

          <ErrorMessage error={state.error} />

          <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
            <SaveButton label="Simpan section" />
          </div>
        </form>
      ) : (
        <>
          {SECTION_SOURCE[section.key] ? (
            <SectionSourceNote source={SECTION_SOURCE[section.key]} />
          ) : null}
          {!SECTION_SOURCE[section.key] || hasEditableText(section.key) ? (
            <GenericSectionForm
              section={section}
              withCta={hasEditableCta(section.key) || isCustomSectionKey(section.key)}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

