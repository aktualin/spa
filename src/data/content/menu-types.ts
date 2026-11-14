/* ---------- Treatments / Menu ---------- */

export type Treatment = {
  kind: "treatment";
  slug: string;
  name: string;
  category: "Massage" | "Body" | "Face" | "Head & Scalp" | "Bath";
  tagline?: string;
  description: string;
  note?: string;
  prices: { duration: string; price: string }[];
  image: string;
};

/* ---------- Day Spa packages ---------- */

export type Package = {
  kind: "package";
  slug: string;
  name: string;
  subtitle: string;
  quote: string;
  description: string;
  includes: { label: string; minutes: number }[];
  duration: string;
  price: string;
  image: string;
};

/* ---------- Additional services ---------- */

export type AdditionalService = {
  name: string;
  /** Which menu section the service belongs to. */
  category: "Body" | "Face" | "Head & Scalp" | "Bath";
  /** Anchor id of the section that showcases the service. */
  anchor: string;
  price: string;
  description: string;
  image: string;
};