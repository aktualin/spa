import {
  parseJournalTags,
  resolveJournalSchedule,
  resolveJournalSlug,
  type ScheduleResult,
} from "@/lib/domain/journal";

import { firstIssue, parseWibInput, text } from "../promos/_kit/schema";
import { postSchema } from "./journal.helpers";

type PostData = ReturnType<typeof postSchema.parse>;
type Schedule = Extract<ScheduleResult, { ok: true }>;

/** Validasi isian form artikel (murni, tanpa akses DB). */
export function validatePostForm(
  formData: FormData,
):
  | { ok: true; id: string; data: PostData; tags: string[]; schedule: Schedule; now: Date }
  | { ok: false; error: string } {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  const publishedAtInput = parseWibInput(text(formData, "publishedAt"));
  if (publishedAtInput === undefined) {
    return { ok: false, error: "Tanggal publikasi tidak valid." };
  }

  const parsed = postSchema.safeParse({
    // Slug boleh kosong → dibuat otomatis dari judul.
    slug: resolveJournalSlug(String(formData.get("slug") ?? ""), title),
    title,
    excerpt: text(formData, "excerpt"),
    bodyHtml: text(formData, "bodyHtml"),
    coverUrl: text(formData, "coverUrl"),
    categoryId: text(formData, "categoryId"),
    status: text(formData, "status") ?? "DRAFT",
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const data = parsed.data;

  const tags = parseJournalTags(text(formData, "tags") ?? "");
  if (tags.error) return { ok: false, error: tags.error };

  const now = new Date();
  const schedule = resolveJournalSchedule(data.status, publishedAtInput, now);
  if (!schedule.ok) return { ok: false, error: schedule.error };

  return { ok: true, id, data, tags: tags.tags, schedule, now };
}