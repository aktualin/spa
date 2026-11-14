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
      backLabel="Kembali ke daftar statistik"
      heading={stat.id ? "Ubah statistik" : "Tambah statistik"}
      intro="Tampil sebagai kotak angka di section Brand Intro (“KAMA at a glance”)."
      id={stat.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteHomepageStatAction}
      deleteMessage="Hapus statistik ini?"
      deleteLabel="Hapus statistik ini"
    >
      <Field label="Angka / nilai" htmlFor="value" hint="Mis. 12 atau 40+.">
        <input
          id="value"
          name="value"
          defaultValue={stat.value}
          required
          maxLength={STAT_LIMITS.value}
          className={inputClass}
        />
      </Field>
      <Field label="Label" htmlFor="label" hint="Mis. years of care. Ditampilkan di bawah angka.">
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
        Terbitkan di homepage
      </Checkbox>
    </Shell>
  );
}