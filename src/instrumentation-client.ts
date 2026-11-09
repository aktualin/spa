/**
 * Navigasi client-side App Router tidak terlihat oleh proxy: Next membuang
 * header `next-router-prefetch`/RSC sebelum middleware berjalan. Hook ini
 * dipanggil hanya saat navigasi benar-benar dimulai (bukan prefetch), lalu
 * mengirim beacon ke route analitik first-party.
 */
const PAGE_VIEW_ENDPOINT = "/api/analytics/view";

export function onRouterTransitionStart(url: string): void {
  let target: URL;
  try {
    target = new URL(url, window.location.origin);
  } catch {
    return;
  }
  if (target.origin !== window.location.origin) return;

  const body = JSON.stringify({ path: target.pathname });
  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(
      PAGE_VIEW_ENDPOINT,
      new Blob([body], { type: "application/json" }),
    );
    return;
  }

  void fetch(PAGE_VIEW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Analitik tidak boleh memunculkan error ke pengunjung.
  });
}
