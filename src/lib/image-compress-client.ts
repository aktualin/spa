import { planCompression, renameForWebp } from "@/lib/domain/image-compress";

/**
 * Perkecil/kompres gambar di browser sebelum unggah. Gagal atau hasilnya tidak
 * lebih kecil → berkas asli dikembalikan, jadi tidak pernah menghalangi unggah.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const plan = planCompression({
      type: file.type,
      size: file.size,
      width: bitmap.width,
      height: bitmap.height,
    });
    if (!plan) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = plan.width;
    canvas.height = plan.height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, plan.width, plan.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, plan.mime, plan.quality),
    );
    if (!blob || blob.type !== plan.mime || blob.size >= file.size) return file;
    return new File([blob], renameForWebp(file.name), { type: plan.mime });
  } catch {
    return file;
  }
}
