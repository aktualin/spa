"use client";

import { useState } from "react";

import { secondaryButtonClass } from "../../promos/_kit/form-ui";
import { SolutionBlock, type Block } from "./solutions-block";

/**
 * Editor blok "Why Partner with KAMA?" (solutions): judul + poin (satu poin
 * per baris). Dikirim sebagai `solutionTitle` & `solutionItems` berpasangan.
 */
export function SolutionsField({
  defaultValue,
  max,
}: {
  defaultValue: { title: string; items: string[] }[];
  max: number;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    defaultValue.map((block, index) => ({
      key: `b${index}`,
      title: block.title,
      items: block.items.join("\n"),
    })),
  );
  const [counter, setCounter] = useState(blocks.length);

  function patch(key: string, change: Partial<Block>) {
    setBlocks((current) => current.map((b) => (b.key === key ? { ...b, ...change } : b)));
  }

  function move(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700">
        Solution blocks (&quot;Why Partner with KAMA?&quot;)
      </legend>
      <p className="text-xs text-neutral-500">
        Each block is shown as one card. Write one point per line. Delete all blocks to
        fall back to the default content.
      </p>

      {blocks.map((block, index) => (
        <SolutionBlock
          key={block.key}
          block={block}
          index={index}
          count={blocks.length}
          patch={patch}
          move={move}
          remove={(key) => setBlocks((current) => current.filter((b) => b.key !== key))}
        />
      ))}

      <button
        type="button"
        disabled={blocks.length >= max}
        onClick={() => {
          setBlocks((current) => [...current, { key: `n${counter}`, title: "", items: "" }]);
          setCounter((c) => c + 1);
        }}
        className={secondaryButtonClass}
      >
        + Add block
      </button>
    </fieldset>
  );
}