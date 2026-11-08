import { Badge } from "../../promos/_kit/list-ui";

export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Sudah dihubungi",
  CLOSED: "Ditutup",
};

export function InquiryStatusBadge({ status }: { status: string }) {
  const tone = status === "NEW" ? "amber" : status === "CLOSED" ? "muted" : "blue";
  return <Badge tone={tone}>{INQUIRY_STATUS_LABEL[status] ?? status}</Badge>;
}

/** Status email notifikasi ke pihak pertama. */
export function EmailStatusBadge({
  sentAt,
  error,
}: {
  sentAt: Date | null;
  error: string | null;
}) {
  if (sentAt) return <Badge tone="green">Email terkirim</Badge>;
  if (error) return <Badge tone="red">Email gagal</Badge>;
  return <Badge tone="muted">Email diproses</Badge>;
}
