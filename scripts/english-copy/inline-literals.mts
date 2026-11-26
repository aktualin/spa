/**
 * Literal inline di fungsi seed yang BERUBAH HEAD→current (tidak importable).
 * `old` = nilai live persis dari git HEAD; `new` = nilai seed current.
 * Generator memakai ini untuk guarded UPDATE permukaan admin-editable.
 * Literal yang TIDAK berubah cukup diturunkan collect (pair equal → dilewati).
 */
export type InlineLiteral = {
  table: string;
  match: Record<string, string>;
  field: string;
  old: string;
  new: string;
};

export const INLINE_LITERALS: InlineLiteral[] = [
  {
    table: "SiteSettings", match: { id: "singleton" }, field: "footerMembershipTitle",
    old: "Become a KAMA Member for Rp 1.5jt a month",
    new: "Become a KAMA Member for Rp 1,500,000 a month",
  },
  {
    table: "SiteSettings", match: { id: "singleton" }, field: "partnershipIntro",
    old: "Kolaborasi dan partnership:",
    new: "Collaborations & partnerships:",
  },
  {
    table: "CorporateContent", match: { id: "singleton" }, field: "aboutImageAlt",
    old: "Sesi corporate wellness KAMA Spa",
    new: "KAMA Spa corporate wellness session",
  },
  {
    table: "CorporateContent", match: { id: "singleton" }, field: "inSpaImageAlt",
    old: "Lounge KAMA Spa dengan tim menikmati refreshments",
    new: "KAMA Spa lounge with a team enjoying refreshments",
  },
];
