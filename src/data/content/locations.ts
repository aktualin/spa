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
  },
  {
    kind: "treatment",
    slug: "sudirman",
    name: "Sudirman",
    area: "SCBD",
    address: "Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan",
    phone: "+62 813-1605-2040",
    email: "sudirman@kamaspa.id",
    hours: "Mon – Sun. 10 AM – 8 PM",
    tag: "Coming Soon",
    image: asset("img/kama/08-water-drop.jpg"),
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.89351757514058!2d106.81060279840318!3d-6.224610072272575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1513c917d01%3A0x7410034730367e7f!2sJl.%20Jend.%20Sudirman%20kav%2052-53%2C%20RT.5%2FRW.3%2C%20Senayan%2C%20Kec.%20Kby.%20Baru%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2012190!5e0!3m2!1sid!2sid!4v1793659237436!5m2!1sid!2sid",
    mapDirections:
      "https://www.google.com/maps/dir/?api=1&destination=Jl.%20Jend.%20Sudirman%20Kav.%2052-53%2C%20Jakarta%20Selatan",
  },
  {
    kind: "treatment",
    slug: "kebayoran",
    name: "Kebayoran",
    area: "Senayan",
    address: "Jl. Asia Afrika No. 8, Kebayoran Baru, Jakarta Selatan",
    phone: "+62 813-1605-2040",
    email: "kebayoran@kamaspa.id",
    hours: "Mon – Sun. 10 AM – 8 PM",
    tag: "Coming Soon",
    image: asset("img/kama/05-foot-bath.jpg"),
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.89262029726356!2d106.80129111934542!3d-6.226511218491336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f14f3c555555%3A0x80c4367e6df44efb!2sJl.%20Asia%20Afrika%20No.8%2C%20RT.1%2FRW.3%2C%20Gelora%2C%20Kecamatan%20Tanah%20Abang%2C%20Kota%20Jakarta%20Pusat%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2010270!5e0!3m2!1sid!2sid!4v1793659291124!5m2!1sid!2sid",
    mapDirections:
      "https://www.google.com/maps/dir/?api=1&destination=Jl.%20Asia%20Afrika%20No.%208%2C%20Kebayoran%20Baru%2C%20Jakarta%20Selatan",
  },
];