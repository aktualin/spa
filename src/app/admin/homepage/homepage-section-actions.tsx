"use client";

import {
  deleteCustomSectionAction,
  moveHomepageSectionAction,
  toggleHomepageSectionAction,
} from "../actions/homepage";
import { isCustomSectionKey } from "./homepage-sections";
import type { HomepageSectionRow } from "./homepage-section-shared";

/** Tombol hapus (khusus custom), aktif/mati, dan urutan sebuah section. */
export function SectionCardActions({
  section,
  isFirst,
  isLast,
  fixedPosition,
}: {
  section: HomepageSectionRow;
  isFirst: boolean;
  isLast: boolean;
  fixedPosition: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {isCustomSectionKey(section.key) ? (
        <form
          action={deleteCustomSectionAction}
          onSubmit={(event) => {
            if (!window.confirm(`Hapus section "${section.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={section.id} />
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
          >
            Hapus
          </button>
        </form>
      ) : null}
      <form action={toggleHomepageSectionAction}>
        <input type="hidden" name="id" value={section.id} />
        {/* Nilai yang dikirim adalah status yang DIINGINKAN setelah
            tombol ditekan, yaitu kebalikan status sekarang. Mengirim
            status saat ini membuat tombolnya tidak pernah mengubah apa
            pun. */}
        <input
          type="hidden"
          name="isEnabled"
          value={section.isEnabled ? "0" : "1"}
        />
        <button
          type="submit"
          title={
            section.isEnabled
              ? "Klik untuk mematikan section ini"
              : "Klik untuk menyalakan section ini"
          }
          className={
            section.isEnabled
              ? "rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              : "rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
          }
        >
          {section.isEnabled ? "Aktif" : "Mati"}
        </button>
      </form>

      {fixedPosition ? null : (
        <>
          <form action={moveHomepageSectionAction}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={isFirst}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              ↑
            </button>
          </form>

          <form action={moveHomepageSectionAction}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={isLast}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              ↓
            </button>
          </form>
        </>
      )}
    </div>
  );
}