"use client";

import { useState } from "react";
import type { BranchOption } from "./reservation-form";

export function NewsletterForm({ branches }: { branches: readonly BranchOption[] }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="footer-form-block-newsletter w-form">
        <div className="w-form-done" style={{ display: "block" }}>
          <div>Thank you! Your submission has been received!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="footer-form-block-newsletter w-form">
      <form
        id="form-newsletter"
        name="form-newsletter"
        method="get"
        className="newsletter"
        aria-label="Newsletter signup"
        data-track-form="newsletter"
        onSubmit={onSubmit}
      >
        <input
          className="form_input w-input"
          maxLength={256}
          name="Email-adress-2"
          placeholder="Email address"
          type="email"
          id="Email-adress-2"
          required
        />
        <select
          name="Locations"
          className="form_input is-select"
          defaultValue=""
          aria-label="Preferred location"
          required
        >
          <option disabled value="">
            Locations
          </option>
          {branches.map((branch) => (
            <option key={branch.slug} value={`${branch.name} | ${branch.area}`}>
              {branch.name} | {branch.area}
            </option>
          ))}
        </select>
        <button type="submit" className="button is-tertiary w-button">
          Sign Me Up
        </button>
      </form>
      <div className="w-form-fail">
        <div>Oops! Something went wrong while submitting the form.</div>
      </div>
    </div>
  );
}
