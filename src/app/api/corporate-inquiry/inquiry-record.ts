import type { InquiryInput } from "@/lib/domain/inquiry";
import { stripTags } from "@/lib/domain/sanitize";

/** Field inquiry siap simpan — strip tags + trim; opsional kosong jadi null. */
export function toInquiryRecord(data: InquiryInput) {
  return {
    name: stripTags(data.name).trim(),
    company: data.company ? stripTags(data.company).trim() || null : null,
    email: stripTags(data.email).trim(),
    phone: data.phone ? stripTags(data.phone).trim() || null : null,
    message: stripTags(data.message).trim(),
  };
}