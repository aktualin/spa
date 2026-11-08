import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

// Upload hanya untuk admin yang sudah login. Middleware tidak mencakup
// /api/*, jadi pengecekan sesi di sini wajib.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  const folder = String(formData.get("folder") ?? "misc");

  try {
    const { url, key } = await uploadImage(file, folder);
    return NextResponse.json({ url, key });
  } catch (error) {
    // Pesan validasi (tipe/ukuran) aman ditampilkan ke admin.
    const message =
      error instanceof Error ? error.message : "Gagal mengunggah file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
