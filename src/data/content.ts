import { asset } from "../lib/asset-url.ts";

export const site = {
  name: "KAMA Spa",
  tagline: "Relax. Refresh. (Repeat).",
  description:
    "KAMA Spa adalah wellness sanctuary di jantung South Jakarta. Memadukan teknik penyembuhan tradisional dengan pendekatan wellness modern untuk mengembalikan keseimbangan, relaksasi, dan ketenangan.",
  address: "Jl. Barito I No.21, Kramat Pela, Jakarta Selatan",
  instagram: "https://www.instagram.com/kama__spa",
  tiktok: "https://www.tiktok.com/@kama__spa",
  phone: "+6281316052040",
  email: "hello@kamaspa.id",
  /** Collaboration & partnership enquiries. */
  partnershipEmail: "marketing@kamaspa.id",
  hours: "Mon – Sun. 10 AM – 8 PM",
};

export type NavLink = {
  label: string;
  href: string;
  /** Dibuka di tab baru (target="_blank"). */
  external?: boolean;
};

export type NavHighlight = {
  image: string;
  /** Belum punya kolom di MenuItem; tidak dirender bila kosong. */
  badge?: string;
  eyebrow?: string;
  label: string;
  href: string;
};

/**
 * A dropdown group in the header. `columns` are the link lists, `highlights`
 * the small promo cards, `footerLink` an optional "see everything" escape
 * hatch.
 */
export type NavMegaGroup = {
  id: string;
  label: string;
  /** `wide` fits two link columns, `narrow` a single one. */
  panel: "wide" | "narrow";
  columns: { title: string; links: NavLink[] }[];
  highlights: NavHighlight[];
  footerLink?: NavLink;
};

export type NavPrimaryItem = {
  label: string;
  href: string;
  mega?: string;
  /** External links open in a new tab and are rendered as plain `<a>`. */
  external?: boolean;
};

export const nav: {
  primary: NavPrimaryItem[];
  bookNow: string;
  megaGroups: Record<string, NavMegaGroup>;
} = {
  /**
   * Header order matters: the dropdown groups come first, the plain links
   * after. `mega` points at a key in `nav.megaGroups`.
   */
  primary: [
    { label: "Menu", href: "/menu", mega: "services" },
    { label: "Corporate Wellness", href: "/corporate", mega: "corporate" },
    { label: "Contact", href: "/contact" },
    {
      label: "Service Menu",
      href: "https://drive.google.com/file/d/1UfW-JFOno47KCLi-PwID4XdrCDHkwIfc/view?usp=sharing",
      external: true,
    },
  ],
  bookNow: "Book Now",
  megaGroups: {
    services: {
      id: "services",
      label: "Menu",
      panel: "wide",
      columns: [
        {
          title: "Treatments",
          links: [
            { label: "Massage", href: "/menu#massage" },
            { label: "Body & Scrub", href: "/menu#body" },
            { label: "Face Ritual", href: "/menu#face" },
            { label: "Head & Scalp", href: "/menu#head" },
            { label: "Bath Ritual", href: "/menu#bath" },
          ],
        },
        {
          title: "More",
          links: [
            { label: "All Day Spa Packages", href: "/menu#packages" },
            { label: "Membership", href: "/membership" },
          ],
        },
      ],
      highlights: [
        {
          image: asset("img/kama/03-oil-bowl.jpg"),
          badge: "new",
          eyebrow: "Just Rp 1.5jt a month",
          label: "Join KAMA Now",
          href: "/membership",
        },
        {
          image: asset("img/kama/06-bride.jpg"),
          badge: "new",
          eyebrow: "2 – 4 hour rituals",
          label: "All Day Spa",
          href: "/menu#packages",
        },
      ],
      footerLink: { label: "Lihat semua treatment", href: "/menu" },
    },
    corporate: {
      id: "corporate",
      label: "Corporate Wellness",
      panel: "narrow",
      columns: [
        {
          title: "Corporate",
          links: [
            { label: "Corporate Wellness", href: "/corporate" },
            { label: "In-Office Program", href: "/corporate#in-office" },
            { label: "In-Spa Experience", href: "/corporate#in-spa" },
            { label: "Wellness Benefits", href: "/corporate#benefits" },
          ],
        },
      ],
      highlights: [
        {
          image: asset("img/kama/05-foot-bath.jpg"),
          badge: "new",
          eyebrow: "Wellness at work",
          label: "In-Office Program",
          href: "/corporate#in-office",
        },
        {
          image: asset("img/kama/corporate/05-lounge.jpg"),
          badge: "team",
          eyebrow: "Bring your team",
          label: "In-Spa Experience",
          href: "/corporate#in-spa",
        },
      ],
      footerLink: { label: "Lihat program corporate", href: "/corporate" },
    },
  },
};

