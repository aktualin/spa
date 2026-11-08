"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { plainTextToHtml } from "@/lib/domain/rich-text";

import { deleteTierAction, saveTierAction, type ActionState } from "../actions/membership";
import { RichTextField } from "../rich-text-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
  secondaryButtonClass,
} from "../promos/_kit/form-ui";

export type TierFormData = {
  id: string | null;
  slug: string;
  name: string;
  priceLabel: string;
  billingNote: string;
  summary: string;
  benefits: string[];
  terms: string;
  isPublished: boolean;
  sortOrder: number;
};

const initialState: ActionState = { error: null };

export function MembershipTierForm({ tier }: { tier: TierFormData }) {
  const [state, formAction] = useActionState(saveTierAction, initialState);
  const [benefits, setBenefits] = useState<string[]>(
    tier.benefits.length > 0 ? tier.benefits : [""],
  );

  function updateBenefit(index: number, value: string) {
    setBenefits((rows) => rows.map((row, i) => (i === index ? value : row)));
  }

  function moveBenefit(index: number, direction: -1 | 1) {
    setBenefits((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/membership" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar tier
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {tier.id ? `Ubah tier ${tier.name}` : "Tambah tier membership"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {tier.id ? <input type="hidden" name="id" value={tier.id} /> : null}

        <Field label="Nama tier" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={tier.name}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
        >
          <input
            id="slug"
            name="slug"
            defaultValue={tier.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field
          label="Label harga"
          htmlFor="priceLabel"
          hint="Teks bebas, contoh: Rp 2.500.000 / bulan."
        >
          <input
            id="priceLabel"
            name="priceLabel"
            defaultValue={tier.priceLabel}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Catatan penagihan"
          htmlFor="billingNote"
          hint="Contoh: per bulan, minimal 3 bulan."
        >
          <input
            id="billingNote"
            name="billingNote"
            defaultValue={tier.billingNote}
            className={inputClass}
          />
        </Field>

        <Field label="Ringkasan" htmlFor="summary">
          <textarea
            id="summary"
            name="summary"
            defaultValue={tier.summary}
            rows={3}
            className={inputClass}
          />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-neutral-700">Benefit</legend>
          <p className="text-xs text-neutral-500">
            Satu benefit per baris. Baris kosong diabaikan saat disimpan. Urutan
            baris menentukan urutan tampil.
          </p>

          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <input
                aria-label={`Benefit baris ${index + 1}`}
                name="benefits"
                value={benefit}
                onChange={(event) => updateBenefit(index, event.target.value)}
                placeholder="Contoh: 1 sesi treatment 60 menit per bulan"
                className={`${inputClass} min-w-48 flex-1`}
              />
              <button
                type="button"
                onClick={() => moveBenefit(index, -1)}
                aria-label={`Naikkan benefit baris ${index + 1}`}
                className={secondaryButtonClass}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBenefit(index, 1)}
                aria-label={`Turunkan benefit baris ${index + 1}`}
                className={secondaryButtonClass}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  setBenefits((rows) => rows.filter((_, i) => i !== index))
                }
                aria-label={`Hapus benefit baris ${index + 1}`}
                className={`${secondaryButtonClass} text-red-700`}
              >
                Hapus
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setBenefits((rows) => [...rows, ""])}
            className={secondaryButtonClass}
          >
            + Tambah benefit
          </button>
        </fieldset>

        <RichTextField
          name="terms"
          label="Syarat & ketentuan tier (opsional)"
          folder="membership"
          defaultValue={plainTextToHtml(tier.terms)}
        />

        <Field label="Urutan tampil" htmlFor="sortOrder">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={tier.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <Checkbox name="isPublished" defaultChecked={tier.isPublished}>
          Tampilkan di website
        </Checkbox>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/membership" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {tier.id ? (
        <form action={deleteTierAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={tier.id} />
          <ConfirmDeleteButton message="Hapus tier membership ini?">
            Hapus tier ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
