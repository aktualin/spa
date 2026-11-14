"use client";

import { ArrowLeft, ArrowRight } from "@/components/icons";

/** Panah navigasi lightbox; kliknya tidak boleh menutup overlay. */
export function LightboxArrow({
  direction,
  label,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full p-2 text-cream-soft transition hover:bg-white/10 ${
        direction === "prev" ? "left-2 sm:left-6" : "right-2 sm:right-6"
      }`}
    >
      {direction === "prev" ? (
        <ArrowLeft className="h-6 w-6" />
      ) : (
        <ArrowRight className="h-6 w-6" />
      )}
    </button>
  );
}