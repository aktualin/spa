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
      title="In-Office programs"
      description="Program cards in the #in-office section (e.g. Essential, Signature, Executive)."
      addHref="/admin/corporate/programs/new"
      addLabel="Add program"
    >
      {programs.length === 0 ? (
        <EmptyDefaults
          text="No programs in the database yet — the public page shows 3 default programs (Essential, Signature, Executive)."
          action={importDefaultProgramsAction}
          buttonLabel="Copy default programs so they can be edited"
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
              badge={program.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="muted">Draft</Badge>}
              meta={`${program.features.length} features`}
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
      title="Collaboration steps"
      description='The "A Simple 4-Step Collaboration Process" section — the step count in the heading follows this list.'
      addHref="/admin/corporate/steps/new"
      addLabel="Add step"
    >
      {steps.length === 0 ? (
        <EmptyDefaults
          text="No steps in the database yet — the public page shows 4 default steps."
          action={importDefaultStepsAction}
          buttonLabel="Copy default steps so they can be edited"
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