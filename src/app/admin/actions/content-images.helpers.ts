import { z } from "zod";

import { MAX_CONTENT_IMAGES } from "@/lib/domain/content-image";

export { CONTENT_ROLES } from "@/lib/domain/roles";

export const rowsSchema = z
  .array(
    z.object({
      // Hanya URL yang disimpan; file-nya ada di Supabase Storage.
      imageUrl: z.string().trim().url("URL gambar tidak valid."),
      altText: z
        .string()
        .trim()
        .max(160, "Teks alt maksimal 160 karakter.")
        .nullish(),
    }),
  )
  .max(MAX_CONTENT_IMAGES, `Maksimal ${MAX_CONTENT_IMAGES} gambar per konten.`);