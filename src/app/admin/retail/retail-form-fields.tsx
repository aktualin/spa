"use client";

import { RETAIL_LIMITS } from "@/lib/domain/retail";

import { Checkbox, Field, inputClass } from "../settings/_components/form-ui";
import type { RetailFormData } from "./retail-form.types";

/** Harga, pesan WhatsApp, urutan, dan flag highlight/tayang. */
export function RetailMetaFields({ product }: { product: RetailFormData }) {
  return (
    <>
      <Field
        label="Harga (opsional)"
        htmlFor="priceIdr"
        hint="Rupiah penuh, contoh: 250000 atau 250.000. Kosongkan bila harga ditanyakan via WhatsApp — website menampilkan “Hubungi kami”."
      >
        <input
          id="priceIdr"
          name="priceIdr"
          defaultValue={product.priceIdr}
          inputMode="numeric"
          placeholder="250000"
          className={`${inputClass} w-40`}
        />
      </Field>

      <Field
        label="Pesan WhatsApp khusus"
        htmlFor="whatsappMessage"
        hint={
          <>
            Kosongkan untuk memakai template “retail” di Kontak &amp; Umum →
            WhatsApp (bawaan: “Halo kak, saya mau pesan produk [nama]” plus
            harga bila ada). Boleh memakai {"{{product}}"} dan {"{{harga}}"}.
          </>
        }
      >
        <textarea
          id="whatsappMessage"
          name="whatsappMessage"
          defaultValue={product.whatsappMessage}
          rows={2}
          maxLength={RETAIL_LIMITS.whatsappMessage}
          className={inputClass}
        />
      </Field>

      <Field
        label="Urutan tampil"
        htmlFor="sortOrder"
        hint="Makin kecil makin atas. Kosongkan untuk meletakkan produk baru di akhir; urutan juga bisa diatur dengan tombol ↑/↓ di daftar."
      >
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          step={1}
          defaultValue={product.sortOrder}
          className={`${inputClass} w-28`}
        />
      </Field>

      <div className="space-y-2">
        <Checkbox name="isHighlight" defaultChecked={product.isHighlight}>
          Tandai sebagai <strong>Highlight / Kolaborasi</strong> — tampil
          paling atas dengan label “Highlight”
        </Checkbox>
        <Checkbox name="isPublished" defaultChecked={product.isPublished}>
          Tampilkan di website
        </Checkbox>
      </div>
    </>
  );
}