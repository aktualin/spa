import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getCorporateContent } from "../actions/corporate";
import { CorporateContentForm } from "./corporate-form";

export const instant = false;

export default async function AdminCorporatePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [content, params] = await Promise.all([
    getCorporateContent(),
    searchParams,
  ]);

  return (
    <>
      {params.saved ? (
        <p
          role="status"
          className="mx-auto mt-4 max-w-2xl rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Perubahan tersimpan.
        </p>
      ) : null}
      <CorporateContentForm
        content={{
          heroTitle: content?.heroTitle ?? "Corporate Wellness",
          intro: content?.intro ?? "",
          inOfficeHtml: content?.inOfficeHtml ?? "",
          inSpaHtml: content?.inSpaHtml ?? "",
          stepsHtml: content?.stepsHtml ?? "",
          picName: content?.picName ?? "",
          picEmail: content?.picEmail ?? "",
          picPhone: content?.picPhone ?? "",
        }}
      />
    </>
  );
}