export const footerLinks = {
  Services: [
    { label: "All Treatments", href: "/menu" },
    { label: "Massage", href: "/menu#massage" },
    { label: "Body & Scrub", href: "/menu#body" },
    { label: "Face Ritual", href: "/menu#face" },
    { label: "Head & Scalp", href: "/menu#head" },
    { label: "Bath Ritual", href: "/menu#bath" },
  ],
  Corporate: [
    { label: "Corporate Wellness", href: "/corporate" },
    { label: "In-Office Program", href: "/corporate#in-office" },
    { label: "In-Spa Experience", href: "/corporate#in-spa" },
    { label: "Wellness Benefits", href: "/corporate#benefits" },
    { label: "Partnership", href: "mailto:marketing@kamaspa.id" },
  ],
  About: [
    { label: "Contact", href: "/contact" },
    { label: "Membership", href: "/membership" },
  ],
  Community: [{ label: "Corporate Wellness", href: "/corporate" }],
};

export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/kama__spa", icon: "instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@kama__spa", icon: "tiktok" },
  {
    label: "Email",
    href: "mailto:marketing@kamaspa.id",
    icon: "email",
  },
] as const;

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

export const treatments: Treatment[] = [
  {
    kind: "treatment",
    slug: "chair-reflexology",
    name: "Chair Reflexology",
    category: "Massage",
    tagline: "A full reflexology treatment focused on the feet and shoulders",
    description:
      "A full reflexology treatment focused on the feet and shoulders, stimulating nerve points connected to vital organs and effective in relaxing the lower body, improving blood circulation, and reducing tension in the shoulder area.",
    note: "We are using dry massage techniques without oil.",
    prices: [
      { duration: "60 min", price: "145k" },
      { duration: "90 min", price: "195k" },
      { duration: "120 min", price: "245k" },
    ],
    image: asset("img/kama/02-bottle-shadows.jpg"),
  },
  {
    kind: "treatment",
    slug: "chair-spa",
    name: "Chair Spa",
    category: "Massage",
    tagline: "A curated relaxation treatment",
    description:
      "A curated relaxation treatment beginning with an aromatic meditation ritual, followed by intentional pressure applied to stimulating points along the arms, back, and feet, and thoughtfully completed with a sensory foot ritual as a calming final touch.",
    note: "We are using dry massage techniques without oil.",
    prices: [
      { duration: "75 min", price: "195k" },
      { duration: "90 min", price: "225k" },
      { duration: "120 min", price: "285k" },
    ],
    image: asset("img/kama/01-incense.jpg"),
  },
  {
    kind: "treatment",
    slug: "chair-body-recovery",
    name: "Chair Body Recovery",
    category: "Massage",
    tagline: "A focused recovery treatment designed for active bodies",
    description:
      "A focused recovery treatment designed for active bodies and everyday tension. Combining deep muscle release, targeted trigger-point pressure, assisted stretching, and a warm compress, helping to ease tight muscles, support mobility, and leave the body feeling lighter and restored.",
    note: "This treatment is not intended for injury treatment or rehabilitation.",
    prices: [{ duration: "75 min", price: "399k" }],
    image: asset("img/kama/09-leaf-drop.jpg"),
  },
  {
    kind: "treatment",
    slug: "sukma-laya",
    name: "Sukma Laya",
    category: "Massage",
    tagline: "A traditional massage rooted in Javanese culture",
    description:
      "A traditional massage rooted in Javanese culture, known for its deep, rhythmic pressure that combines acupressure and deep tissue techniques.",
    note: "Start with FREE foot bath.",
    prices: [
      { duration: "60 min", price: "375k" },
      { duration: "90 min", price: "449k" },
    ],
    image: asset("img/kama/03-oil-bowl.jpg"),
  },
  {
    kind: "treatment",
    slug: "urip-padma",
    name: "Urip Padma",
    category: "Massage",
    tagline: "A holistic full-body massage inspired by traditional Balinese techniques",
    description:
      "A holistic full-body massage inspired by traditional Balinese techniques that blends acupressure, gentle stretching, reflexology, and aromatherapy to balance energy and induce deep calm.",
    note: "Start with FREE foot bath.",
    prices: [
      { duration: "60 min", price: "375k" },
      { duration: "90 min", price: "449k" },
    ],
    image: asset("img/kama/04-turmeric-scrub.jpg"),
  },
  {
    kind: "treatment",
    slug: "skogsra-massage",
    name: "Skogsrå Massage",
    category: "Massage",
    tagline: "Swedish Style Massage",
    description:
      "A gentle Swedish full-body massage with flowing strokes and light to medium pressure, offering a pampered sensation, deep relaxation, balanced mood, and a refreshed body.",
    note: "Start with FREE foot bath.",
    prices: [
      { duration: "60 min", price: "375k" },
      { duration: "90 min", price: "449k" },
    ],
    image: asset("img/kama/08-water-drop.jpg"),
  },
];

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

