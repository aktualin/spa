"use client";

import { useFormStatus } from "react-dom";

import type { ActionState } from "../actions/users";

export type EditUserData = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  isActive: boolean;
  isSelf: boolean;
};

export const initialState: ActionState = { error: null };

export function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
    >
      {pending ? "Menghapus…" : "Hapus akun permanen"}
    </button>
  );
}