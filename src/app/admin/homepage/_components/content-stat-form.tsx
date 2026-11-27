"use client";

import { useActionState } from "react";

import { STAT_LIMITS } from "@/lib/domain/homepage";

import {
  deleteHomepageStatAction,
  saveHomepageStatAction,
} from "../../actions/homepage-content";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import { Shell, initialState } from "./content-form-shell";

export type StatFormData = { id: string | null; value: string; label: string; isPublished: boolean };

export function StatForm({ stat }: { stat: StatFormData }) {
  const [state, formAction] = useActionState(saveHomepageStatAction, initialState);
  return (
    <Shell
      listPath="/admin/homepage/stats"
      backLabel="Back to the stats list"
      heading={stat.id ? "Edit stat" : "Add stat"}
      intro="Shown as number boxes in the Brand Intro section (“KAMA at a glance”)."
      id={stat.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteHomepageStatAction}
      deleteMessage="Delete this stat?"
      deleteLabel="Delete this stat"
    >
      <Field label="Number / value" htmlFor="value" hint="E.g. 12 or 40+.">
        <input
          id="value"
          name="value"
          defaultValue={stat.value}
          required
          maxLength={STAT_LIMITS.value}
          className={inputClass}
        />
      </Field>
      <Field label="Label" htmlFor="label" hint="E.g. years of care. Shown below the number.">
        <input
          id="label"
          name="label"
          defaultValue={stat.label}
          required
          maxLength={STAT_LIMITS.label}
          className={inputClass}
        />
      </Field>
      <Checkbox name="isPublished" defaultChecked={stat.isPublished}>
        Publish on the homepage
      </Checkbox>
    </Shell>
  );
}