"use client";

/**
 * Komponen form kecil yang dipakai bersama modul admin Gallery, Promos,
 * Gift Card, Membership, Journal, dan Events. Gayanya mengikuti
 * `treatments/treatment-form.tsx`.
 *
 * Barrel: implementasi dipecah ke form-fields / form-buttons / form-seo.
 */

export { inputClass, secondaryButtonClass, Field, Checkbox, ErrorAlert } from "./form-fields";
export { SaveButton, SmallSubmit, ConfirmDeleteButton } from "./form-buttons";
export { SeoFields } from "./form-seo";