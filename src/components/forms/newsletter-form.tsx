"use client";

import { useEffect, useRef, useState } from "react";

import type { BranchOption } from "./reservation-form";

/**
 * Form newsletter di footer. Mengirim `POST /api/newsletter-subscribe`:
 * `{ email, branchSlug?, website, elapsedMs }`.
 *
 * Anti-spam (diperiksa ulang di server): `website` = honeypot, `elapsedMs` =
 * lama form terbuka (jam browser sendiri) — minimal 3 detik. Tanpa captcha,
 * sesuai risiko rendah signup newsletter.
 */

type FormState = "idle" | "loading" | "success" | "error";

const fieldClass =
  "min-w-0 flex-1 border border-cream-soft/30 bg-transparent px-4 py-2.5 text-caption text-cream-soft placeholder:text-cream-soft/50 outline-none transition-colors focus:border-cream-soft";

export function NewsletterForm({ branches }: { branches: readonly BranchOption[] }) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  /* Diisi di `useEffect`, bukan saat render, supaya halaman tetap bisa
     di-prerender (`cacheComponents`). */
  const startedAtRef = useRef<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    startedAtRef.current = Date.now();
    setHydrated(true);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const branchSlug = String(formData.get("branchSlug") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();

    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          branchSlug: branchSlug || undefined,
          website,
          elapsedMs: startedAtRef.current === null ? undefined : Date.now() - startedAtRef.current,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);
      const serverError =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error?: unknown }).error ?? "")
          : "";

      if (!response.ok) {
        setState("error");
        setError(serverError || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      setState("success");
      formRef.current?.reset();
    } catch {
      setState("error");
      setError("Gagal menghubungi server. Periksa koneksi Anda lalu coba lagi.");
    }
  }

  if (state === "success") {
    return (
      <p role="status" className="text-caption text-cream-soft/85">
        Terima kasih! Pendaftaran newsletter Anda sudah kami terima.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      aria-label="Newsletter signup"
      data-track-form="newsletter"
      onSubmit={onSubmit}
      className="relative flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={fieldClass}
          maxLength={256}
          name="email"
          placeholder="Email address"
          type="email"
          aria-label="Email address"
          autoComplete="email"
          required
        />
        <select
          name="branchSlug"
          className={`${fieldClass} sm:max-w-[220px]`}
          defaultValue=""
          aria-label="Preferred location"
          required
        >
          <option disabled value="">
            Lokasi
          </option>
          {branches.map((branch) => (
            <option key={branch.slug} value={branch.slug}>
              {branch.name} | {branch.area}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot — tidak terlihat dan tidak bisa difokus oleh manusia. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {state === "error" && error ? (
        <p role="alert" className="text-caption text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-light w-fit whitespace-nowrap"
        disabled={!hydrated || state === "loading"}
      >
        {state === "loading" ? "Mengirim…" : "Sign Me Up"}
      </button>
    </form>
  );
}
