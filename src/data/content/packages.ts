import { asset } from "../../lib/asset-url.ts";
import type { Package } from "./menu-types.ts";

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