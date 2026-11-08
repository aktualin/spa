import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { getCorporateContentForm } from "../../actions/corporate";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { CorporatePicForm } from "./pic-form";

export const instant = false;

export default async function AdminCorporatePicPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ content }, params] = await Promise.all([getCorporateContentForm(), searchParams]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/corporate" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Corporate Wellness
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">PIC Corporate Wellness</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Kontak penanggung jawab program korporat. Ketiganya tampil publik di banner
        &quot;Let&apos;s build your wellness program.&quot; pada halaman /corporate.
      </p>

      <StatusBanners saved={params.saved} />

      <CorporatePicForm pic={content.pic} />
    </div>
  );
}
