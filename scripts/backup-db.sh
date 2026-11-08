#!/usr/bin/env bash
#
# Backup database KAMA Spa (Supabase Postgres) ke file .sql terkompresi.
#
# Pakai DIRECT_URL (port 5432, session pooler atau koneksi langsung), bukan
# transaction pooler 6543: pg_dump butuh koneksi sesi.
# Nilai dibaca dari environment, atau dari .env.local bila ada.
#
# Jalankan:  ./scripts/backup-db.sh [folder-tujuan]
# Default folder tujuan: ./backups
#
# Variabel opsional:
#   BACKUP_PASSPHRASE  bila diisi, hasil dienkripsi GPG AES-256 (.sql.gz.gpg)
#                      dan file tanpa enkripsi dihapus. Dipakai GitHub Actions.
#   PG_DUMP            path pg_dump tertentu (default: pg_dump di PATH).
#
# Setiap backup mencetak checksum SHA-256 dan menulis <file>.sha256 di
# sebelahnya. Catat checksum itu di /admin/status (backup serah terima).
#
# Prasyarat: pg_dump dengan versi >= versi server Postgres (Supabase: 15/17;
# `brew install postgresql@17` di macOS). Untuk enkripsi: gpg.
#
# Restore (ke database KOSONG/terpisah dulu untuk uji):
#   gunzip -c backups/<file>.sql.gz | psql "$DIRECT_URL"
#   gpg --decrypt backups/<file>.sql.gz.gpg | gunzip | psql "$DIRECT_URL"
#
# Isi backup memuat data pribadi (inquiry, UU PDP). Jangan pernah mengunggahnya
# ke bucket storage situs (publik) atau membagikannya tanpa enkripsi.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${1:-$ROOT_DIR/backups}"
ENV_FILE="$ROOT_DIR/.env.local"
PG_DUMP_BIN="${PG_DUMP:-pg_dump}"

# Hasil hanya bisa dibaca pemilik akun.
umask 077

# Baca DIRECT_URL dari .env.local tanpa mengekspor seluruh isinya ke shell.
if [[ -z "${DIRECT_URL:-}" && -f "$ENV_FILE" ]]; then
  # \042 = kutip ganda, \047 = kutip tunggal — nilainya bisa dibungkus salah satu.
  DIRECT_URL="$(grep -E '^DIRECT_URL=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '\042\047')"
fi

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "DIRECT_URL belum diset (cek .env.local atau environment)." >&2
  exit 1
fi

if ! command -v "$PG_DUMP_BIN" >/dev/null 2>&1; then
  echo "pg_dump tidak ditemukan. Pasang PostgreSQL client terlebih dulu." >&2
  exit 1
fi

if [[ -n "${BACKUP_PASSPHRASE:-}" ]] && ! command -v gpg >/dev/null 2>&1; then
  echo "BACKUP_PASSPHRASE diisi tetapi gpg tidak ditemukan." >&2
  exit 1
fi

sha256_of() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | cut -d' ' -f1
  else
    sha256sum "$1" | cut -d' ' -f1
  fi
}

mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$OUT_DIR/kamaspa-$STAMP.sql.gz"

# Hapus file setengah jadi bila ada langkah yang gagal.
cleanup() {
  local status=$?
  if [[ $status -ne 0 ]]; then
    rm -f "$OUT_FILE" "$OUT_FILE.gpg" "$OUT_FILE.sha256" "$OUT_FILE.gpg.sha256"
    echo "Backup GAGAL (kode $status). File setengah jadi dihapus." >&2
  fi
}
trap cleanup EXIT

echo "Membuat backup ke $OUT_FILE ..."
"$PG_DUMP_BIN" "$DIRECT_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  | gzip -9 > "$OUT_FILE"

# Cek integritas: arsip gzip utuh dan dump sampai baris penutupnya.
gzip -t "$OUT_FILE"
DUMP_TAIL="$(gunzip -c "$OUT_FILE" | tail -n 20)"
if [[ "$DUMP_TAIL" != *"PostgreSQL database dump complete"* ]]; then
  echo "Dump tidak lengkap (penanda akhir pg_dump tidak ditemukan)." >&2
  exit 1
fi

FINAL_FILE="$OUT_FILE"
if [[ -n "${BACKUP_PASSPHRASE:-}" ]]; then
  echo "Mengenkripsi (GPG AES-256) ..."
  # Passphrase lewat stdin, tidak pernah muncul di argumen proses.
  printf '%s' "$BACKUP_PASSPHRASE" | gpg --batch --yes --quiet \
    --pinentry-mode loopback --passphrase-fd 0 \
    --symmetric --cipher-algo AES256 \
    --output "$OUT_FILE.gpg" "$OUT_FILE"
  rm -f "$OUT_FILE"
  FINAL_FILE="$OUT_FILE.gpg"
fi

SHA256="$(sha256_of "$FINAL_FILE")"
SIZE_BYTES="$(wc -c < "$FINAL_FILE" | tr -d ' ')"
echo "$SHA256  $(basename "$FINAL_FILE")" > "$FINAL_FILE.sha256"

SIZE="$(du -h "$FINAL_FILE" | cut -f1)"
echo "Selesai: $FINAL_FILE ($SIZE, $SIZE_BYTES byte)"
echo "SHA-256: $SHA256"
echo "         (tersimpan juga di $FINAL_FILE.sha256)"

# Keluaran untuk langkah berikutnya di GitHub Actions.
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "file=$FINAL_FILE"
    echo "size_bytes=$SIZE_BYTES"
    echo "sha256=$SHA256"
  } >> "$GITHUB_OUTPUT"
fi

echo
echo "Cek keaslian berkas nanti:"
echo "  shasum -a 256 -c \"$FINAL_FILE.sha256\"   # dari folder yang sama"
echo "Restore (uji dulu ke database kosong/terpisah):"
if [[ "$FINAL_FILE" == *.gpg ]]; then
  echo "  gpg --decrypt \"$FINAL_FILE\" | gunzip | psql \"\$DIRECT_URL\""
else
  echo "  gunzip -c \"$FINAL_FILE\" | psql \"\$DIRECT_URL\""
fi
