import Script from "next/script";

import { getSiteSettings } from "@/lib/content/site";
import { normalizeGa4Id } from "@/lib/domain/site-settings";

import { AnalyticsEvents } from "./analytics-events";

/**
 * Pasang GA4 hanya bila Measurement ID diisi (Kontak & Umum) dan formatnya
 * valid. Kosong = tidak ada script sama sekali. Perubahan ID tampil tanpa
 * redeploy (pengaturan ber-cache dengan tag settings).
 */
export async function Analytics() {
  const settings = await getSiteSettings();
  const id = normalizeGa4Id(settings.ga4MeasurementId ?? "");
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
      </Script>
      <AnalyticsEvents />
    </>
  );
}
