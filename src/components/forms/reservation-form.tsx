"use client";

import { useRef, useState } from "react";

import { Check } from "@/components/icons";
import type { BranchOption, ReservationCopy } from "@/lib/domain/forms";

export type { BranchOption };

/** Form reservasi halaman kontak; submit sungguhan ke /api/reservation. */
export function ReservationForm({
  branches,
  copy,
}: {
  branches: readonly BranchOption[];
  copy: ReservationCopy;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const startedAt = useRef(Date.now());

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
          message: String(data.get("message") ?? ""),
          website: String(data.get("website") ?? ""),
          elapsedMs: Date.now() - startedAt.current,
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
      <div className="layout-row gap-medium">
        <input className="form_input w-input" type="text" name="name" placeholder={copy.nameLabel} aria-label={copy.nameLabel} required />
        <input className="form_input w-input" type="tel" name="phone" placeholder={copy.phoneLabel} aria-label={copy.phoneLabel} required />
      </div>
      <div className="layout-row gap-medium">
        <input className="form_input w-input" type="email" name="email" placeholder={copy.emailLabel} aria-label={copy.emailLabel} />
        <select className="form_input is-select" name="branchSlug" aria-label={copy.branchLabel} defaultValue="" required>
          <option value="" disabled>
            {copy.branchLabel}
          </option>
          {branches.map((branch) => (
            <option key={branch.slug} value={branch.slug}>
              {branch.name} | {branch.area}
            </option>
          ))}
        </select>
      </div>
      <textarea className="form_input w-input" name="message" placeholder={copy.messageLabel} aria-label={copy.messageLabel} rows={3} />
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
