"use client";

import { Field, inputClass } from "../settings/_components/form-ui";
import {
  STATUSES,
  TEMPLATES,
  type PageStatusValue,
  type PageTemplateValue,
} from "./page-form.constants";

/** Pilihan template + status terbit, dan peringatan pemakaian menu. */
export function TemplateStatusFields({
  template,
  setTemplate,
  status,
  setStatus,
  menuUsage,
}: {
  template: PageTemplateValue;
  setTemplate: (value: PageTemplateValue) => void;
  status: PageStatusValue;
  setStatus: (value: PageStatusValue) => void;
  menuUsage: number;
}) {
  const templateInfo = TEMPLATES.find((t) => t.value === template);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Template" htmlFor="template" hint={templateInfo?.description}>
          <select
            id="template"
            name="template"
            value={template}
            onChange={(event) => setTemplate(event.target.value as PageTemplateValue)}
            className={inputClass}
          >
            {TEMPLATES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Status"
          htmlFor="status"
          hint="Halaman draf tidak bisa dibuka pengunjung."
        >
          <select
            id="status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PageStatusValue)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {menuUsage > 0 && status === "DRAFT" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Halaman ini dipakai {menuUsage} item menu navigasi. Selama berstatus Draf, item menu
          tersebut tidak tampil di situs.
        </p>
      ) : null}
    </>
  );
}