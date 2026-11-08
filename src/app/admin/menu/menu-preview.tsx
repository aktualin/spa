"use client";

import { useState } from "react";

import { buildMenuTree, type MenuLocation, type MenuNode } from "@/lib/domain/menu";

import type { MenuAdminRow } from "../actions/menu";
import { LOCATION_LABEL } from "./menu-manager";

const TABS: MenuLocation[] = ["HEADER", "MOBILE", "FOOTER"];

function PreviewList({ nodes, depth }: { nodes: MenuNode[]; depth: number }) {
  if (nodes.length === 0) return null;
  return (
    <ul className={depth === 1 ? "space-y-2" : "mt-1 space-y-1 border-l border-neutral-200 pl-3"}>
      {nodes.map((node) => (
        <li key={node.id}>
          <span
            className={
              depth === 1
                ? "text-sm font-medium text-neutral-900"
                : node.children.length > 0
                  ? "text-xs uppercase tracking-wide text-neutral-500"
                  : "text-sm text-neutral-700"
            }
          >
            {node.label}
            {node.openInNew ? " ↗" : ""}
          </span>
          {node.href ? (
            <span className="ml-1 font-mono text-[11px] text-neutral-400">{node.href}</span>
          ) : null}
          <PreviewList nodes={node.children} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

/** Pratinjau dari susunan yang sedang diedit — sebelum disimpan. */
export function MenuPreview({ rows }: { rows: MenuAdminRow[] }) {
  const [tab, setTab] = useState<MenuLocation>("HEADER");
  const tree = buildMenuTree(rows, tab);

  return (
    <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-4 lg:sticky lg:top-4">
      <h2 className="text-sm font-semibold text-neutral-900">Pratinjau</h2>
      <p className="mt-0.5 text-xs text-neutral-500">
        Item tersembunyi dan tautan ke halaman yang hilang tidak ditampilkan, persis seperti di
        situs.
      </p>

      <div role="tablist" className="mt-3 flex gap-1 rounded-md bg-neutral-100 p-1">
        {TABS.map((location) => (
          <button
            key={location}
            type="button"
            role="tab"
            aria-selected={tab === location}
            onClick={() => setTab(location)}
            className={`flex-1 rounded px-2 py-1 text-xs ${
              tab === location ? "bg-white font-medium text-neutral-900 shadow-sm" : "text-neutral-600"
            }`}
          >
            {LOCATION_LABEL[location]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tree.length === 0 ? (
          <p className="text-sm text-neutral-500">Tidak ada item di lokasi ini.</p>
        ) : (
          <PreviewList nodes={tree} depth={1} />
        )}
      </div>
    </aside>
  );
}
