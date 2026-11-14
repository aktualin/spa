import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";

/**
 * Banner ajakan kartu cream (events, gift-card, promos) — judul + deskripsi
 * di kiri, tombol di kanan; markup identik dengan halaman asalnya.
 */
export function CtaBanner({
  title,
  description,
  href,
  label,
  sectionClassName = "bg-cream-soft",
}: {
  title: string;
  description: string;
  href: string;
  label: string;
  /** Latar section; events memakai "bg-cream", lainnya "bg-cream-soft". */
  sectionClassName?: string;
}) {
  return (
    <Reveal as="section" className={sectionClassName}>
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className="flex flex-col items-start gap-5 bg-cream-card px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-title md:text-[2.375rem] md:leading-[1.2]">
              {title}
            </h2>
            <p className="max-w-[52ch] text-body text-cocoa/70">{description}</p>
          </div>
          <Link href={href} className="btn btn-outline shrink-0 border-cocoa/40">
            {label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}