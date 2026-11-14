import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { isCaptchaConfigured } from "@/lib/captcha";
import { getCorporatePageData } from "@/lib/content/corporate";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { corporateWhatsAppHref } from "@/lib/content/whatsapp";
import { CorporateBenefits } from "./corporate-benefits";
import { CorporateHero } from "./corporate-hero";
import { CorporateInOffice } from "./corporate-in-office";
import { CorporateInSpa } from "./corporate-in-spa";
import { CorporateInquiry } from "./corporate-inquiry";
import { CorporateSteps } from "./corporate-steps";

/*
 * Halaman Corporate Wellness (desain asli). Isi dibaca dari database lewat
 * `getCorporatePageData()` dengan fallback statis identik — tampilan tidak
 * berubah sebelum admin mengubah apa pun. `/corporate-wellness` dialihkan ke
 * sini, jadi override SEO lama untuk path itu tetap dipakai bila `/corporate`
 * belum punya override sendiri.
 */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/corporate", await withPageSeo("/corporate-wellness", {}));
}

export default async function CorporatePage() {
  const [{ content, programs, steps, clients, collabPhotos }, pageCopy] =
    await Promise.all([getCorporatePageData(), getPageCopy()]);
  // Nomor PIC menang, lalu nomor situs; keduanya kosong → tombol disembunyikan.
  const picWhatsApp = await corporateWhatsAppHref(content.pic.phone);
  const privacyHref = copy(pageCopy, "corporate.privacy_href") || "/privacy-policy";
  // Captcha wajib di production: tanpa key lengkap formulir diganti kontak langsung
  // (server juga menolak kiriman — fail-closed).
  const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
  const formAvailable = process.env.NODE_ENV !== "production" || isCaptchaConfigured();

  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <CorporateHero content={content} pageCopy={pageCopy} />
        <CorporateBenefits content={content} pageCopy={pageCopy} />
        <CorporateInOffice content={content} programs={programs} pageCopy={pageCopy} />
        <CorporateInSpa content={content} pageCopy={pageCopy} />
        <CorporateSteps
          content={content}
          steps={steps}
          clients={clients}
          collabPhotos={collabPhotos}
          pageCopy={pageCopy}
        />
        <CorporateInquiry
          content={content}
          pageCopy={pageCopy}
          picWhatsApp={picWhatsApp}
          privacyHref={privacyHref}
          captchaSiteKey={captchaSiteKey}
          formAvailable={formAvailable}
        />
      </main>
      <Footer />
    </>
  );
}