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
        ← Back to Membership
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">Membership program</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Content of the <span className="font-medium">/membership</span> page, plus the
        pricing sentence and membership banner description on the homepage. Packages/tiers are managed in the tiers list.
      </p>
      {isNew ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          The program has never been saved. This form contains the default text
          currently shown on the site — edit it and press Save.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        <ProgramHeaderFields program={program} />

        <RowList
          legend="Main benefits"
          titleName="benefitTitle"
          bodyName="benefitBody"
          titleLabel="Benefit title"
          bodyLabel="Benefit description"
          initial={program.benefits}
          max={PROGRAM_LIMITS.maxBenefits}
        />

        <RichTextField
          name="servicesIntro"
          label="Essential services intro"
          defaultValue={program.servicesIntro}
          folder="membership"
          hint={`Required, maximum ${PROGRAM_LIMITS.servicesIntro} characters of text (formatting/HTML not counted).`}
          compact
        />

        <RowList
          legend="Essential services"
          titleName="serviceName"
          bodyName="serviceDescription"
          titleLabel="Service name"
          bodyLabel="Service description"
          initial={program.services.map((s) => ({ title: s.name, body: s.description }))}
          max={PROGRAM_LIMITS.maxServices}
        />

        <RichTextField
          name="termsHtml"
          label="Program terms & conditions (optional)"
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