"use client";

import { useEffect, useRef, useState } from "react";

import { Check } from "@/components/icons";
import type { BranchOption, ReservationCopy, ReservationServiceGroup } from "@/lib/domain/forms";

import { ReservationFields } from "./reservation-fields";

export type { BranchOption, ReservationServiceGroup };

/** Form reservasi publik (/contact & /reservation); submit ke /api/reservation. */
export function ReservationForm({
  branches,
  services = [],
  copy,
}: {
  branches: readonly BranchOption[];
  services?: readonly ReservationServiceGroup[];
  copy: ReservationCopy;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  // Diisi saat mount (bukan saat render) supaya prerender Cache Components
  // tidak membekukan Date.now(); dipakai pertahanan bot elapsedMs.
  const startedAt = useRef<number | null>(null);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          branchSlug: String(data.get("branchSlug") ?? ""),
          treatment: String(data.get("treatment") ?? ""),
          preferredDate: String(data.get("preferredDate") ?? ""),
          preferredTime: String(data.get("preferredTime") ?? ""),
          guests: String(data.get("guests") ?? ""),
          message: String(data.get("message") ?? ""),
          website: String(data.get("website") ?? ""),
          elapsedMs: startedAt.current === null ? 0 : Date.now() - startedAt.current,
        }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="w-form-done" style={{ display: "block" }}>
        <div className="body-m">
          <Check /> {copy.success}
        </div>
      </div>
    );
  }

  return (
    <form className="newsletter" data-track-form="reservation" onSubmit={onSubmit} aria-label={copy.title}>
      <ReservationFields branches={branches} services={services} copy={copy} />
      {/* Honeypot: tidak terlihat manusia, bot mengisinya → ditolak server. */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input className="button is-tertiary w-button" type="submit" value={copy.submitLabel} disabled={state === "sending"} />
      {state === "error" && (
        <div className="w-form-fail" style={{ display: "block" }}>
          <div className="body-m">{copy.error}</div>
        </div>
      )}
    </form>
  );
}
