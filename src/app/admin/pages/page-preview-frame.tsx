"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PREVIEW_MESSAGE_TYPE, type PageDraft } from "@/lib/domain/page-preview";

import { secondaryButtonClass } from "../promos/_kit/form-ui";

type Device = "desktop" | "mobile";

const STATUS_LABEL: Record<PageDraft["status"], string> = {
  DRAFT: "Draf",
  PUBLISHED: "Terbit",
};

/**
 * Panel pratinjau (kolom kanan editor): iframe ke /preview/halaman yang
 * menerima draft belum tersimpan via postMessage (debounce 300 ms), plus
 * toggle lebar desktop/mobile untuk mengecek tampilan responsif.
 */
export function PagePreviewFrame({ draft }: { draft: PageDraft }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [ready, setReady] = useState(false);

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGE_TYPE, draft },
      window.location.origin,
    );
  }, [draft]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(send, 300);
    return () => clearTimeout(timer);
  }, [send, ready]);

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
        <p className="text-xs text-neutral-500">
          <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
            Pratinjau — belum tersimpan
          </span>
          status: {STATUS_LABEL[draft.status]}
        </p>
        <div className="flex gap-1.5">
          {(["desktop", "mobile"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDevice(option)}
              aria-pressed={device === option}
              className={
                device === option
                  ? "rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white"
                  : secondaryButtonClass
              }
            >
              {option === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </div>
      <div
        className={
          device === "mobile"
            ? "mx-auto h-[70vh] w-[390px] max-w-full border-x border-neutral-200"
            : "h-[70vh]"
        }
      >
        <iframe
          ref={frameRef}
          title="Pratinjau halaman"
          src="/preview/halaman"
          onLoad={() => {
            setReady(true);
            send();
          }}
          className="h-full w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
