"use client";

import Link from "next/link";
import { useActionState } from "react";

import { HIGHLIGHT_LIMITS } from "@/lib/domain/homepage";

import {
  deleteHomepageHighlightAction,
  saveHomepageHighlightAction,
} from "../../actions/homepage-highlights";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";
import { HighlightLinkFields, HighlightPeriodFields } from "./highlight-form-link";
import { HighlightImageFields } from "./highlight-form-media";
import { LIST_PATH, initialState, type HighlightFormData } from "./highlight-form.types";

export type { HighlightFormData } from "./highlight-form.types";

export function HighlightForm({ highlight }: { highlight: HighlightFormData }) {
  const [state, formAction] = useActionState(
    saveHomepageHighlightAction,
    initialState,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
        ← Back to the highlight list
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {highlight.id ? "Edit highlight" : "Add highlight"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Shown as a card in the homepage’s “What’s New” section: image, category
        label, title, and a link with optional button text.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {highlight.id ? <input type="hidden" name="id" value={highlight.id} /> : null}

        <Field label="Title" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={highlight.title}
            required
            maxLength={HIGHLIGHT_LIMITS.title}
            className={inputClass}
          />
        </Field>

        <Field
          label="Category label (optional)"
          htmlFor="eyebrow"
          hint="Small text above the title, e.g. Massage, Promo, Event. Shown before “KAMA Journal”."
        >
          <input
            id="eyebrow"
            name="eyebrow"
            defaultValue={highlight.eyebrow}
            maxLength={HIGHLIGHT_LIMITS.eyebrow}
            className={inputClass}
          />
        </Field>

        <HighlightImageFields highlight={highlight} />
        <HighlightLinkFields highlight={highlight} />
        <HighlightPeriodFields highlight={highlight} />

        <Checkbox name="isPublished" defaultChecked={highlight.isPublished}>
          Publish on the homepage
        </Checkbox>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
            Cancel
          </Link>
        </div>
      </form>

      {highlight.id ? (
        <form
          action={deleteHomepageHighlightAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={highlight.id} />
          <ConfirmDeleteButton message="Delete this highlight? Images recorded in the Media Library are kept.">
            Delete this highlight
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}