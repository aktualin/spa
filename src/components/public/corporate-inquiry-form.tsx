"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Formulir inquiry Corporate Wellness (`/corporate#inquiry`).
 *
 * Mengirim `POST /api/corporate-inquiry`:
 * `{ name, company?, email, phone?, message, consent, captchaToken?, website, elapsedMs }`.
 *
 * Anti-spam (diperiksa ulang di server):
 * - `website` = honeypot, tidak terlihat manusia — harus kosong;
 * - `elapsedMs` = lama formulir terbuka (jam browser sendiri) — minimal 3 detik;
 * - Cloudflare Turnstile bila `captchaSiteKey` tersedia.
 *
 * Bila captcha belum dikonfigurasi di production (`available = false`),
 * formulir tidak ditampilkan dan pengunjung diarahkan ke WhatsApp/email.
 */

type FormState = "idle" | "loading" | "success" | "error";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove?: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const fieldClass =
  "border border-cocoa/30 bg-cream px-4 py-3 text-body text-cocoa outline-none transition-colors focus:border-cocoa";

export function CorporateInquiryForm({
  captchaSiteKey,
  available,
  whatsappHref,
  contactEmail,
}: {
  captchaSiteKey: string | null;
  available: boolean;
  whatsappHref: string;
  contactEmail: string;
}) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  /* Waktu formulir tampil. Diisi di `useEffect`, bukan saat render: `Date.now()`
     saat render membuat halaman tidak bisa di-prerender (`cacheComponents`). */
  const startedAtRef = useRef<number | null>(null);
  /* Tombol kirim baru aktif setelah hidrasi: tanpa JS, submit bawaan browser
     bisa mengirim data pribadi lewat URL (GET) — jadi dicegah sama sekali. */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    startedAtRef.current = Date.now();
    setHydrated(true);
  }, []);

  /* Widget Turnstile — hanya dimuat bila site key tersedia. */
  useEffect(() => {
    if (!available || !captchaSiteKey) return;
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !widgetContainerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
        sitekey: captchaSiteKey,
        callback: (token: string) => {
          setCaptchaToken(token);
          setFieldErrors((prev) => ({ ...prev, captcha: "" }));
        },
        "expired-callback": () => setCaptchaToken(null),
        "error-callback": () =>
          setFieldErrors((prev) => ({
            ...prev,
            captcha: "Captcha gagal dimuat. Muat ulang halaman lalu coba lagi.",
          })),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderWidget);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [available, captchaSiteKey]);

  function resetCaptcha() {
    setCaptchaToken(null);
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;

    const formData = new FormData(event.currentTarget);
    const value = (name: string) => String(formData.get(name) ?? "").trim();
    const name = value("name");
    const company = value("company");
    const email = value("email");
    const phone = value("phone");
    const message = value("message");
    const website = value("website");
    const consent = formData.get("consent") === "on";

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = "Nama wajib diisi.";
    if (!email) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format email belum benar.";
    }
    if (message.length < 10) errors.message = "Pesan minimal 10 karakter.";
    if (!consent) errors.consent = "Mohon centang persetujuan ini.";
    if (captchaSiteKey && !captchaToken) {
      errors.captcha = "Mohon selesaikan captcha terlebih dahulu.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setState("error");
      setError("Mohon lengkapi isian yang masih kosong atau belum benar.");
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
          consent,
          captchaToken: captchaToken ?? undefined,
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
        setError(
          serverError ||
            "Terjadi kendala saat mengirim. Silakan coba lagi atau hubungi kami via WhatsApp.",
        );
        resetCaptcha();
        return;
      }

      setState("success");
      // Lapor ke GA4 hanya setelah server menerima (bukan sekadar klik kirim).
      window.dispatchEvent(
        new CustomEvent("kama:track", { detail: { form: "corporate_inquiry" } }),
      );
      formRef.current?.reset();
      resetCaptcha();
    } catch {
      setState("error");
      setError("Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.");
    }
  }

  if (!available) {
    return (
      <div role="status" className="flex flex-col gap-3 border border-cocoa/20 bg-cream px-6 py-8">
        <p className="text-body text-cocoa/80">
          Formulir inquiry sedang tidak tersedia. Silakan hubungi tim corporate kami langsung:
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            WhatsApp
          </a>
          <a href={`mailto:${contactEmail}`} className="btn btn-outline border-cocoa/40">
            {contactEmail}
          </a>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div role="status" className="flex flex-col gap-2 border border-cocoa/20 bg-cream px-6 py-10">
        <h3 className="font-display text-title-sm md:text-[1.375rem]">
          Terima kasih, inquiry Anda sudah terkirim.
        </h3>
        <p className="max-w-[52ch] text-body text-cocoa/70">
          Tim KAMA akan menghubungi Anda kembali pada jam operasional. Untuk hal mendesak,
          hubungi kami via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      method="post"
      onSubmit={handleSubmit}
      noValidate
      className="relative flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Nama *</span>
          <input name="name" type="text" required maxLength={120} autoComplete="name" className={fieldClass} />
          {fieldErrors.name ? <span className="text-caption text-error">{fieldErrors.name}</span> : null}
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Perusahaan</span>
          <input
            name="company"
            type="text"
            maxLength={160}
            autoComplete="organization"
            className={fieldClass}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Email *</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClass} />
          {fieldErrors.email ? <span className="text-caption text-error">{fieldErrors.email}</span> : null}
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="eyebrow text-cocoa/70">Telepon</span>
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={fieldClass} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="eyebrow text-cocoa/70">Pesan *</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder="Jumlah karyawan, jenis program (in-office / in-spa), perkiraan tanggal…"
          className={fieldClass}
        />
        {fieldErrors.message ? (
          <span className="text-caption text-error">{fieldErrors.message}</span>
        ) : null}
      </label>

      {/* Honeypot — tidak terlihat dan tidak bisa difokus oleh manusia. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <label className="flex items-start gap-3 text-body text-cocoa/80">
        <input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0" />
        <span>
          Saya setuju data di atas digunakan KAMA Spa hanya untuk menindaklanjuti inquiry ini,
          sesuai{" "}
          <Link href="/privacy-policy" className="underline">
            Kebijakan Privasi
          </Link>
          .
        </span>
      </label>
      {fieldErrors.consent ? (
        <span className="-mt-3 text-caption text-error">{fieldErrors.consent}</span>
      ) : null}

      {captchaSiteKey ? (
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!hydrated || state === "loading"}
        >
          {state === "loading" ? "Mengirim…" : "Kirim Inquiry"}
        </button>
      </div>
    </form>
  );
}
