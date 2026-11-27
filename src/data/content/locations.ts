import { asset } from "../../lib/asset-url.ts";

export type Location = {
  kind: string;
  slug: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  tag: string;
  image: string;
  /** Google Maps embed URL, shown inside the map popup. */
  mapEmbed: string;
  /** "Get directions" link — opens Google Maps directions to the address. */
  mapDirections: string;
};

export const locations: Location[] = [
  {
    kind: "treatment",
    slug: "south-jakarta",
    name: "South Jakarta",
    area: "Kramat Pela",
    address: "Jl. Barito I No.21, Kramat Pela, Jakarta Selatan",
    phone: "+62 813-1605-2040",
    email: "hello@kamaspa.id",
    hours: "Mon – Sun. 10 AM – 8 PM",
    tag: "Flagship",
    image: asset("img/kama/01-incense.jpg"),
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d17291.65315048694!2d106.7869294620315!3d-6.249199087412654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1287a31b10f%3A0x76b148862b90ff6!2sKAMA%20SPA!5e0!3m2!1sid!2sid!4v1793659097369!5m2!1sid!2sid",
    mapDirections:
      "https://www.google.com/maps/dir/?api=1&destination=Jl.%20Barito%20I%20No.21%2C%20Kramat%20Pela%2C%20Jakarta%20Selatan",
  }
  
];