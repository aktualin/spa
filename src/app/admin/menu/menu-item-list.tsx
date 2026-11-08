"use client";

import { useActionState, useState } from "react";

import {
  deleteMenuItemAction,
  moveMenuItemAction,
  saveMenuItemAction,
  type ActionState,
} from "../actions/menu";
import {
  Checkbox,
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

export type MenuItemRow = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  isVisible: boolean;
  openInNew: boolean;
  parentId: string | null;
  children?: MenuItemRow[];
};

const initialState: ActionState = { error: null };

export function MenuItemList({ items }: { items: MenuItemRow[] }) {
  const [adding, setAdding] = useState(false);

  // Hanya item root yang boleh menjadi induk — sub-menu dibatasi satu level.
  const parents = items.map((item) => ({ id: item.id, label: item.label }));

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id}>
          <MenuItemForm
            item={item}
            parents={parents}
            isFirst={index === 0}
            isLast={index === items.length - 1}
          />
          {item.children && item.children.length > 0 ? (
            <ul className="mt-2 space-y-2 border-l border-neutral-200 pl-4">
              {item.children.map((child, childIndex) => (
                <li key={child.id}>
                  <MenuItemForm
                    item={child}
                    parents={parents}
                    isFirst={childIndex === 0}
                    isLast={childIndex === item.children!.length - 1}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}

      {adding ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <MenuItemForm
            item={null}
            parents={parents}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          + Tambah item menu
        </button>
      )}
    </div>
  );
}

function MenuItemForm({
  item,
  parents,
  isFirst,
  isLast,
  onDone,
}: {
  item: MenuItemRow | null;
  parents: { id: string; label: string }[];
  isFirst?: boolean;
  isLast?: boolean;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(saveMenuItemAction, initialState);

  return (
    <>
      <form
        action={formAction}
        className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label" htmlFor={`label-${item?.id ?? "new"}`}>
          <input
            id={`label-${item?.id ?? "new"}`}
            name="label"
            defaultValue={item?.label ?? ""}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="URL"
          htmlFor={`url-${item?.id ?? "new"}`}
          hint="Harus diawali / atau https://"
        >
          <input
            id={`url-${item?.id ?? "new"}`}
            name="url"
            defaultValue={item?.url ?? ""}
            required
            placeholder="/menu atau https://..."
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Urutan tampil" htmlFor={`sortOrder-${item?.id ?? "new"}`}>
          <input
            id={`sortOrder-${item?.id ?? "new"}`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={item?.sortOrder ?? 0}
            className={`${inputClass} w-28`}
          />
        </Field>

        <div className="space-y-2 pt-5">
          <Checkbox name="isVisible" defaultChecked={item?.isVisible ?? true}>
            Tampilkan di navigasi
          </Checkbox>
          <Checkbox name="openInNew" defaultChecked={item?.openInNew ?? false}>
            Buka di tab baru
          </Checkbox>
        </div>
      </div>

      <Field
        label="Induk menu"
        htmlFor={`parentId-${item?.id ?? "new"}`}
        hint="Kosongkan untuk menu utama. Sub-menu hanya boleh satu level."
      >
        <select
          id={`parentId-${item?.id ?? "new"}`}
          name="parentId"
          defaultValue={item?.parentId ?? ""}
          className={inputClass}
        >
          <option value="">Tanpa induk (menu utama)</option>
          {parents
            .filter((parent) => parent.id !== item?.id)
            .map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.label}
              </option>
            ))}
        </select>
      </Field>

      <ErrorMessage error={state.error} />

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
        <SaveButton label={item ? "Simpan perubahan" : "Tambah item"} />
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-neutral-600 hover:underline"
          >
            Batal
          </button>
        ) : null}

      </div>
      </form>

      {item ? (
        <div className="mt-2 flex items-center gap-2">
          <form action={moveMenuItemAction} className="inline">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={isFirst}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              ↑
            </button>
          </form>
          <form action={moveMenuItemAction} className="inline">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={isLast}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              ↓
            </button>
          </form>

          <form action={deleteMenuItemAction} className="ml-auto">
            <input type="hidden" name="id" value={item.id} />
            <ConfirmSubmit
              message={`Hapus menu "${item.label}"? Sub-menu di bawahnya ikut terhapus.`}
            >
              Hapus
            </ConfirmSubmit>
          </form>
        </div>
      ) : null}
    </>
  );
}
