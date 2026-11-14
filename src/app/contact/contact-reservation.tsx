import { ReservationForm } from "@/components/forms/reservation-form";
import { Reveal } from "@/components/reveal";
import type { Branch } from "@/lib/content/branches";
import type { ReservationCopy } from "@/lib/domain/forms";

/**
 * Reservasi — form sungguhan ke /api/reservation; judul & deskripsi dari CB
 * grup "forms", pilihan cabang dari modul Cabang.
 */
export function ContactReservation({
  reservation,
  branches,
}: {
  reservation: ReservationCopy;
  branches: Branch[];
}) {
  if (!reservation.title && !reservation.description) return null;

  return (
    <Reveal as="section" id="reservation" className="padding-section-global home-locations">
      <div className="padding-global">
        <div className="container-large">
          <div className="corporate-split">
            <div style={{ maxWidth: "34rem" }}>
              {reservation.title ? (
                <h2 className="header-l">{reservation.title}</h2>
              ) : null}
              <div className="spacer-small" />
              {reservation.description ? (
                <p className="body-m text-color-gray">{reservation.description}</p>
              ) : null}
            </div>
            <div className="min-w-0">
              <ReservationForm branches={branches} copy={reservation} />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}