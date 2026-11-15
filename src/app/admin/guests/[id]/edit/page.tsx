import { notFound } from "next/navigation";

import { getGuestById } from "../../../actions/guests";
import { requirePageAccess } from "../../../access";
import { GuestForm, type GuestFormValues } from "../../guest-form";

export const instant = false;

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAccess("/admin/guests");

  const { id } = await params;
  const guest = await getGuestById(id);
  if (!guest) notFound();

  const values: GuestFormValues = {
    id: guest.id,
    nama: guest.nama ?? "",
    umur: guest.umur !== null ? String(guest.umur) : "",
    jenisKelamin: guest.jenisKelamin ?? "",
    attributes: guest.attributes.map((attr) => ({
      key: attr.key,
      value: attr.value ?? "",
    })),
  };

  return <GuestForm guest={values} />;
}
