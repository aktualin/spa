import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LEN = 64;
const SALT_LEN = 16;

// Format tersimpan: scrypt$<saltHex>$<hashHex>. Memakai scrypt bawaan Node
// supaya tidak menambah dependency hashing (lihat 01-arsitektur-sistem.md).
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = (await scryptAsync(plain, salt, KEY_LEN)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(
    plain,
    Buffer.from(saltHex, "hex"),
    expected.length,
  )) as Buffer;

  // Panjang harus sama sebelum timingSafeEqual, kalau tidak ia melempar.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
