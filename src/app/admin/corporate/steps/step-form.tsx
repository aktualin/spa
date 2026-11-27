"use client";

import Link from "next/link";
import { useActionState } from "react";

import { deleteStepAction, saveStepAction, type ActionState } from "../../actions/corporate-items";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";

export type StepFormData = { id: string | null; title: string; body: string };

const initialState: ActionState = { error: null };

export function CorporateStepForm({ step }: { step: StepFormData }) {
  const [state, formAction] = useActionState(saveStepAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/corporate#langkah" className="text-sm text-neutral-600 hover:underline">
        ← Back to Corporate Wellness
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {step.id ? "Edit collaboration step" : "Add collaboration step"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        The &quot;Step&quot; number and the step count in the heading (&quot;A Simple 4-Step …&quot;)
        are computed automatically from the order.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {step.id ? <input type="hidden" name="id" value={step.id} /> : null}

        <Field label="Title" htmlFor="title" hint="Example: Discovery & Consultation.">
          <input
            id="title"
            name="title"
            defaultValue={step.title}
            required
            maxLength={120}
            className={inputClass}
          />
        </Field>

        <RichTextField
          name="body"
          label="Description"
          defaultValue={step.body}
          folder="corporate"
          hint="Example: Understand your goals."
          compact
        />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/corporate#langkah" className="text-sm text-neutral-600 hover:underline">
            Cancel
          </Link>
        </div>
      </form>

      {step.id ? (
        <form action={deleteStepAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={step.id} />
          <ConfirmDeleteButton message="Delete this step?">Delete this step</ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
