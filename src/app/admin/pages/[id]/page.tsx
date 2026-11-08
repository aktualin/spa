import { notFound } from "next/navigation";

import { getPage } from "../../actions/pages";
import { getSiteUrl } from "@/lib/site-url";

import { PageForm } from "../page-form";

export const instant = false;

export default async function EditStaticPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPage(id);
  if (!page) notFound();

  return (
    <PageForm
      siteUrl={getSiteUrl()}
      menuUsage={page._count.menuItems}
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        template: page.template,
        bodyHtml: page.bodyHtml,
        seoTitle: page.seoTitle ?? "",
        seoDescription: page.seoDescription ?? "",
        status: page.status,
        wasPublished: page.publishedAt !== null,
      }}
    />
  );
}