export const packages: Package[] = [
  {
    kind: "package",
    slug: "samadhana",
    name: "Samådhåna",
    subtitle: "A state of balance & inner resolution",
    quote: "In stillness, we remember who we are.",
    description:
      "A grounding two-hour ritual to restore balance from head to toe. Sink into rhythmic massage strokes and melt into a calming scalp journey.",
    includes: [
      { label: "Body Massage", minutes: 90 },
      { label: "Face Ritual", minutes: 30 },
      { label: "Head & Scalp Treatment", minutes: 15 },
    ],
    duration: "2 hours",
    price: "650k",
    image: asset("img/kama/03-oil-bowl.jpg"),
  },
  {
    kind: "package",
    slug: "dharana",
    name: "Dhåranå",
    subtitle: "Grounded focus & renewed vitality",
    quote: "Where your attention flows, healing follows.",
    description:
      "A complete reset: begin with a restorative massage, unveil new skin with our revitalizing scrub, soothe deeply with a nourishing mask, and emerge radiant through a ritual bath.",
    includes: [
      { label: "Body Massage", minutes: 90 },
      { label: "Body Scrub", minutes: 15 },
      { label: "Body Mask", minutes: 15 },
      { label: "Bath Ritual", minutes: 15 },
    ],
    duration: "2 hours 30 minute",
    price: "765k",
    image: asset("img/kama/04-turmeric-scrub.jpg"),
  },
  {
    kind: "package",
    slug: "aroha",
    name: "Åroha",
    subtitle: "The rise to radiance",
    quote: "Rise, replenish, and return to your radiance.",
    description:
      "Let this sacred flow elevate your senses — from long, enveloping massage strokes to the tender care of body rituals. A full-body renewal, finishing in a soul-soothing bath.",
    includes: [
      { label: "Body Massage", minutes: 90 },
      { label: "Face Ritual", minutes: 30 },
      { label: "Body Scrub", minutes: 15 },
      { label: "Body Mask", minutes: 15 },
      { label: "Head & Scalp Treatment", minutes: 15 },
      { label: "Bath Ritual", minutes: 15 },
    ],
    duration: "3 hours 30 minute",
    price: "1000k",
    image: asset("img/kama/05-foot-bath.jpg"),
  },
  {
    kind: "package",
    slug: "karuna",
    name: "Karuna",
    subtitle: "Soulful pre-wedding journey",
    quote: "A whole self-embrace carefully crafted.",
    description:
      "This treatment embodies loving-kindness toward oneself, a holistic ritual designed to comfort the body, calm the mind, and illuminate the inner glow of every bride-to-be. Your bridal light, softly unveiled.",
    includes: [
      { label: "Body Massage", minutes: 90 },
      { label: "Breast, Abdomen & Hip Stimulation", minutes: 30 },
      { label: "Face Ritual", minutes: 30 },
      { label: "Body Scrub", minutes: 15 },
      { label: "Body Mask", minutes: 15 },
      { label: "Ms.V Therapy", minutes: 15 },
      { label: "Bath Ritual", minutes: 15 },
    ],
    duration: "4 hours",
    price: "1500k",
    image: asset("img/kama/06-bride.jpg"),
  },
];

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

