"use client";

import { assessSeoText, formatPageTitle } from "@/lib/domain/seo";

import { Field, inputClass } from "../settings/_components/form-ui";

const toneOf = (status: string) =>
  status === "long" ? "text-xs text-amber-700" : "text-xs text-neutral-500";

/** Meta title + description dengan penilaian panjang dan pratinjau Google. */
export function SeoTextFields({
  title,
  setTitle,
  description,
  setDescription,
}: {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}) {
  const renderedTitle = title.trim() ? formatPageTitle(title) : "";
  const titleCheck = assessSeoText(renderedTitle, "title");
  const descriptionCheck = assessSeoText(description, "description");

  return (
    <>
      <Field
        label="Meta title"
        htmlFor="title"
        hint="Akhiran “ • KAMA Spa” ditambahkan otomatis (kecuali judul sudah memuat “KAMA Spa”). Idealnya total ≤ 60 karakter."
      >
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />
      </Field>
      <p className={toneOf(titleCheck.status)}>
        {titleCheck.status === "empty"
          ? "Kosong — halaman memakai judul bawaannya."
          : `Tampil sebagai “${renderedTitle}”. ${titleCheck.message}`}
      </p>

      <Field
        label="Meta description"
        htmlFor="description"
        hint="Ringkasan di hasil pencarian. Idealnya 70–160 karakter."
      >
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className={inputClass}
        />
      </Field>
      <p className={toneOf(descriptionCheck.status)}>{descriptionCheck.message}</p>

      {renderedTitle || description.trim() ? (
        <div className="rounded-md border border-neutral-200 bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-neutral-400">
            Pratinjau hasil pencarian
          </p>
          <p className="mt-1 truncate text-base text-blue-800">
            {renderedTitle || "(judul bawaan halaman)"}
          </p>
          <p className="line-clamp-2 text-sm text-neutral-600">
            {description.trim() || "(description bawaan halaman)"}
          </p>
        </div>
      ) : null}
    </>
  );
}