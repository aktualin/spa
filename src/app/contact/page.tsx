import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { getBranches } from "@/lib/content/branches";
import { getFormsCopy } from "@/lib/content/forms";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { getSiteSettings } from "@/lib/content/site";
import { branchWhatsAppHref } from "@/lib/content/whatsapp";
import { ContactLocations } from "./contact-locations";
import { ContactReservation } from "./contact-reservation";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/contact", {});
}

export default async function ContactPage() {
  // Cabang dikelola di modul Cabang; alamat, jam, nomor, peta, dan koordinat
  // per cabang. Nomor/jam yang dikosongkan per cabang mengikuti Kontak & Umum.
  const [branches, settings, pageCopy, formsCopy] = await Promise.all([
    getBranches(),
    getSiteSettings(),
    getPageCopy(),
    getFormsCopy(),
  ]);
  // Link WA per cabang (template "location" + alamat); null bila belum ada
  // nomor di cabang maupun di pengaturan situs → tombol kartu disembunyikan.
  const branchWaHrefs = await Promise.all(
    branches.map((branch) =>
      branchWhatsAppHref({
        address: branch.address,
        whatsappNumber: branch.whatsappNumber,
      }),
    ),
  );
  const ctaHref = copy(pageCopy, "contact.cta_href") || "/menu";
  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h1 className="header-xxl">{copy(pageCopy, "contact.hero.title")}</h1>
                {copy(pageCopy, "contact.hero.description") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "contact.hero.description")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>

        <ContactLocations
          branches={branches}
          branchWaHrefs={branchWaHrefs}
          settings={settings}
          pageCopy={pageCopy}
        />
        <ContactReservation reservation={formsCopy.reservation} branches={branches} />

        <Reveal as="section" className="section_get-in-touch is-top-off">
          <div className="get-in-touch_container">
            <div className="get-in-touch_banner">
              <h4 className="header-l">{copy(pageCopy, "contact.cta.title")}</h4>
              <Link
                href={ctaHref}
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>{copy(pageCopy, "contact.cta.label")}</div>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}