"use client";

import Link from "next/link";
import { useActionState } from "react";

import { plainTextToHtml } from "@/lib/domain/rich-text";

import { deleteTierAction, saveTierAction } from "../actions/membership";
import { RichTextField } from "../rich-text-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../promos/_kit/form-ui";
import { BenefitsFieldset } from "./membership-benefits";
import { TierIdentityFields } from "./membership-tier-fields";
import { initialState, type TierFormData } from "./membership-tier-form.types";

export type { TierFormData } from "./membership-tier-form.types";

export function MembershipTierForm({ tier }: { tier: TierFormData }) {
  const [state, formAction] = useActionState(saveTierAction, initialState);

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

        <TierIdentityFields tier={tier} />

        <RichTextField
          name="summary"
          label="Ringkasan"
          defaultValue={tier.summary}
          folder="membership"
          compact
        />

        <BenefitsFieldset initial={tier.benefits} />

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