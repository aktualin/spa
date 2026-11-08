/**
 * Membuat / mereset akun admin dashboard KAMA.
 *
 *   node scripts/create-admin.mjs <email> <password> [ADMIN|EDITOR] [nama]
 *
 * Dipakai sekali saat setup, dan lagi saat serah terima untuk membuat akun
 * super admin atas nama klien (kontrak Pasal 8 ayat 7).
 */
import { randomBytes, randomUUID, scrypt } from "node:crypto";
import { promisify } from "node:util";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });

const scryptAsync = promisify(scrypt);

// Harus identik dengan src/lib/password.ts
async function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(plain, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const [email, password, roleArg, ...nameParts] = process.argv.slice(2);

if (!email || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs <email> <password> [ADMIN|EDITOR] [nama]",
  );
  process.exit(1);
}

const role = (roleArg ?? "ADMIN").toUpperCase();
if (role !== "ADMIN" && role !== "EDITOR") {
  console.error(`Role tidak valid: ${role}. Pilih ADMIN atau EDITOR.`);
  process.exit(1);
}

if (password.length < 10) {
  console.error("Kata sandi minimal 10 karakter.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL belum diset di .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const name = nameParts.join(" ") || normalizedEmail.split("@")[0];

  const user = await prisma.adminUser.upsert({
    where: { email: normalizedEmail },
    create: {
      id: randomUUID(),
      email: normalizedEmail,
      name,
      passwordHash,
      role,
    },
    // Reset kunci & hitungan gagal supaya script ini juga berguna sebagai
    // "lupa password" darurat.
    update: {
      passwordHash,
      role,
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  console.log(`✔ Akun admin siap: ${user.email} (${user.role})`);
} catch (error) {
  console.error("✖ Gagal membuat akun admin:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
