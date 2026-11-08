"use client";

import Link from "next/link";
import { useActionState } from "react";

import { BRANCH_LIMITS } from "@/lib/domain/branch";
import { MAX_OPENING_HOURS } from "@/lib/domain/site-settings";

import {
  deleteBranchAction,
  saveBranchAction,
  type ActionState,
} from "../actions/branches";
import {
  Checkbox,
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

export type BranchFormData = {
  id: string | null;
  name: string;
  slug: string;
  area: string;
  tag: string;
  address: string;
  /** Satu baris per entri, dipisah "\n". */
  openingHours: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  mapsEmbedUrl: string;
  mapsUrl: string;
  latitude: string;
  longitude: string;
  /** String kosong = cabang baru diletakkan di akhir daftar. */
  sortOrder: string;
  isPublished: boolean;
};

const initialState: ActionState = { error: null };

export function BranchForm({ branch }: { branch: BranchFormData }) {
  const [state, formAction] = useActionState(saveBranchAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/branches" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {branch.id ? `Ubah ${branch.name}` : "Tambah cabang"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {branch.id ? <input type="hidden" name="id" value={branch.id} /> : null}

        <Field label="Nama cabang" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={branch.name}
            required
            maxLength={BRANCH_LIMITS.name}
            className={inputClass}
          />
        </Field>

        <Field
          label="Area"
          htmlFor="area"
          hint="Tampil setelah nama cabang, contoh: “South Jakarta | Kramat Pela”."
        >
          <input
            id="area"
            name="area"
            defaultValue={branch.area}
            required
            maxLength={BRANCH_LIMITS.area}
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Penanda unik cabang. Huruf kecil, angka, dan tanda hubung, contoh: south-jakarta."
        >
          <input
            id="slug"
            name="slug"
            defaultValue={branch.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field
          label="Label (opsional)"
          htmlFor="tag"
          hint="Penanda kecil di daftar admin, contoh: Flagship atau Coming Soon."
        >
          <input
            id="tag"
            name="tag"
            defaultValue={branch.tag}
            maxLength={BRANCH_LIMITS.tag}
            className={inputClass}
          />
        </Field>

        <Field label="Alamat" htmlFor="address">
          <textarea
            id="address"
            name="address"
            defaultValue={branch.address}
            rows={2}
            maxLength={BRANCH_LIMITS.address}
            className={inputClass}
          />
        </Field>

        <Field
          label="Jam operasional"
          htmlFor="openingHours"
          hint={`Satu baris per entri, maksimal ${MAX_OPENING_HOURS} baris. Kosongkan untuk mengikuti jam di Kontak & Umum.`}
        >
          <textarea
            id="openingHours"
            name="openingHours"
            defaultValue={branch.openingHours}
            rows={3}
            placeholder="Mon – Sun. 10 AM – 8 PM"
            className={inputClass}
          />
        </Field>

        <Field
          label="Nomor WhatsApp (opsional)"
          htmlFor="whatsappNumber"
          hint="Kosongkan untuk memakai nomor di Kontak & Umum. Tulis 08xx atau +62xx."
        >
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            defaultValue={branch.whatsappNumber}
            placeholder="0813-1605-2040"
            className={inputClass}
          />
        </Field>

        <Field
          label="Nomor telepon tampilan (opsional)"
          htmlFor="phone"
          hint="Kosongkan untuk menampilkan nomor WhatsApp di atas dalam format +62 8xx-xxxx-xxxx."
        >
          <input
            id="phone"
            name="phone"
            defaultValue={branch.phone}
            className={inputClass}
          />
        </Field>

        <Field label="Email (opsional)" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={branch.email}
            className={inputClass}
          />
        </Field>

        <Field
          label="Embed Google Maps (opsional)"
          htmlFor="mapsEmbedUrl"
          hint="Tempel kode <iframe> dari Google Maps → Share → Embed a map, atau URL-nya langsung."
        >
          <textarea
            id="mapsEmbedUrl"
            name="mapsEmbedUrl"
            defaultValue={branch.mapsEmbedUrl}
            rows={2}
            className={inputClass}
          />
        </Field>

        <Field
          label="Tautan rute (opsional)"
          htmlFor="mapsUrl"
          hint="Tombol “Dapatkan Rute”. Kosongkan untuk membuatnya otomatis dari alamat."
        >
          <input
            id="mapsUrl"
            name="mapsUrl"
            defaultValue={branch.mapsUrl}
            placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Lintang (latitude)"
            htmlFor="latitude"
            hint="Penanda di peta halaman Kontak."
          >
            <input
              id="latitude"
              name="latitude"
              defaultValue={branch.latitude}
              inputMode="decimal"
              placeholder="-6.2438873"
              className={inputClass}
            />
          </Field>
          <Field label="Bujur (longitude)" htmlFor="longitude" hint="Kosongkan keduanya bila cabang belum perlu tampil di peta.">
            <input
              id="longitude"
              name="longitude"
              defaultValue={branch.longitude}
              inputMode="decimal"
              placeholder="106.7935745"
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Urutan tampil"
          htmlFor="sortOrder"
          hint="Makin kecil makin atas. Kosongkan untuk meletakkan cabang baru di akhir; urutan juga bisa diatur dengan tombol ↑/↓ di daftar."
        >
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={branch.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <Checkbox name="isPublished" defaultChecked={branch.isPublished}>
          Tampilkan di website
        </Checkbox>

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/branches" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {branch.id ? (
        <form action={deleteBranchAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={branch.id} />
          <ConfirmSubmit message={`Hapus cabang "${branch.name}"?`}>
            Hapus cabang ini
          </ConfirmSubmit>
        </form>
      ) : null}
    </div>
  );
}
