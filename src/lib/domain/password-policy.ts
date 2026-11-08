export const MIN_PASSWORD_LENGTH = 12;
// Batas atas mencegah input raksasa membuat scrypt memakan CPU berlebihan.
export const MAX_PASSWORD_LENGTH = 128;

/** Mengembalikan pesan galat, atau null bila kata sandi baru boleh dipakai. */
export function validateNewPassword(input: {
  newPassword: string;
  confirmPassword: string;
  currentPassword?: string;
}): string | null {
  const { newPassword, confirmPassword, currentPassword } = input;

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `Kata sandi baru minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (newPassword.length > MAX_PASSWORD_LENGTH) {
    return `Kata sandi baru maksimal ${MAX_PASSWORD_LENGTH} karakter.`;
  }
  if (newPassword.trim().length === 0) {
    return "Kata sandi baru tidak boleh hanya berisi spasi.";
  }
  if (newPassword !== confirmPassword) {
    return "Konfirmasi kata sandi tidak sama.";
  }
  if (currentPassword !== undefined && newPassword === currentPassword) {
    return "Kata sandi baru harus berbeda dari kata sandi lama.";
  }
  return null;
}
