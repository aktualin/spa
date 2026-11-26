/** Bawaan SEO per route tetap: our story, journal, galeri, event, retail, gift card, kontak, reservasi. */
import type { PageSeoDefaults } from "./seo.pages.ts";

export const PAGE_SEO_DATA_CONTENT: Readonly<Record<string, PageSeoDefaults>> = {
  "/our-story": {
    title: "The Story & Philosophy Behind KAMA",
    description:
      "Discover the journey and philosophy of KAMA Spa — traditional Nusantara healing techniques blended with modern wellness in the heart of South Jakarta.",
    keywords: ["about KAMA Spa", "spa philosophy", "wellness sanctuary", "spa brand story"],
  },
  "/our-story/journal": {
    title: "Wellness & Spa Journal from Jakarta",
    description:
      "Articles on wellness, self-care, and spa treatments from KAMA Spa: relaxation tips, massage benefits, traditional rituals, and guides to balanced living.",
    keywords: ["wellness blog", "spa articles", "self-care tips", "massage benefits"],
  },
  "/gallery": {
    title: "Spa Atmosphere Gallery in South Jakarta",
    description:
      "Step inside KAMA Spa through our photo gallery — treatment room interiors, ritual details, and the calm atmosphere of our South Jakarta wellness sanctuary.",
    keywords: ["spa gallery", "spa photos Jakarta", "spa atmosphere", "spa interior"],
  },
  "/events": {
    title: "Wellness Events & Workshops in Jakarta",
    description:
      "Join KAMA Spa wellness events and workshops: sound healing, mindfulness classes, and community collaborations. See upcoming dates and register via WhatsApp.",
    keywords: ["wellness events Jakarta", "spa workshops", "sound healing Jakarta", "self-care events"],
  },
  "/events/collaborations": {
    title: "Brand Collaborations & Partnerships",
    description:
      "KAMA Spa collaborations with brands, communities, and wellness creators — from pop-up events to co-created treatments. Pitch your idea via our marketing team.",
    keywords: ["brand collaborations", "spa partnerships", "co-created treatment", "wellness collaborations"],
  },
  "/retail": {
    title: "Spa & Wellness Retail Products in Jakarta",
    description:
      "Bring the KAMA Spa ritual home: our retail collection of essential oils, body care, and aromatherapy picks for everyday self-care at home.",
    keywords: ["spa products", "essential oils Jakarta", "body care", "aromatherapy", "buy spa products"],
  },
  "/gift-card": {
    title: "Buy Spa Gift Cards in South Jakarta",
    description:
      "Give the gift of relaxation with a KAMA Spa gift card — flexible amounts for any treatment, valid at every branch, and deliverable digitally.",
    keywords: ["spa gift card", "spa voucher Jakarta", "spa gift", "relaxation gift"],
  },
  "/contact": {
    title: "Spa Contact, Locations & Reservations",
    description:
      "Contact KAMA Spa for reservations and branch information. Find addresses, opening hours, location maps, and WhatsApp links for every branch on this page.",
    keywords: ["contact spa Jakarta", "spa reservations", "KAMA Spa locations", "spa branches South Jakarta"],
  },
  "/reservation": {
    title: "Book Spa Reservations in South Jakarta",
    description:
      "Request a KAMA Spa treatment reservation online — choose your branch, date, time, and treatment. Our team confirms your schedule via WhatsApp.",
    keywords: ["spa reservation Jakarta", "book spa online", "spa treatment schedule", "KAMA Spa reservation"],
  },
};
