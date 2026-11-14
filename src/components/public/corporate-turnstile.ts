"use client";

import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

import { TURNSTILE_SCRIPT_ID, TURNSTILE_SRC } from "./corporate-turnstile-api";

/**
 * Widget Turnstile — hanya dimuat bila site key tersedia. Setter state
 * diteruskan apa adanya (stabil) supaya efek tidak berjalan ulang tiap
 * render; token mengisi state captcha, error memunculkan pesan di field.
 */
export function useTurnstile({
  available,
  captchaSiteKey,
  loadErrorLabel,
  setCaptchaToken,
  setFieldErrors,
}: {
  available: boolean;
  captchaSiteKey: string | null;
  loadErrorLabel: string;
  setCaptchaToken: Dispatch<SetStateAction<string | null>>;
  setFieldErrors: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

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
            captcha: loadErrorLabel,
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
  }, [available, captchaSiteKey, loadErrorLabel]);

  function resetCaptcha() {
    setCaptchaToken(null);
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  return { widgetContainerRef, resetCaptcha };
}