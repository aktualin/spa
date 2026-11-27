import type { ActionState } from "../actions/journal";

export type JournalFormData = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverUrl: string;
  categoryId: string;
  tags: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  /** Artikel sedang tampil di website (menentukan peringatan ganti slug). */
  isPublic: boolean;
};

export const initialState: ActionState = { error: null };

export const statusLabel: Record<JournalFormData["status"], string> = {
  DRAFT: "Draft — not shown on the website",
  SCHEDULED: "Scheduled — publishes automatically on its date",
  PUBLISHED: "Published — shown on the website",
};

export const scheduleHint: Record<JournalFormData["status"], string> = {
  DRAFT: "Optional as a plan; draft articles are never shown.",
  SCHEDULED:
    "Required. The article appears automatically at this time (WIB) without needing to be saved again. If the date has already passed, the article publishes immediately.",
  PUBLISHED:
    "Leave empty to use the current time. If a future date is entered, the article automatically becomes Scheduled.",
};