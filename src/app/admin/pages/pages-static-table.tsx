import Link from "next/link";

import { PUBLIC_STATIC_ROUTES } from "@/lib/domain/seo";

/** Tabel halaman bawaan situs: isi diatur di modul mana + tautan SEO. */
export function StaticRoutesTable() {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
          <tr>
            <th className="px-4 py-2 font-medium">Halaman</th>
            <th className="px-4 py-2 font-medium">URL</th>
            <th className="px-4 py-2 font-medium">Isi diatur di</th>
            <th className="px-4 py-2 font-medium">SEO</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {PUBLIC_STATIC_ROUTES.map((route) => (
            <tr key={route.path}>
              <td className="px-4 py-3 font-medium text-neutral-900">{route.label}</td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-600">{route.path}</td>
              <td className="px-4 py-3">
                <span className="flex flex-wrap gap-x-2 gap-y-1">
                  {route.contentModules.map((mod) => (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      className="text-neutral-700 underline-offset-2 hover:underline"
                    >
                      {mod.label}
                    </Link>
                  ))}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href="/admin/seo"
                  className="text-neutral-700 underline-offset-2 hover:underline"
                >
                  Atur SEO
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}