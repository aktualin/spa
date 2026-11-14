"use client";

import { useState } from "react";

import { secondaryButtonClass } from "../promos/_kit/form-ui";

/** Tombol salin URL publik berkas ke clipboard. */
export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={secondaryButtonClass}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Salin URL berikut:", url);
        }
      }}
    >
      {copied ? "URL tersalin" : "Salin URL"}
    </button>
  );
}