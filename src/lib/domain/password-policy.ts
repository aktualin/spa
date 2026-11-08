export const MIN_PASSWORD_LENGTH = 12;
// Batas atas mencegah input raksasa membuat scrypt memakan CPU berlebihan.
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Syarat dasar setiap kata sandi admin (dibuat ADMIN, di-reset, atau diganti
 * sendiri). Mengembalikan pesan galat, atau null bila boleh dipakai.
 * `subject` mengawali pesan, mis. "Kata sandi baru".
 */
export function validatePasswordStrength(
  password: string,
  options: { email?: string; subject?: string } = {},
): string | null {
  const subject = options.subject ?? "Kata sandi";

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `${subject} minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `${subject} maksimal ${MAX_PASSWORD_LENGTH} karakter.`;
  }
  if (password.trim().length === 0) {
    return `${subject} tidak boleh hanya berisi spasi.`;
  }

  const email = options.email?.trim().toLowerCase();
  if (email) {
    const lowered = password.trim().toLowerCase();
    const localPart = email.split("@")[0] ?? "";
    if (lowered === email || (localPart.length > 0 && lowered === localPart)) {
      return `${subject} tidak boleh sama dengan alamat email.`;
    }
  }
  return null;
}

/** Mengembalikan pesan galat, atau null bila kata sandi baru boleh dipakai. */
export function validateNewPassword(input: {
  newPassword: string;
  confirmPassword: string;
  currentPassword?: string;
  email?: string;
}): string | null {
  const { newPassword, confirmPassword, currentPassword, email } = input;

  const strengthError = validatePasswordStrength(newPassword, {
    email,
    subject: "Kata sandi baru",
  });
  if (strengthError) return strengthError;

  if (newPassword !== confirmPassword) {
    return "Konfirmasi kata sandi tidak sama.";
  }
  if (currentPassword !== undefined && newPassword === currentPassword) {
    return "Kata sandi baru harus berbeda dari kata sandi lama.";
  }
  return null;
}

// Tanpa huruf/angka yang mudah tertukar saat dibacakan (0/O, 1/l/I).
const TEMP_PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/**
 * Kata sandi sementara acak (kriptografis) untuk akun baru atau reset, dalam
 * kelompok 4 karakter, mis. "Hk7p-3Rta-..."; 16 karakter acak ≈ 93 bit.
 * Hanya ditampilkan sekali ke ADMIN; pemilik akun wajib menggantinya.
 */
export function generateTemporaryPassword(groups = 4, groupSize = 4): string {
  const size = TEMP_PASSWORD_ALPHABET.length;
  // Tolak byte di atas kelipatan terbesar `size` supaya distribusinya rata.
  const limit = 256 - (256 % size);
  const chars: string[] = [];
  const total = groups * groupSize;

  while (chars.length < total) {
    const bytes = new Uint8Array(total * 2);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= limit) continue;
      chars.push(TEMP_PASSWORD_ALPHABET[byte % size]);
      if (chars.length === total) break;
    }
  }

  const parts: string[] = [];
  for (let i = 0; i < total; i += groupSize) {
    parts.push(chars.slice(i, i + groupSize).join(""));
  }
  return parts.join("-");
}
