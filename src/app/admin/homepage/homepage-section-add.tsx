"use client";

import {
  createCustomSectionAction,
  createHomepageSectionAction,
} from "../actions/homepage";
import { inputClass } from "../settings/_components/form-ui";
import { isDefaultVisibleSection } from "@/lib/domain/homepage";
import { sectionKeyLabel } from "./homepage-sections";

/** Tombol-tombol section bawaan yang belum punya baris di DB. */
export function AddMissingSections({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;
  return (
    <section className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <h2 className="text-sm font-semibold text-neutral-800">
        Add sections
      </h2>
      <p className="mt-1 text-xs text-neutral-600">
        The initial status follows the current homepage: default sections that
        are already shown (e.g. Footer) are created <strong>active</strong>; new
        sections are created <strong>inactive</strong> until an admin enables
        them. So the homepage does not change when this button is pressed.
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
                Add {sectionKeyLabel(key)}
                {isDefaultVisibleSection(key) ? " (active)" : " (inactive)"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Form pembuat section konten bebas (key `custom-<slug>`). */
export function AddCustomSection() {
  return (
    <section className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <h2 className="text-sm font-semibold text-neutral-800">Add content section</h2>
      <p className="mt-1 text-xs text-neutral-600">
        A free-form section with a title, subtitle, formatted content (HTML), image, and button.
        Created in an <strong>inactive</strong> state — fill it in first, then enable it and set
        its order. Content sections can be deleted at any time.
      </p>
      <form action={createCustomSectionAction} className="mt-3 flex flex-wrap gap-2">
        <label htmlFor="custom-section-name" className="sr-only">
          Section name
        </label>
        <input
          id="custom-section-name"
          name="name"
          required
          maxLength={120}
          placeholder="e.g. Rainy Season Ritual"
          className={`${inputClass} max-w-xs`}
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Add section
        </button>
      </form>
    </section>
  );
}