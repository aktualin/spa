#!/usr/bin/env bash
#
# Backup database KAMA Spa (Supabase Postgres) ke file .sql terkompresi.
#
# Pakai DIRECT_URL (port 5432), bukan pooler: pg_dump butuh koneksi langsung.
# Nilai dibaca dari .env.local bila ada, atau dari environment yang berjalan.
#
# Jalankan:  ./scripts/backup-db.sh [folder-tujuan]
# Default folder tujuan: ./backups
#
# Prasyarat: pg_dump versi 16+ (`brew install postgresql@16` di macOS).
# Restore:   gunzip -c backups/<file>.sql.gz | psql "$DIRECT_URL"

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${1:-$ROOT_DIR/backups}"
ENV_FILE="$ROOT_DIR/.env.local"

# Baca DIRECT_URL dari .env.local tanpa mengekspor seluruh isinya ke shell.
if [[ -z "${DIRECT_URL:-}" && -f "$ENV_FILE" ]]; then
  # \042 = kutip ganda, \047 = kutip tunggal — nilainya bisa dibungkus salah satu.
  DIRECT_URL="$(grep -E '^DIRECT_URL=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '\042\047')"
fi

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "DIRECT_URL belum diset (cek .env.local atau environment)." >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump tidak ditemukan. Pasang PostgreSQL client terlebih dulu." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$OUT_DIR/kamaspa-$STAMP.sql.gz"

echo "Membuat backup ke $OUT_FILE ..."
pg_dump "$DIRECT_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  | gzip -9 > "$OUT_FILE"

SIZE="$(du -h "$OUT_FILE" | cut -f1)"
echo "Selesai: $OUT_FILE ($SIZE)"
echo
echo "Restore:"
echo "  gunzip -c \"$OUT_FILE\" | psql \"\$DIRECT_URL\""
