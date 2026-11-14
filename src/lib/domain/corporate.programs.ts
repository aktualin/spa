/** Validasi program & langkah kolaborasi corporate — lihat `corporate.ts`. */
import {
  CORPORATE_LIMITS,
  checkList,
  cleanList,
  readImageUrl,
  type Validation,
} from "./corporate.validation.ts";
import { richTextLength } from "./rich-text.ts";
import { collapseSpaces } from "./text.ts";

export type ProgramData = {
  name: string;
  description: string | null;
  features: string[];
  imageUrl: string | null;
  isPublished: boolean;
};

export function validateProgramInput(input: {
  name: string;
  description: string;
  features: readonly string[];
  imageUrl: string;
  isPublished: boolean;
}): Validation<ProgramData> {
  const name = collapseSpaces(input.name);
  if (!name) return { ok: false, error: "Nama program wajib diisi." };
  if (name.length > CORPORATE_LIMITS.programName) {
    return { ok: false, error: `Nama program maksimal ${CORPORATE_LIMITS.programName} karakter.` };
  }
  const description = input.description.trim();
  if (richTextLength(description) > CORPORATE_LIMITS.programDescription) {
    return {
      ok: false,
      error: `Deskripsi maksimal ${CORPORATE_LIMITS.programDescription} karakter.`,
    };
  }
  const features = cleanList(input.features);
  const featureError = checkList(features, "fitur", CORPORATE_LIMITS.maxFeatures);
  if (featureError) return { ok: false, error: featureError };
  const image = readImageUrl(input.imageUrl);
  if (!image.ok) return image;

  return {
    ok: true,
    data: {
      name,
      description: description || null,
      features,
      imageUrl: image.data,
      isPublished: input.isPublished,
    },
  };
}

export function validateStepInput(input: {
  title: string;
  body: string;
}): Validation<{ title: string; body: string | null }> {
  const title = collapseSpaces(input.title);
  const body = input.body.trim();
  if (!title) return { ok: false, error: "Judul langkah wajib diisi." };
  if (title.length > CORPORATE_LIMITS.stepTitle) {
    return { ok: false, error: `Judul langkah maksimal ${CORPORATE_LIMITS.stepTitle} karakter.` };
  }
  if (richTextLength(body) > CORPORATE_LIMITS.stepBody) {
    return { ok: false, error: `Keterangan langkah maksimal ${CORPORATE_LIMITS.stepBody} karakter.` };
  }
  return { ok: true, data: { title, body: body || null } };
}