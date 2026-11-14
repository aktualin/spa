import Link from "next/link";

import { SmallSubmit } from "../promos/_kit/form-ui";

/** Satu baris daftar corporate: thumb, judul, badge, meta, tombol urutan. */
export function Row({
  id,
  index,
  count,
  moveAction,
  href,
  thumb,
  title,
  badge,
  meta,
}: {
  id: string;
  index: number;
  count: number;
  moveAction: (formData: FormData) => Promise<void>;
  href: string;
  thumb?: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  meta?: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      {thumb}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={href} className="font-medium text-neutral-900 hover:underline">
            {title}
          </Link>
          {badge}
        </div>
        {meta ? <p className="mt-0.5 truncate text-xs text-neutral-500">{meta}</p> : null}
      </div>
      <div className="flex items-center gap-1">
        <form action={moveAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="direction" value="up" />
          <SmallSubmit title="Naikkan" disabled={index === 0}>
            ↑
          </SmallSubmit>
        </form>
        <form action={moveAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="direction" value="down" />
          <SmallSubmit title="Turunkan" disabled={index === count - 1}>
            ↓
          </SmallSubmit>
        </form>
        <Link href={href} className="ml-1 text-sm text-neutral-600 hover:underline">
          Ubah
        </Link>
      </div>
    </li>
  );
}

/** Kotak "belum ada baris — salin isi bawaan". */
export function EmptyDefaults({
  text,
  action,
  buttonLabel,
}: {
  text: string;
  action: () => Promise<void>;
  buttonLabel: string;
}) {
  return (
    <div className="space-y-2 rounded-md border border-dashed border-neutral-300 px-4 py-3">
      <p className="text-sm text-neutral-600">{text}</p>
      <form action={action}>
        <SmallSubmit>{buttonLabel}</SmallSubmit>
      </form>
    </div>
  );
}