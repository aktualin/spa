"use client";

import { useState } from "react";
import { Check } from "@/components/icons";

/** Pilihan lokasi untuk form; diisi halaman server dari modul Cabang. */
export type BranchOption = { slug: string; name: string; area: string };

export function ReservationForm({ branches }: { branches: readonly BranchOption[] }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-form-done" style={{ display: "block" }}>
        <div className="body-m">
          <Check /> Thank you! Your request has been received. Kami akan menghubungi Anda
          segera.
        </div>
      </div>
    );
  }

  return (
    <form className="newsletter" data-track-form="reservation" onSubmit={onSubmit}>
      <div className="layout-row gap-medium">
        <input
          className="form_input w-input"
          type="text"
          name="name"
          placeholder="Your name"
          aria-label="Your name"
          required
        />
        <input
          className="form_input w-input"
          type="tel"
          name="phone"
          placeholder="Phone number"
          aria-label="Phone number"
          required
        />
      </div>
      <div className="layout-row gap-medium">
        <input
          className="form_input w-input"
          type="email"
          name="email"
          placeholder="Email address"
          aria-label="Email address"
          required
        />
        <select
          className="form_input is-select"
          name="location"
          aria-label="Preferred location"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select location
          </option>
          {branches.map((branch) => (
            <option key={branch.slug} value={branch.slug}>
              {branch.name} | {branch.area}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="form_input w-input"
        name="message"
        placeholder="Which treatment are you interested in?"
        aria-label="Message"
        rows={3}
      />
      <input
        className="button is-tertiary w-button"
        type="submit"
        value="Send Request"
      />
      <div className="w-form-fail" style={{ display: "none" }}>
        <div className="body-m">Oops! Something went wrong while submitting the form.</div>
      </div>
    </form>
  );
}
