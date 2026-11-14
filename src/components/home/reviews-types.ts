export type Review = {
  /** Kunci unik (id baris DB); bila kosong memakai nama. */
  key?: string;
  quote: string;
  name: string;
  location: string;
  role: string;
};
