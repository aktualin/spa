import { asset } from "../../lib/asset-url.ts";
import type { AdditionalService } from "./menu-types.ts";

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