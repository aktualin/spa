import { NewUserForm } from "../user-form";
import { requireAdminPage } from "../guard";

export const instant = false;

export default async function NewUserPage() {
  await requireAdminPage();

  return <NewUserForm />;
}
