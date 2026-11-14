/** Status environment (terisi/kosong saja) — lihat `status.ts`. */
import { envPresence, type EnvPresence } from "@/lib/domain/backup";
import { prisma } from "@/lib/prisma";

export type EnvGroup = { label: string; items: EnvPresence[] };

const ENV_GROUPS: { label: string; names: string[] }[] = [
  { label: "Inti", names: ["DATABASE_URL", "ADMIN_SESSION_SECRET", "NEXT_PUBLIC_SITE_URL"] },
  {
    label: "Storage (Supabase S3)",
    names: [
      "SUPABASE_S3_ENDPOINT_URL",
      "SUPABASE_S3_REGION",
      "SUPABASE_S3_BUCKET",
      "SUPABASE_S3_ACCESS_KEY_ID",
      "SUPABASE_S3_SECRET_ACCESS_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLIC_URL",
    ],
  },
  { label: "Captcha", names: ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] },
  { label: "E-mail", names: ["RESEND_API_KEY", "EMAIL_FROM", "CORPORATE_INQUIRY_TO"] },
  { label: "Instagram", names: ["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_USER_ID"] },
  {
    label: "Backup",
    names: ["BACKUP_REPORT_SECRET", "GITHUB_BACKUP_TOKEN", "GITHUB_BACKUP_REPO"],
  },
];

export async function getEnvStatus(): Promise<EnvGroup[]> {
  const groups = ENV_GROUPS.map((group) => ({
    label: group.label,
    items: envPresence(process.env, group.names),
  }));

  // GA4 diatur dari dashboard (SiteSettings), bukan env.
  let ga4 = false;
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { ga4MeasurementId: true, gscVerification: true },
    });
    ga4 = Boolean(settings?.ga4MeasurementId?.trim());
    groups.push({
      label: "Analitik & verifikasi (diatur dari dashboard)",
      items: [
        { name: "GA4 Measurement ID", set: ga4 },
        { name: "Verifikasi Google Search Console", set: Boolean(settings?.gscVerification?.trim()) },
      ],
    });
  } catch {
    groups.push({ label: "Analitik & verifikasi (diatur dari dashboard)", items: [] });
  }
  return groups;
}