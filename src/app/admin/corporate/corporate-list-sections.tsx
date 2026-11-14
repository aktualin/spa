import {
  importDefaultProgramsAction,
  importDefaultStepsAction,
  moveProgramAction,
  moveStepAction,
  type listCorporateItems,
} from "../actions/corporate-items";
import { Badge, Thumb } from "../promos/_kit/list-ui";
import { Section, SortableList } from "./corporate-hub-cards";
import { EmptyDefaults, Row } from "./corporate-hub-row";

type Items = Awaited<ReturnType<typeof listCorporateItems>>;

/** Daftar program In-Office. */
export function ProgramsSection({ programs }: { programs: Items["programs"] }) {
  return (
    <Section
      id="program"
      title="Program In-Office"
      description="Kartu program di bagian #in-office (mis. Essential, Signature, Executive)."
      addHref="/admin/corporate/programs/new"
      addLabel="Tambah program"
    >
      {programs.length === 0 ? (
        <EmptyDefaults
          text="Belum ada program di database — halaman publik menampilkan 3 program bawaan (Essential, Signature, Executive)."
          action={importDefaultProgramsAction}
          buttonLabel="Salin program bawaan agar bisa diubah"
        />
      ) : (
        <SortableList>
          {programs.map((program, index) => (
            <Row
              key={program.id}
              id={program.id}
              index={index}
              count={programs.length}
              moveAction={moveProgramAction}
              href={`/admin/corporate/programs/${program.id}`}
              thumb={<Thumb src={program.imageUrl} alt="" />}
              title={program.name}
              badge={program.isPublished ? <Badge tone="green">Tayang</Badge> : <Badge tone="muted">Draf</Badge>}
              meta={`${program.features.length} fitur`}
            />
          ))}
        </SortableList>
      )}
    </Section>
  );
}

/** Daftar langkah kolaborasi. */
export function StepsSection({ steps }: { steps: Items["steps"] }) {
  return (
    <Section
      id="langkah"
      title="Langkah kolaborasi"
      description='Bagian "A Simple 4-Step Collaboration Process" — jumlah langkah di judul mengikuti daftar ini.'
      addHref="/admin/corporate/steps/new"
      addLabel="Tambah langkah"
    >
      {steps.length === 0 ? (
        <EmptyDefaults
          text="Belum ada langkah di database — halaman publik menampilkan 4 langkah bawaan."
          action={importDefaultStepsAction}
          buttonLabel="Salin langkah bawaan agar bisa diubah"
        />
      ) : (
        <SortableList>
          {steps.map((step, index) => (
            <Row
              key={step.id}
              id={step.id}
              index={index}
              count={steps.length}
              moveAction={moveStepAction}
              href={`/admin/corporate/steps/${step.id}`}
              title={`Step ${index + 1} · ${step.title}`}
              meta={step.body ?? ""}
            />
          ))}
        </SortableList>
      )}
    </Section>
  );
}