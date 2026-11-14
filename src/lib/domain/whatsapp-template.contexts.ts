/** Registry konteks template WhatsApp — lihat `whatsapp-template.ts`. */
import { CORE_CONTEXTS } from "./whatsapp-template.contexts-core.ts";
import { EXTRA_CONTEXTS } from "./whatsapp-template.contexts-extra.ts";
import type {
  WhatsAppContextDefinition,
  WhatsAppContextKey,
} from "./whatsapp-template.types.ts";

export const WHATSAPP_CONTEXTS: readonly WhatsAppContextDefinition[] = [
  ...CORE_CONTEXTS,
  ...EXTRA_CONTEXTS,
];

export const WHATSAPP_CONTEXT_KEYS: readonly WhatsAppContextKey[] =
  WHATSAPP_CONTEXTS.map((context) => context.key);

/** true bila key adalah template sistem (tidak boleh dihapus). */
export function isSystemTemplateKey(key: string): key is WhatsAppContextKey {
  return (WHATSAPP_CONTEXT_KEYS as readonly string[]).includes(key);
}

export function getContextDefinition(
  key: WhatsAppContextKey,
): WhatsAppContextDefinition {
  const found = WHATSAPP_CONTEXTS.find((context) => context.key === key);
  if (!found) throw new Error(`Konteks WhatsApp tidak dikenal: ${key}`);
  return found;
}

/** Teks bawaan sebuah konteks (pesan yang dipakai situs sebelum ada template). */
export function builtInMessage(key: WhatsAppContextKey): string {
  return getContextDefinition(key).builtIn;
}

/** Nama placeholder yang diterima sebuah konteks (termasuk alias). */
export function allowedPlaceholders(key: WhatsAppContextKey): string[] {
  const context = getContextDefinition(key);
  return [
    ...context.placeholders.map((placeholder) => placeholder.name),
    ...(context.aliases ?? []),
  ];
}

/** Nilai contoh untuk pratinjau template di admin. */
export function sampleValues(key: WhatsAppContextKey): Record<string, string> {
  const values: Record<string, string> = {};
  for (const placeholder of getContextDefinition(key).placeholders) {
    values[placeholder.name] = placeholder.sample;
  }
  return values;
}