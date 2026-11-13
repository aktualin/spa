"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Memicu pengiriman kampanye lewat Route Handler (bukan Server Action) —
 * supaya proses batch kirim bisa berjalan di belakang (`after()`) dan aman
 * dipanggil ulang (resume dari `NewsletterSend`) bila terputus.
 */
export function SendCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function onSend() {
    if (state === "loading") return;
    if (!window.confirm("Kirim kampanye ini ke semua subscriber aktif sekarang?")) return;

    setState("loading");
    try {
      const response = await fetch(`/api/admin/newsletter/campaigns/${campaignId}/send`, {
        method: "POST",
      });
      if (!response.ok) {
        setState("error");
        return;
      }
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <button
      type="button"
      onClick={onSend}
      disabled={state === "loading"}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
    >
      {state === "loading" ? "Mengirim…" : state === "error" ? "Gagal, coba lagi" : "Kirim sekarang"}
    </button>
  );
}
