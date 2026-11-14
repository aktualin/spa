"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { UploadControls } from "./upload-panel-controls";
import { UploadProgressList } from "./upload-panel-list";
import { NEW_FOLDER, uploadOne, type UploadItem, type UploadStatus } from "./upload-panel-xhr";

/** Unggah banyak berkas sekaligus; dikirim satu per satu dengan progres masing-masing. */
export function UploadPanel({ folders }: { folders: string[] }) {
  const router = useRouter();
  const fileId = useId();
  const folderId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [folderChoice, setFolderChoice] = useState(folders[0] ?? "misc");
  const [newFolder, setNewFolder] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);

  const options = folders.includes("misc") ? folders : [...folders, "misc"];
  const targetFolder =
    folderChoice === NEW_FOLDER
      ? newFolder.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
      : folderChoice;

  function patch(key: string, change: Partial<UploadItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...change } : item)));
  }

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const batch = files.map((file, index) => ({
      key: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      progress: 0,
      status: "menunggu" as UploadStatus,
    }));
    setItems(batch);
    setBusy(true);

    let succeeded = 0;
    for (const [index, file] of files.entries()) {
      const { key } = batch[index];
      patch(key, { status: "mengunggah" });
      const result = await uploadOne(file, targetFolder || "misc", (progress) => patch(key, { progress }));
      if (result.ok) {
        succeeded += 1;
        patch(key, { status: "selesai", progress: 100 });
      } else {
        patch(key, { status: "gagal", error: result.error });
      }
    }

    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (succeeded > 0) router.refresh();
  }

  return (
    <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Unggah berkas</h2>

      <UploadControls
        folderId={folderId}
        fileId={fileId}
        fileRef={fileRef}
        options={options}
        folderChoice={folderChoice}
        setFolderChoice={setFolderChoice}
        newFolder={newFolder}
        setNewFolder={setNewFolder}
        targetFolder={targetFolder}
        busy={busy}
        onFiles={(files) => void handleFiles(files)}
      />

      <UploadProgressList items={items} busy={busy} onClear={() => setItems([])} />
    </section>
  );
}