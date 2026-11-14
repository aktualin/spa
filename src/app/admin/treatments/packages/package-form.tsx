"use client";

import Link from "next/link";
import { useActionState } from "react";

import { deletePackageAction, savePackageAction } from "../../actions/packages";
import { ImageField } from "../../image-field";
import { MultiImageField } from "../../multi-image-field";
import { ErrorAlert, SaveButton } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";
import { initialState, type PackageFormData, type TreatmentOption } from "./package-form.types";
import { IdentityFields, QuoteField } from "./package-identity";
import { ItemsFieldset } from "./package-items";
import { MetaFields } from "./package-meta";
import { PriceFields } from "./package-price";

export type { PackageItemRow, PackageFormData, TreatmentOption } from "./package-form.types";

export function PackageForm({
  pkg,
  treatments,
}: {
  pkg: PackageFormData;
  treatments: TreatmentOption[];
}) {
  const [state, formAction] = useActionState(savePackageAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/treatments/packages"
        className="text-sm text-neutral-600 hover:underline"
      >
        ← Kembali ke daftar package
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {pkg.id ? `Ubah ${pkg.name}` : "Tambah package"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {pkg.id ? <input type="hidden" name="id" value={pkg.id} /> : null}

        <IdentityFields pkg={pkg} />

        <RichTextField
          name="description"
          label="Deskripsi"
          defaultValue={pkg.description}
          folder="packages"
          compact
        />

        <QuoteField pkg={pkg} />

        <ImageField
          name="imageUrl"
          label="Gambar utama"
          folder="packages"
          defaultValue={pkg.imageUrl}
        />

        <MultiImageField
          label="Galeri halaman detail"
          folder="packages"
          defaultImages={pkg.contentImages}
        />

        <PriceFields pkg={pkg} />

        <ItemsFieldset initial={pkg.items} treatments={treatments} />

        <MetaFields pkg={pkg} />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link
            href="/admin/treatments/packages"
            className="text-sm text-neutral-600 hover:underline"
          >
            Batal
          </Link>
        </div>
      </form>

      {pkg.id ? (
        <form
          action={deletePackageAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={pkg.id} />
          <button type="submit" className="text-sm text-red-700 hover:underline">
            Hapus package ini
          </button>
        </form>
      ) : null}
    </div>
  );
}