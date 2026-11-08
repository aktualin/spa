"use client";

import { useEffect } from "react";

import {
  TRACK_EVENT_FORM,
  TRACK_EVENT_WHATSAPP,
  TRACK_WINDOW_EVENT,
  isWhatsAppHref,
  safeTrackLabel,
} from "@/lib/domain/analytics";

type Gtag = (command: "event", name: string, params: Record<string, string>) => void;

function send(name: string, params: Record<string, string>) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}

/**
 * Melacak klik WhatsApp (tautan `wa.me`, konteks dari `data-wa-context`) dan
 * submit formulir (`data-track-form`, atau event `kama:track` dari form yang
 * baru melapor setelah sukses). Hanya label konteks yang dikirim.
 */
export function AnalyticsEvents() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || !isWhatsAppHref(anchor.getAttribute("href"))) return;
      send(TRACK_EVENT_WHATSAPP, {
        context: safeTrackLabel(anchor.getAttribute("data-wa-context")),
        page_path: window.location.pathname,
      });
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      const label = form?.getAttribute?.("data-track-form");
      if (!label) return;
      send(TRACK_EVENT_FORM, { form: safeTrackLabel(label), page_path: window.location.pathname });
    }

    function onCustom(event: Event) {
      const detail = (event as CustomEvent<{ form?: string }>).detail;
      send(TRACK_EVENT_FORM, {
        form: safeTrackLabel(detail?.form),
        page_path: window.location.pathname,
      });
    }

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    window.addEventListener(TRACK_WINDOW_EVENT, onCustom);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener(TRACK_WINDOW_EVENT, onCustom);
    };
  }, []);

  return null;
}
