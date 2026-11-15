import type { BranchOption, ReservationCopy, ReservationServiceGroup } from "@/lib/domain/forms";

const GUEST_OPTIONS = [1, 2, 3, 4, 5] as const;

/**
 * Isian form reservasi (dipakai `/contact` & `/reservation`).
 *
 * Pola mengikuti form lama: placeholder + aria-label, kelas legacy
 * `form_input`/`w-input`, baris `layout-row gap-medium` (kolom flex).
 * Input tanggal & jam tidak bisa menampilkan placeholder, jadi keduanya
 * memakai label kecil yang terlihat dan tampil berdampingan (grid Tailwind).
 * Treatment & jumlah orang opsional — opsi kosongnya bisa dipilih kembali.
 */
export function ReservationFields({
  branches,
  services,
  copy,
}: {
  branches: readonly BranchOption[];
  services: readonly ReservationServiceGroup[];
  copy: ReservationCopy;
}) {
  return (
    <>
      <div className="layout-row gap-medium">
        <input className="form_input w-input" type="text" name="name" placeholder={copy.nameLabel} aria-label={copy.nameLabel} required />
        <input className="form_input w-input" type="tel" name="phone" placeholder={copy.phoneLabel} aria-label={copy.phoneLabel} required />
      </div>
      <div className="layout-row gap-medium">
        <input className="form_input w-input" type="email" name="email" placeholder={copy.emailLabel} aria-label={copy.emailLabel} />
        <select className="form_input is-select" name="branchSlug" aria-label={copy.branchLabel} defaultValue="" required>
          <option value="" disabled>
            {copy.branchLabel}
          </option>
          {branches.map((branch) => (
            <option key={branch.slug} value={branch.slug}>
              {branch.name} | {branch.area}
            </option>
          ))}
        </select>
      </div>
      <div className="layout-row gap-medium">
        <select className="form_input is-select" name="treatment" aria-label={copy.treatmentLabel} defaultValue="">
          <option value="">{copy.treatmentLabel}</option>
          {services.map((service) => (
            <optgroup key={service.group} label={service.group}>
              {service.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <label className="block min-w-0">
            <span className="mb-1 block text-xs tracking-[0.12em] text-cocoa/70 uppercase">
              {copy.dateLabel}
            </span>
            <input className="form_input w-input" type="date" name="preferredDate" aria-label={copy.dateLabel} />
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-xs tracking-[0.12em] text-cocoa/70 uppercase">
              {copy.timeLabel}
            </span>
            <input className="form_input w-input" type="time" name="preferredTime" aria-label={copy.timeLabel} />
          </label>
        </div>
        <select className="form_input is-select" name="guests" aria-label={copy.guestsLabel} defaultValue="">
          <option value="">{copy.guestsLabel}</option>
          {GUEST_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
          <option value="6">6+</option>
        </select>
      </div>
      <textarea className="form_input w-input" name="message" placeholder={copy.messageLabel} aria-label={copy.messageLabel} rows={3} />
    </>
  );
}
