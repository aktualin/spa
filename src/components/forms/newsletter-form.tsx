"use client";

import { useRef, useState } from "react";

import type { BranchOption, NewsletterCopy } from "@/lib/domain/forms";

/** Form newsletter footer; submit sungguhan ke /api/newsletter. */
export function NewsletterForm({
  branches,
  copy,
}: {
  branches: readonly BranchOption[];
  copy: NewsletterCopy;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const startedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          name: String(data.get("name") ?? ""),
          branchSlug: String(data.get("branchSlug") ?? ""),
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
      <div className="footer-form-block-newsletter w-form">
        <div className="w-form-done" style={{ display: "block" }}>
          <div>{copy.success}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="footer-form-block-newsletter w-form">
      <form
        id="form-newsletter"
        name="form-newsletter"
        method="post"
        className="newsletter"
        aria-label={copy.title}
        data-track-form="newsletter"
        onSubmit={onSubmit}
      >
        <input
          className="form_input w-input"
          maxLength={256}
          name="email"
          placeholder={copy.emailLabel}
          aria-label={copy.emailLabel}
          type="email"
          required
        />
        <select
          name="branchSlug"
          className="form_input is-select"
          defaultValue=""
          aria-label={copy.branchLabel}
          required
        >
          <option disabled value="">
            {copy.branchLabel}
          </option>
          {branches.map((branch) => (
            <option key={branch.slug} value={branch.slug}>
              {branch.name} | {branch.area}
            </option>
          ))}
        </select>
        {/* Honeypot: tidak terlihat manusia, bot mengisinya → ditolak server. */}
        <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" className="button is-tertiary w-button" disabled={state === "sending"}>
          {copy.submitLabel}
        </button>
      </form>
      {state === "error" && (
        <div className="w-form-fail" style={{ display: "block" }}>
          <div>{copy.error}</div>
        </div>
      )}
    </div>
  );
}
