/**
 * Aturan program membership (`MembershipProgram`): nilai bawaan dari konten
 * statis lama, pembacaan kolom JSON yang aman, dan validasi isian admin.
 * Modul murni — diuji langsung dengan `node --test`.
 * Implementasinya dipecah ke berkas `membership.*.ts` di folder ini; berkas
 * ini hanya mengekspor ulang simbol publiknya.
 */

export type {
  ProgramBenefit,
  ProgramService,
  MembershipProgramData,
} from "./membership.types.ts";
export { staticMembershipProgram } from "./membership.types.ts";
export { readBenefits, readServices } from "./membership.read.ts";
export { PROGRAM_LIMITS, type ProgramInput } from "./membership.limits.ts";
export { validateProgramInput } from "./membership.validate.ts";