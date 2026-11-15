import { requirePageAccess } from "../../access";
import { GuestForm } from "../guest-form";

export const instant = false;

export default async function NewGuestPage() {
  await requirePageAccess("/admin/guests/new");

  return <GuestForm />;
}
