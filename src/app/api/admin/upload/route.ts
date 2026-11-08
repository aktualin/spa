import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { MediaValidationError } from "@/lib/domain/media";
import { storeMedia } from "@/lib/media";

// Proxy sudah menolak permintaan tanpa token dan POST lintas origin untuk
// /api/admin/*. Pengecekan di sini tetap wajib karena proxy tidak menyentuh
// database: akun yang sudah dinonaktifkan atau sesinya dicabut ditolak di sini.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (session.mustChangePassword) {
    return NextResponse.json(
      { error: "Ganti kata sandi terlebih dahulu." },
      { status: 403 },
    );
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
    const media = await storeMedia(file, folder, session.userId);
    return NextResponse.json({ id: media.id, url: media.url, fileName: media.fileName });
  } catch (error) {
    // Pesan validasi (tipe/ukuran/nama/isi) aman ditampilkan ke admin.
    if (error instanceof MediaValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[upload] gagal mengunggah", error);
    return NextResponse.json({ error: "Gagal mengunggah file. Coba lagi." }, { status: 500 });
  }
}
