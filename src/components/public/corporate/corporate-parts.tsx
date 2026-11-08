import { Check } from "@/components/icons";

/** Daftar benefit corporate wellness. */
export function CorporateBenefits({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-body text-cocoa/80">
          <span className="mt-1 shrink-0">
            <Check className="h-4 w-4" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kartu solusi (in-office / in-spa / benefits). */
export function CorporateSolutions({
  items,
}: {
  items: { title: string; items: string[] }[];
}) {
  if (items.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {items.map((solution) => (
        <li key={solution.title} className="flex h-full flex-col bg-cream p-6">
          <h3 className="font-display text-title-sm md:text-[1.375rem] md:leading-[1.3]">
            {solution.title}
          </h3>
          <ul className="mt-4 flex flex-col gap-2">
            {solution.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body text-cocoa/80">
                <span className="mt-1 shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Kartu program in-office (Essential / Signature / Executive). */
export function CorporatePrograms({
  items,
}: {
  items: { name: string; description: string; features: string[] }[];
}) {
  if (items.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {items.map((program) => (
        <li key={program.name} className="flex h-full flex-col bg-cream p-6">
          <span className="eyebrow text-cocoa/60">{program.name}</span>
          <p className="mt-3 text-body text-cocoa/70">{program.description}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {program.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-body text-cocoa/80">
                <span className="mt-1 shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Langkah kolaborasi (4 step). */
export function CorporateSteps({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      {items.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-3 border-t border-cocoa/20 pt-4">
          <span className="eyebrow text-cocoa/60">Step {index + 1}</span>
          <h3 className="font-display text-title-sm md:text-[1.375rem] md:leading-[1.3]">
            {step.title}
          </h3>
          <p className="text-body text-cocoa/70">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