export const additionalServices: AdditionalService[] = [
  {
    name: "Body Scrub",
    category: "Body",
    anchor: "body",
    price: "120k",
    description:
      "A gentle exfoliation that buffs away dullness and renew skin radiance. Comes in selected of home-special-blend scrubs.",
    image: asset("img/kama/04-turmeric-scrub.jpg"),
  },
  {
    name: "Body Mask",
    category: "Body",
    anchor: "body",
    price: "120k",
    description:
      "A nourishing body wrap that deeply hydrates and restores balance. Comes in choices of classic body mask ingredients.",
    image: asset("img/kama/06-bride.jpg"),
  },
  {
    name: "Bath Ritual",
    category: "Bath",
    anchor: "bath",
    price: "115k",
    description:
      "A soothing soak in the bathtub, infused with our special tea bag blend for deep relaxation and renewal.",
    image: asset("img/kama/07-flower-bowl.jpg"),
  },
  {
    name: "Head & Scalp Treatment",
    category: "Head & Scalp",
    anchor: "head",
    price: "100k",
    description:
      "A calming therapy that soothes the scalp and eases stress. Using argan oil and natural ingredients.",
    image: asset("img/kama/05-foot-bath.jpg"),
  },
  {
    name: "Face Ritual",
    category: "Face",
    anchor: "face",
    price: "250k",
    description:
      "An elevated acupressure-inspired treatment for the face, designed to release tension, awaken circulation, and restore natural glow.",
    image: asset("img/kama/02-bottle-shadows.jpg"),
  },
];

/* ---------- Corporate wellness ---------- */

export const corporateBenefits = [
  "Higher employee engagement",
  "Improved productivity & focus",
  "Reduced stress and burnout",
  "Better employee retention",
  "Stronger workplace culture",
  "Higher employer branding value",
];

export const corporateSolutions = [
  {
    title: "In-Office Wellness Program",
    items: [
      "On-site chair massage or mini treatments",
      "Office relaxation day",
      "Pop-up wellness corner",
    ],
  },
  {
    title: "In-Spa Corporate Experience",
    items: ["Team relaxation sessions", "Employee rewards or incentives", "Private group bookings"],
  },
  {
    title: "Corporate Wellness Benefits",
    items: [
      "Employee privileges, campaign vouchers, and long-term wellness partnerships",
    ],
  },
];

export const corporatePrograms = [
  {
    name: "Essential",
    description:
      "A simple reset during the workday. For teams looking to provide a meaningful wellness touchpoint through professional neck, shoulder, and back relief.",
    features: ["Chair massage", "In-office setup", "30–45 min per guest"],
  },
  {
    name: "Signature",
    description:
      "A complete workplace recovery experience. Combines massage, aromatherapy, wellness drinks, and employee perks to create a more intentional wellness activation.",
    features: ["Full body massage", "Aromatherapy add-on", "Wellness drinks", "Employee perks"],
  },
  {
    name: "Executive",
    description:
      "The most comprehensive wellness offering. A deeper recovery-focused experience featuring assisted stretching, warm compress therapy, recovery essentials, and premium wellness amenities.",
    features: ["Assisted stretching", "Warm compress therapy", "Recovery essentials", "Premium amenities"],
  },
];

/* ---------- Locations ---------- */

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

/* ---------- Home content ---------- */

