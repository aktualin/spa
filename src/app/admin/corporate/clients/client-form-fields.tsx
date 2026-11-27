"use client";

import { ImageField } from "../../image-field";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import type { ClientFormData } from "./client-form";
import { PhotoListField } from "./photo-list-field";

/** Isian klien: nama, logo, website, foto dokumentasi, dan status tayang. */
export function ClientFields({
  client,
  maxPhotos,
}: {
  client: ClientFormData;
  maxPhotos: number;
}) {
  return (
    <>
      <Field label="Client / company name" htmlFor="name" hint="Also used as the logo's alternative text.">
        <input
          id="name"
          name="name"
          defaultValue={client.name}
          required
          maxLength={120}
          className={inputClass}
        />
      </Field>

      <ImageField
        name="logoUrl"
        label="Logo (optional — without a logo, the client name is shown)"
        folder="corporate"
        defaultValue={client.logoUrl}
      />

      <Field
        label="Website (optional)"
        htmlFor="websiteUrl"
        hint='Example: company.co.id — "https://" is added automatically. The logo links to this website.'
      >
        <input
          id="websiteUrl"
          name="websiteUrl"
          defaultValue={client.websiteUrl}
          maxLength={300}
          inputMode="url"
          className={inputClass}
        />
      </Field>

      <PhotoListField
        name="photoUrls"
        label="Event documentation photos"
        folder="corporate"
        defaultValue={client.photoUrls}
        max={maxPhotos}
      />

      <Checkbox name="isPublished" defaultChecked={client.isPublished}>
        Show on website
      </Checkbox>
    </>
  );
}