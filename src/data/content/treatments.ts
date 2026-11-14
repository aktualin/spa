import { asset } from "../../lib/asset-url.ts";
import type { Treatment } from "./menu-types.ts";

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