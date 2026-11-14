/**
 * Aturan modul Corporate Wellness: isi bawaan halaman `/corporate` (sama
 * persis dengan desain lama), penggabungan data database + fallback statis,
 * validasi isian admin, urutan ↑/↓, anti-spam formulir inquiry, dan isi email
 * notifikasi ke pihak pertama.
 *
 * Modul murni (tanpa I/O, tanpa Next/Prisma) supaya bisa diuji langsung
 * dengan `node --test`. Implementasinya dipecah ke berkas `corporate.*.ts`
 * di folder ini; berkas ini hanya mengekspor ulang simbol publiknya.
 */

export type {
  CorporateSolution,
  CorporatePic,
  CorporatePageContent,
  CorporateProgramItem,
  CorporateStepItem,
  CorporateClientItem,
  CollabPhoto,
  CorporateContentRow,
} from "./corporate.types.ts";
export {
  STATIC_HERO_TITLE,
  STATIC_INTRO,
  STATIC_IN_SPA_DESCRIPTION,
  STATIC_IN_SPA_HTML,
  STATIC_IN_SPA_ITEMS,
  STATIC_STEPS,
  STATIC_PIC,
  staticCorporateContent,
  staticCorporatePrograms,
  staticCorporateSteps,
} from "./corporate.static.ts";
export {
  hasVisibleText,
  readSolutions,
  emptyCorporateContent,
  resolveCorporateContent,
} from "./corporate.content.ts";
export {
  CORPORATE_LIMITS,
  type Validation,
  cleanList,
  readImageUrl,
} from "./corporate.validation.ts";
export {
  parseSolutionsInput,
  type ContentInput,
  type ContentData,
  validateContentInput,
  optionalHtml,
} from "./corporate.content-input.ts";
export { isEmail, isPhone, validatePicInput } from "./corporate.pic.ts";
export {
  type ProgramData,
  validateProgramInput,
  validateStepInput,
} from "./corporate.programs.ts";
export {
  normalizeWebsiteUrl,
  type ClientData,
  validateClientInput,
} from "./corporate.clients.ts";
export { collabPhotosFor } from "./corporate.collab.ts";
export {
  type SortRow,
  reorderUpdates,
  nextSortOrder,
  readDirection,
} from "./corporate.sort.ts";
export {
  MIN_INQUIRY_FILL_MS,
  MAX_INQUIRY_BODY,
  checkFillTime,
  resolveCaptchaPolicy,
  resolveInquiryRecipients,
} from "./corporate.inquiry.ts";
export {
  escapeHtml,
  type InquiryEmailInput,
  buildInquiryEmail,
} from "./corporate.email.ts";