export type Review = {
  /** Kunci unik (id baris DB); bila kosong memakai nama. */
  key?: string;
  quote: string;
  name: string;
  location: string;
  role: string;
};

/** Aria ulasan dari CB (home.reviews.aria_*); dot memakai {name}. */
export type ReviewsLabels = {
  prev: string;
  next: string;
  list: string;
  dot: string;
};