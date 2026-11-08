import { notFound } from "next/navigation";

import { requirePageAccess } from "../../access";
import { getPageSeo } from "../../actions/seo";
import { PageSeoForm } from "../seo-form";

export const instant = false;

export default async function EditSeoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  await requirePageAccess("/admin/seo");

  const [{ id }, query] = await Promise.all([params, searchParams]);

  if (id === "new") {
    return (
      <PageSeoForm
        entry={{
          id: null,
          path: query.path ?? "",
          title: "",
          description: "",
          ogImageUrl: "",
        }}
      />
    );
  }

  const entry = await getPageSeo(id);
  if (!entry) notFound();

  return (
    <PageSeoForm
      entry={{
        id: entry.id,
        path: entry.path,
        title: entry.title ?? "",
        description: entry.description ?? "",
        ogImageUrl: entry.ogImageUrl ?? "",
      }}
    />
  );
}
