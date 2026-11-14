"use client";

import Link from "next/link";
import { useActionState } from "react";

import { PROGRAM_LIMITS, type MembershipProgramData } from "@/lib/domain/membership";

import { saveProgramAction, type ActionState } from "../../actions/membership";
import { ErrorAlert, SaveButton } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";
import { ProgramHeaderFields } from "./program-fields";
import { RowList } from "./program-row-list";

const initialState: ActionState = { error: null };

export function MembershipProgramForm({
  program,
  isNew,
}: {
  program: MembershipProgramData;
  isNew: boolean;
}) {
  const [state, formAction] = useActionState(saveProgramAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/membership" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Membership
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">Program membership</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Isi halaman <span className="font-medium">/membership</span> serta kalimat harga
        dan deskripsi banner membership di homepage. Paket/tier diatur di daftar tier.
      </p>
      {isNew ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Program belum pernah disimpan. Form ini berisi teks bawaan yang sekarang
          tampil di situs — ubah lalu tekan Simpan.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        <ProgramHeaderFields program={program} />

        <RowList
          legend="Main benefits"
          titleName="benefitTitle"
          bodyName="benefitBody"
          titleLabel="Judul benefit"
          bodyLabel="Keterangan benefit"
          initial={program.benefits}
          max={PROGRAM_LIMITS.maxBenefits}
        />

        <RichTextField
          name="servicesIntro"
          label="Intro essential services"
          defaultValue={program.servicesIntro}
          folder="membership"
          hint={`Wajib diisi, maksimal ${PROGRAM_LIMITS.servicesIntro} karakter teks (format/HTML tidak dihitung).`}
          compact
        />

        <RowList
          legend="Essential services"
          titleName="serviceName"
          bodyName="serviceDescription"
          titleLabel="Nama layanan"
          bodyLabel="Deskripsi layanan"
          initial={program.services.map((s) => ({ title: s.name, body: s.description }))}
          max={PROGRAM_LIMITS.maxServices}
        />

        <RichTextField
          name="termsHtml"
          label="Syarat & ketentuan program (opsional)"
          folder="membership"
          defaultValue={program.termsHtml ?? ""}
        />

        <ErrorAlert message={state.error} />

        <div className="border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}