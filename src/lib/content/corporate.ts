/**
 * Bacaan publik Corporate Wellness untuk halaman `/corporate`.
 *
 * Yang dibaca HANYA konten: `CorporateContent` (singleton), `CorporateProgram`,
 * `CorporateStep`, dan `CorporateClient` yang tayang. `CorporateInquiry` berisi
 * data pribadi (UU PDP) dan TIDAK BOLEH diakses dari kode publik/cache publik.
 *
 * Tanpa fallback statis: tabel kosong atau database tidak terbaca → bagian
 * itu kosong dan halaman menyembunyikannya. Isi awalnya dipasang lewat
 * `scripts/seed.mts`, bukan ditanam di kode render.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  type CollabPhoto,
  type CorporateClientItem,
  type CorporatePageContent,
  type CorporateProgramItem,
  type CorporateStepItem,
  collabPhotosFor,
} from "@/lib/domain/corporate";

import {
  readCorporateClients,
  readCorporateContent,
  readCorporatePrograms,
  readCorporateSteps,
} from "./corporate.queries";
import { copy, getPageCopy } from "./page-copy";
import { CONTENT_TAGS } from "./tags";

export type {
  CollabPhoto,
  CorporateClientItem,
  CorporatePageContent,
  CorporateProgramItem,
  CorporateStepItem,
};

export type CorporatePageData = {
  content: CorporatePageContent;
  programs: CorporateProgramItem[];
  steps: CorporateStepItem[];
  /** Klien tayang (logo/nama). Kosong bila belum ada klien. */
  clients: CorporateClientItem[];
  /** Foto dokumentasi "Past Collaborations". */
  collabPhotos: CollabPhoto[];
};

export async function getCorporatePageData(): Promise<CorporatePageData> {
  "use cache";
  cacheTag(CONTENT_TAGS.corporate);

  const [content, programs, steps, clients, pageCopy] = await Promise.all([
    readCorporateContent(),
    readCorporatePrograms(),
    readCorporateSteps(),
    readCorporateClients(),
    getPageCopy(),
  ]);

  const usedFallback =
    content.usedFallback || programs.usedFallback || steps.usedFallback || clients.usedFallback;
  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");

  return {
    content: content.data,
    programs: programs.data,
    steps: steps.data,
    clients: clients.data ?? [],
    collabPhotos: collabPhotosFor(
      clients.data,
      copy(pageCopy, "corporate.collab_alt_suffix"),
    ),
  };
}