/**
 * Literal inline di fungsi seed yang BERUBAH HEAD→current (tidak importable).
 * `old` = nilai live persis (inventaris DB; null bila kolom kosong di live);
 * `new` = nilai seed current. Generator memakai ini untuk guarded UPDATE
 * permukaan admin-editable (old null → guard IS NULL).
 * Literal yang TIDAK berubah cukup diturunkan collect (pair equal → dilewati).
 */
export type InlineLiteral = {
  table: string;
  match: Record<string, string>;
  field: string;
  old: string | null;
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
    old: null, // live null (inventaris 2026-11-26); seed create-only tidak mengisinya
    new: "KAMA Spa corporate wellness session",
  },
  {
    table: "CorporateContent", match: { id: "singleton" }, field: "inSpaImageAlt",
    old: null, // live null (inventaris 2026-11-26)
    new: "KAMA Spa lounge with a team enjoying refreshments",
  },
];
