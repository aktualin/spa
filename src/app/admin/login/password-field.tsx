"use client";

import { useState } from "react";

import { Eye, EyeOff } from "@/components/icons";

/**
 * Input kata sandi dengan tombol mata di dalam box (kanan) untuk
 * menampilkan/menyembunyikan kata sandi. `className` diisi kelas input yang
 * sama dengan field lain di LoginForm; padding kanan ditambah untuk tombol.
 */
export function PasswordField({ className }: { className: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        required
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-ink/45 transition hover:text-espresso focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cocoa"
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
