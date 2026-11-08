"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Form inquiry Corporate Wellness.
 *
 * Men-impact `POST /api/corporate-inquiry` sesuai kontrak brief:
 * `{ name, company?, email, phone?, message, captchaToken?, website?, startedAt? }`.
 *
 * - `website` adalah honeypot — harus kosong.
 * - `startedAt` dicatat saat form dirender (ms epoch) untuk cek anti-spam.
 * - Widget Cloudflare Turnstile dimuat HANYA bila `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
 *   diset.
 */

type FormState = "idle" | "loading" | "success" | "error";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void; "error-callback"?: () => void },
  ) => string;
  reset: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function CorporateInquiryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  /* Waktu form mulai diisi — dipakai server untuk menolak submit instan (bot).
     Diisi di `useEffect`, bukan saat render: `Date.now()` saat render membuat
     halaman tidak bisa di-prerender (`cacheComponents`). */
  const startedAtRef = useRef<number | null>(null);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  /* Widget Turnstile — hanya dimuat bila site key tersedia. */
  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !widgetContainerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => {
          setCaptchaToken(token);
          setFieldErrors((prev) => ({ ...prev, captcha: "" }));
        },
        "expired-callback": () => setCaptchaToken(null),
        "error-callback": () =>
          setFieldErrors((prev) => ({
            ...prev,
            captcha: "Captcha gagal dimuat. Silakan coba lagi.",
          })),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (state === "loading") return;

      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("name") ?? "").trim();
      const company = String(formData.get("company") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const phone = String(formData.get("phone") ?? "").trim();
      const message = String(formData.get("message") ?? "").trim();
      const website = String(formData.get("website") ?? "").trim();

      /* Honeypot terisi → pretend success, jangan kirim ke server. */
      if (website) {
        setState("success");
        return;
      }

      const errors: Record<string, string> = {};
      if (!name) errors.name = "Nama wajib diisi.";
      if (!email) {
        errors.email = "Email wajib diisi.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Format email belum benar.";
      }
      if (!message) errors.message = "Pesan wajib diisi.";

      if (SITE_KEY && !captchaToken) {
        errors.captcha = "Mohon selesaikan captcha terlebih dahulu.";
      }

      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) {
        setState("error");
        setError("Mohon lengkapi isian yang masih kosong.");
        return;
      }

      setState("loading");
      setError(null);

      try {
        const response = await fetch("/api/corporate-inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            company: company || undefined,
            email,
            phone: phone || undefined,
            message,
            captchaToken: captchaToken ?? undefined,
            website: website || undefined,
            startedAt: startedAtRef.current ?? undefined,
          }),
        });

        const payload: unknown = await response.json().catch(() => null);
        const messagePayload =
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error?: unknown }).error ?? "")
            : "";

        if (!response.ok) {
          setState("error");
          setError(
            messagePayload ||
              "Terjadi kendala saat mengirim. Silakan coba lagi atau hubungi kami via WhatsApp.",
          );
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
            setCaptchaToken(null);
          }
          return;
        }

        setState("success");
        formRef.current?.reset();
        setCaptchaToken(null);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      } catch {
        setState("error");
        setError(
          "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.",
        );
      }
    },
    [captchaToken, state],
  );

  if (state === "success") {
    return (
      <div
        role="status"
        className="flex flex-col gap-2 border border-cocoa/20 bg-cream px-6 py-10"
      >
        <h3 className="font-display text-title-sm md:text-[1.375rem]">
          Terima kasih, inquiry Anda sudah terkirim.
        </h3>
        <p className="max-w-[52ch] text-body text-cocoa/70">
          Tim KAMA akan menghubungi Anda kembali pada jam operasional. Untuk hal
          mendesak, hubungi kami via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Nama *</span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className="border border-cocoa/30 bg-cream px-4 py-3 text-body text-cocoa outline-none transition-colors focus:border-cocoa"
          />
          {fieldErrors.name ? (
            <span className="text-caption text-error">{fieldErrors.name}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Perusahaan</span>
          <input
            name="company"
            type="text"
            autoComplete="organization"
            className="border border-cocoa/30 bg-cream px-4 py-3 text-body text-cocoa outline-none transition-colors focus:border-cocoa"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Email *</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border border-cocoa/30 bg-cream px-4 py-3 text-body text-cocoa outline-none transition-colors focus:border-cocoa"
          />
          {fieldErrors.email ? (
            <span className="text-caption text-error">{fieldErrors.email}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Telepon</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            className="border border-cocoa/30 bg-cream px-4 py-3 text-body text-cocoa outline-none transition-colors focus:border-cocoa"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="eyebrow text-cocoa/70">Pesan *</span>
        <textarea
          name="message"
          required
          rows={5}
          className="border border-cocoa/30 bg-cream px-4 py-3 text-body text-cocoa outline-none transition-colors focus:border-cocoa"
        />
        {fieldErrors.message ? (
          <span className="text-caption text-error">{fieldErrors.message}</span>
        ) : null}
      </label>

      {/* Honeypot — humans never see this field. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {SITE_KEY ? (
        <div className="flex flex-col gap-2">
          <div ref={widgetContainerRef} />
          {fieldErrors.captcha ? (
            <span className="text-caption text-error">{fieldErrors.captcha}</span>
          ) : null}
        </div>
      ) : null}

      {state === "error" && error ? (
        <p role="alert" className="text-body text-error">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={state === "loading"}>
          {state === "loading" ? "Mengirim…" : "Kirim Inquiry"}
        </button>
        <span className="text-caption text-cocoa/60">
          Data Anda hanya digunakan untuk merespons inquiry ini.
        </span>
      </div>
    </form>
  );
}
