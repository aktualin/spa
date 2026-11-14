import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CORPORATE_LIMITS, STATIC_IN_SPA_HTML } from "@/lib/domain/corporate";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getCorporateContentForm } from "../../actions/corporate";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { CorporateContentForm } from "./content-form";

export const instant = false;

export default async function AdminCorporateContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ saved, content, images }, params] = await Promise.all([
    getCorporateContentForm(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/corporate" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Corporate Wellness
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">Konten halaman /corporate</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Hero, intro, benefit, blok solusi, dan bagian In-Spa.
        {saved
          ? ""
          : " Belum pernah disimpan — form berisi teks bawaan yang sekarang tampil di situs."}
      </p>

      <StatusBanners saved={params.saved} />

      <CorporateContentForm
        content={{
          heroTitle: content.heroTitle,
          intro: content.intro,
          benefits: content.benefits,
          solutions: content.solutions,
          inSpaItems: content.inSpaItems,
          inSpaHtml: content.inSpaHtml ?? STATIC_IN_SPA_HTML,
          inOfficeHtml: content.inOfficeHtml ?? "",
          stepsHtml: content.stepsHtml ?? "",
        }}
        images={images}
        limits={{
          maxBenefits: CORPORATE_LIMITS.maxBenefits,
          maxSolutions: CORPORATE_LIMITS.maxSolutions,
          maxInSpaItems: CORPORATE_LIMITS.maxInSpaItems,
        }}
      />
    </div>
  );
}
