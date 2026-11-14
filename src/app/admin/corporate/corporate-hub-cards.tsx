import Link from "next/link";

import { primaryLinkClass } from "../promos/_kit/list-ui";

export const secondaryLinkClass =
  "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50";

export function HubCard({
  href,
  title,
  body,
  highlight = false,
}: {
  href: string;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 rounded-lg border bg-white px-4 py-3 hover:bg-neutral-50 ${
        highlight ? "border-amber-300" : "border-neutral-200"
      }`}
    >
      <span className="font-medium text-neutral-900">{title} →</span>
      <span className="break-words text-xs text-neutral-500">{body}</span>
    </Link>
  );
}

export function Section({
  id,
  title,
  description,
  addHref,
  addLabel,
  children,
}: {
  id: string;
  title: string;
  description: string;
  addHref: string;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        </div>
        <Link href={addHref} className={primaryLinkClass}>
          {addLabel}
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function SortableList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {children}
    </ul>
  );
}