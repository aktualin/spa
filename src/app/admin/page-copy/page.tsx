import { PAGE_COPY_GROUPS } from "@/lib/domain/page-copy";

import { requirePageAccess } from "../access";
import { getAdminPageCopy } from "../actions/page-copy";
import { StatusBanner } from "../settings/_components/form-ui";
import { PageCopyForm } from "./page-copy-form";

export const instant = false;

export default async function AdminPageCopyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePageAccess("/admin/page-copy");
  const [values, params] = await Promise.all([getAdminPageCopy(), searchParams]);

  return (
    <>
      <StatusBanner saved={params.saved} />
      <PageCopyForm groups={PAGE_COPY_GROUPS} values={values} />
    </>
  );
}
