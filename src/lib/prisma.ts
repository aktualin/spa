import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma 7 tidak lagi membaca `url` dari schema.prisma — koneksi runtime wajib
// lewat driver adapter. DATABASE_URL memakai transaction pooler (:6543);
// DIRECT_URL (:5432) hanya dipakai Migrate lewat prisma.config.ts.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum diset di .env.local");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// Dev server melakukan hot reload berkali-kali; tanpa cache global setiap reload
// membuka pool koneksi baru dan dengan cepat menghabiskan kuota pooler Supabase.
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
