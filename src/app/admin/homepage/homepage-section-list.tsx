"use client";

import { useActionState } from "react";

import {
  createHomepageSectionAction,
  saveHomepageSectionAction,
  toggleHomepageSectionAction,
  moveHomepageSectionAction,
  type ActionState,
} from "../actions/homepage";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";
import { sectionKeyLabel } from "./homepage-sections";

export type HomepageSectionRow = {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  imageUrl: string;
  isEnabled: boolean;
  sortOrder: number;
};

const initialState: ActionState = { error: null };

export function HomepageSectionList({
  sections,
  missing,
}: {
  sections: HomepageSectionRow[];
  missing: string[];
}) {
  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <HomepageSectionCard
          key={section.id}
          section={section}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
        />
      ))}

      {missing.length > 0 ? (
        <section className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <h2 className="text-sm font-semibold text-neutral-800">
            Tambahkan section
          </h2>
          <p className="mt-1 text-xs text-neutral-600">
            Section baru dibuat dalam keadaan <strong>mati</strong> (tidak
            tampil di homepage) sampai admin menyalakannya.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {missing.map((key) => (
              <li key={key}>
                <form action={createHomepageSectionAction}>
                  <input type="hidden" name="key" value={key} />
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
                  >
                    Tambahkan {sectionKeyLabel(key)}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function HomepageSectionCard({
  section,
  isFirst,
  isLast,
}: {
  section: HomepageSectionRow;
  isFirst: boolean;
  isLast: boolean;
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
          </h2>
          <p className="text-xs text-neutral-500">
            key: {section.key} · urutan {section.sortOrder}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={section.id} />

        <Field label="Judul" htmlFor={`title-${section.id}`}>
          <input
            id={`title-${section.id}`}
            name="title"
            defaultValue={section.title}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Subjudul" htmlFor={`subtitle-${section.id}`}>
          <input
            id={`subtitle-${section.id}`}
            name="subtitle"
            defaultValue={section.subtitle}
            className={inputClass}
          />
        </Field>

        <RichTextField
          name="bodyHtml"
          label="Isi"
          defaultValue={section.bodyHtml}
          folder="homepage"
        />

        <ImageField
          name="imageUrl"
          label="Gambar"
          folder="homepage"
          defaultValue={section.imageUrl}
        />

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
          <SaveButton label="Simpan section" />
        </div>
      </form>
    </section>
  );
}
