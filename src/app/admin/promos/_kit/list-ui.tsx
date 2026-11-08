/**
 * Potongan UI server-safe untuk halaman list admin (banner status & badge).
 */

export function StatusBanners({
  saved,
  deleted,
  deletedLabel = "Data dihapus.",
}: {
  saved?: string;
  deleted?: string;
  deletedLabel?: string;
}) {
  return (
    <>
      {saved ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Perubahan tersimpan.
        </p>
      ) : null}
      {deleted ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {deletedLabel}
        </p>
      ) : null}
    </>
  );
}

export type BadgeTone = "default" | "muted" | "green" | "blue" | "amber" | "red";

const toneClass: Record<BadgeTone, string> = {
  default: "bg-neutral-900 text-white",
  muted: "bg-neutral-100 text-neutral-600",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
};

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export const primaryLinkClass =
  "rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700";

/** Thumbnail kecil untuk list; `<img>` karena URL berasal dari storage eksternal. */
export function Thumb({ src, alt = "" }: { src: string | null; alt?: string }) {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-neutral-50">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <span className="text-[9px] text-neutral-400">kosong</span>
      )}
    </div>
  );
}
