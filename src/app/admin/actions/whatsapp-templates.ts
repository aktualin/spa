/**
 * Server Action modul Template WhatsApp (bagian dari Kontak & Umum).
 *
 * Template dikunci per konteks (default, treatment, package, promo, gift,
 * membership, retail — lihat `WHATSAPP_CONTEXTS`). Key sistem tidak bisa
 * diganti atau dihapus; isi pesan divalidasi (panjang, placeholder dikenal).
 * Setiap perubahan memanggil `updateTag(CONTENT_TAGS.settings)` sehingga
 * tombol WhatsApp publik langsung memakai pesan baru tanpa redeploy.
 *
 * Barrel: implementasi dipecah ke modul saudara per tanggung jawab.
 */

export type { WhatsAppTemplateActionState } from "./whatsapp-templates.helpers";
export {
  saveWhatsAppTemplateAction,
  seedWhatsAppTemplatesAction,
  deleteWhatsAppTemplateAction,
} from "./whatsapp-templates.mutations";
export { listWhatsAppTemplateRows, getSettingsWhatsAppNumber } from "./whatsapp-templates.queries";