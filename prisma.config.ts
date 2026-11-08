import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js stores secrets in .env.local; load it for the Prisma CLI too.
loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Session-mode pooler: Migrate/CLI needs a direct (non-pgbouncer) connection.
    // The app itself connects via DATABASE_URL (transaction pooler) in the adapter.
    url: env("DIRECT_URL"),
  },
});
