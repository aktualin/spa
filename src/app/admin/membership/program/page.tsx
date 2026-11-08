import { staticMembershipProgram } from "@/lib/domain/membership";

import { getProgram } from "../../actions/membership";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { MembershipProgramForm } from "./program-form";

export const instant = false;

export default async function MembershipProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [program, params] = await Promise.all([getProgram(), searchParams]);

  return (
    <div className="mx-auto max-w-3xl">
      <StatusBanners saved={params.saved} />
      <div className="mt-6">
        <MembershipProgramForm
          // Belum pernah disimpan: form diisi teks yang saat ini tampil di situs.
          program={program ?? staticMembershipProgram()}
          isNew={!program}
        />
      </div>
    </div>
  );
}
