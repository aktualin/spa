import { Badge } from "../../promos/_kit/list-ui";

export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
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
  if (sentAt) return <Badge tone="green">Email sent</Badge>;
  if (error) return <Badge tone="red">Email failed</Badge>;
  return <Badge tone="muted">Email processing</Badge>;
}
