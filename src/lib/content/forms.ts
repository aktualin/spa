/**
 * Bacaan teks formulir reservasi dari ContentBlock
 * (grup "forms" di /admin/page-copy). Tanpa fallback statis: blok yang
 * belum diisi bernilai kosong dan form menampilkan label kosong sampai
 * admin mengisinya (seed mengisi nilai awal berbahasa Indonesia).
 */
import { cacheLife, cacheTag } from "next/cache";

import type { ReservationCopy } from "@/lib/domain/forms";

import { copy, getPageCopy } from "./page-copy";
import { CONTENT_TAGS } from "./tags";

export type FormsCopy = { reservation: ReservationCopy };

export async function getFormsCopy(): Promise<FormsCopy> {
  "use cache";
  cacheTag(CONTENT_TAGS.pageCopy);
  const blocks = await getPageCopy();
  const text = (key: string) => copy(blocks, key);
  cacheLife("hours");
  return {
    reservation: {
      title: text("forms.reservation.title"),
      description: text("forms.reservation.description"),
      nameLabel: text("forms.reservation.name_label"),
      phoneLabel: text("forms.reservation.phone_label"),
      emailLabel: text("forms.reservation.email_label"),
      branchLabel: text("forms.reservation.branch_label"),
      messageLabel: text("forms.reservation.message_label"),
      submitLabel: text("forms.reservation.submit_label"),
      success: text("forms.reservation.success"),
      error: text("forms.reservation.error"),
    },
  };
}