export const heroStats = [
  { value: "12", label: "years of care" },
  { value: "40+", label: "signature treatments" },
  { value: "3", label: "Jakarta locations" },
];

export const journalPosts = [
  {
    kind: "treatment",
    slug: "javanese-massage-roots",
    href: "/menu#massage",
    tag: "Massage",
    title: "The Roots of Javanese Healing: Sukma Laya",
    excerpt:
      "Discover the ancient rhythm of Javanese massage — deep rhythmic pressure, acupressure, and a philosophy of restoring the body's natural balance.",
    image: asset("img/kama/corporate/11-footwash.jpg"),
  },
  {
    kind: "treatment",
    slug: "corporate-wellness-jakarta",
    href: "/corporate",
    tag: "Corporate",
    title: "Wellness at Work: A Guide to Corporate Wellness in Jakarta",
    excerpt:
      "Employee wellness is no longer just a benefit. Here is how leading teams in Jakarta build engagement, focus, and retention through meaningful reset experiences.",
    image: asset("img/kama/corporate/10-inoffice-massage.jpg"),
  },
  {
    kind: "treatment",
    slug: "pre-wedding-ritual",
    href: "/menu#packages",
    tag: "Package",
    title: "Karuna: A Soulful Pre-Wedding Journey",
    excerpt:
      "A four-hour ritual designed to comfort the body, calm the mind, and illuminate the inner glow of every bride-to-be.",
    image: asset("img/kama/06-bride.jpg"),
  },
];

export const testimonials = [
  {
    quote:
      "Sukma Laya is unlike any massage I have ever had. The pressure was exactly right and the foot bath at the start set the whole tone. I will be back.",
    name: "Amalia P.",
    location: "Jakarta | Sudirman",
    role: "Guest",
  },
  {
    quote:
      "We booked the in-office program for our team and it was a complete reset. The chair massage was smooth, professional, and genuinely relaxing.",
    name: "Bagus W.",
    location: "Jakarta | Kebayoran",
    role: "Guest",
  },
  {
    quote:
      "The Åroha package is worth every rupiah. From the body massage to the bath ritual, every step felt intentional. My skin has never felt this good.",
    name: "Clarissa N.",
    location: "Jakarta | South Jakarta",
    role: "Guest",
  },
];

export type MembershipService = {
  name: string;
  description: string;
};

export type MembershipData = {
  eyebrow: string;
  title: string;
  price: string;
  body: string;
  cta: string;
  href: string;
  servicesIntro: string;
  services: MembershipService[];
};

export const membership: MembershipData = {
  eyebrow: "membership",
  title: "KAMA Membership.",
  price: "Just Rp 1.5jt a month.",
  body: "Make sure your me-time is always accounted for. You get a credit for one essential service a month, lower prices, special offers, and more.",
  cta: "Join KAMA Now",
  href: "/membership",
  servicesIntro: "Your monthly credit can be used for any of these essential services:",
  services: [
    { name: "Sukma Laya (60 min)", description: "Full reflexology treatment focused on the feet and shoulders." },
    { name: "Face Ritual (30 min)", description: "Elevated acupressure-inspired treatment for the face." },
    { name: "Head & Scalp Treatment (15 min)", description: "Calming therapy that soothes the scalp and eases stress." },
    { name: "Body Scrub (15 min)", description: "Gentle exfoliation that buffs away dullness and renews skin radiance." },
    { name: "Body Mask (15 min)", description: "Nourishing body wrap that deeply hydrates and restores balance." },
    { name: "Bath Ritual (15 min)", description: "Soothing soak in the bathtub, infused with special tea bag blend." },
  ],
};

export const newsletter = {
  title: "Join Our Newsletter",
  body: "Get the updates first. Select your preferred locations to receive content that's tailored just for you.",
};

export const footerTagline =
  "Powered by traditional healing wisdom and a high-touch philosophy, KAMA is out to change the wellness industry — one deep exhale at a time.";

export const priceDisclaimer =
  "Price are in thousands of Rupiah and exclude 10% goverment tax.";
