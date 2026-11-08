import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { getSiteUrl } from "@/lib/site-url";

import { PageForm } from "../page-form";

export const instant = false;

export default async function NewStaticPage() {
  await requireRole(CONTENT_ROLES);

  return (
    <PageForm
      siteUrl={getSiteUrl()}
      page={{
        id: null,
        title: "",
        slug: "",
        template: "STANDARD",
        bodyHtml: "",
        seoTitle: "",
        seoDescription: "",
        status: "DRAFT",
        wasPublished: false,
      }}
    />
  );
}
