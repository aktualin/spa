"use client";

import { useEffect, useRef, useState } from "react";

import {
  inquiryFieldErrors,
  postInquiry,
  readInquiryValues,
  type FormState,
} from "./corporate-inquiry-helpers";
import type { CorporateFormLabels } from "./corporate-inquiry-labels";
import { useTurnstile } from "./corporate-turnstile";

/** State + submit formulir inquiry corporate, termasuk widget Turnstile. */
export function useCorporateInquiry({
  captchaSiteKey,
  available,
  labels,
}: {
  captchaSiteKey: string | null;
  available: boolean;
  labels: CorporateFormLabels;
}) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);
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

  const { widgetContainerRef, resetCaptcha } = useTurnstile({
    available,
    captchaSiteKey,
    loadErrorLabel: labels.errorCaptchaLoad,
    setCaptchaToken,
    setFieldErrors,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;

    const values = readInquiryValues(new FormData(event.currentTarget));
    const errors = inquiryFieldErrors(
      values,
      { required: Boolean(captchaSiteKey), token: captchaToken },
      labels,
    );

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setState("error");
      setError(labels.errorIncomplete);
      return;
    }

    setState("loading");
    setError(null);

    try {
      const elapsedMs =
        startedAtRef.current === null ? undefined : Date.now() - startedAtRef.current;
      const result = await postInquiry(values, captchaToken, elapsedMs);

      if (!result.ok) {
        setState("error");
        setError(result.serverError || labels.errorSend);
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
      setError(labels.errorNetwork);
    }
  }

  return { state, error, fieldErrors, hydrated, formRef, widgetContainerRef, handleSubmit };
}