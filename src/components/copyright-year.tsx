"use client";

import { useEffect, useState } from "react";

/**
 * Prints the DB-provided copyright text with the current year substituted for
 * `{year}`. The year is resolved on the client so the server never touches a
 * dynamic API (the site runs with Cache Components).
 */
export function CopyrightYear({ text }: { text: string }) {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (!text) return null;

  return (
    <span suppressHydrationWarning>
      {text.replaceAll("{year}", year ? String(year) : "")}
    </span>
  );
}
