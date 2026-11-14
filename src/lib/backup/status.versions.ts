/** Versi platform & info deploy — lihat `status.ts`. */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Prisma } from "@prisma/client";
import { version as reactVersion } from "react";

import rootPackage from "../../../package.json";

import { shortCommit } from "@/lib/domain/backup";

export type VersionRow = { name: string; installed: string | null; declared: string | null };

const TRACKED_PACKAGES = [
  "next",
  "react",
  "react-dom",
  "@prisma/client",
  "prisma",
  "@prisma/adapter-pg",
  "pg",
  "@aws-sdk/client-s3",
  "jose",
  "zod",
  "flyonui",
  "tailwindcss",
  "typescript",
] as const;

const declaredVersions: Record<string, string> = {
  ...(rootPackage.devDependencies as Record<string, string>),
  ...(rootPackage.dependencies as Record<string, string>),
};

async function installedVersion(name: string): Promise<string | null> {
  try {
    const file = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "node_modules",
      name,
      "package.json",
    );
    const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
    const version = (parsed as { version?: unknown }).version;
    return typeof version === "string" ? version : null;
  } catch {
    // Di Vercel node_modules tidak selalu ikut terbawa: pakai versi runtime/deklarasi.
    return null;
  }
}

export async function getPlatformVersions(): Promise<VersionRow[]> {
  const runtime: Record<string, string> = {
    react: reactVersion,
    "@prisma/client": Prisma.prismaVersion.client,
  };
  return Promise.all(
    TRACKED_PACKAGES.map(async (name) => ({
      name,
      installed: (await installedVersion(name)) ?? runtime[name] ?? null,
      declared: declaredVersions[name] ?? null,
    })),
  );
}

export type DeployInfo = {
  node: string;
  vercelEnv: string | null;
  commit: string | null;
  branch: string | null;
  deploymentUrl: string | null;
  region: string | null;
};

export function getDeployInfo(): DeployInfo {
  return {
    node: process.version,
    vercelEnv: process.env.VERCEL_ENV?.trim() || null,
    commit: shortCommit(process.env.VERCEL_GIT_COMMIT_SHA),
    branch: process.env.VERCEL_GIT_COMMIT_REF?.trim() || null,
    deploymentUrl: process.env.VERCEL_URL?.trim() || null,
    region: process.env.VERCEL_REGION?.trim() || null,
  };
}