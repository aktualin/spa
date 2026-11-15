import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { ReservationForm } from "@/components/forms/reservation-form";
import { Navigation } from "@/components/navigation";
import { Reveal } from "@/components/reveal";
import { getBranches } from "@/lib/content/branches";
import { getFormsCopy } from "@/lib/content/forms";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { getReservationServices } from "@/lib/content/reservation";
import { withPageSeo } from "@/lib/content/seo";
import { whatsAppHref } from "@/lib/content/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/reservation", {});
}

/**
 * Halaman reservasi publik — tujuan tombol "Book Now" (kartu putih hero &
 * header) dan item menu "Reservation". Form yang sama dengan section
 * reservasi `/contact`, plus pilihan treatment dari katalog; permintaan
 * masuk ke inbox admin `/admin/reservations`.
 */
export default async function ReservationPage() {
  const [branches, formsCopy, services, pageCopy, waHref] = await Promise.all([
    getBranches(),
    getFormsCopy(),
    getReservationServices(),
    getPageCopy(),
    whatsAppHref("default"),
  ]);
  const reservation = formsCopy.reservation;

  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h1 className="header-xxl">{reservation.title}</h1>
                {reservation.description ? (
                  <p className="body-m text-color-gray">{reservation.description}</p>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="mx-auto w-full max-w-[42rem]">
                <ReservationForm branches={branches} services={services} copy={reservation} />
                {waHref ? (
                  <p className="body-m text-color-gray mt-6 text-center">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cocoa underline"
                    >
                      {copy(pageCopy, "global.book_via_whatsapp")}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
