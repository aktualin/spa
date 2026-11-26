import type { PolicySection } from "./privacy-policy.ts";

/* ---------- Terms & conditions ---------- */

export const termsConditions: { intro: string; sections: PolicySection[] } = {
  intro:
    "Welcome to the KAMA Spa platform (“KAMA”). By accessing or using this website, you agree to the following terms of use.",
  sections: [
    {
      title: "Terms of Use",
      paragraphs: [
        "You confirm that you are at least 17 years old. You are responsible for ensuring that your use of our services complies with applicable laws and regulations.",
        "The content, text, images, and materials on this site are protected by intellectual property rights. Unauthorized use of the content may result in the termination of your access.",
        "Links to third-party sites are provided for convenience only and do not constitute endorsements. KAMA is not responsible for the content or accuracy of external sites.",
      ],
    },
    {
      title: "Reservations and Scheduling",
      paragraphs: [
        "Reservations can be made via WhatsApp, by phone, or through the form on this site. A confirmed schedule applies to guests arriving at the agreed time.",
        "Requests to cancel or reschedule must be made in accordance with the applicable cancellation policy.",
      ],
    },
    {
      title: "Cancellation Policy",
      paragraphs: [
        "We require 24 hours' notice to cancel an appointment, and a credit card number is required to hold a reservation.",
        "Group reservations of 3 or more guests must be cancelled at least 72 hours in advance. Missed appointments are charged in full, while cancellations within 24 hours are charged 50% of the service fee.",
        "We reserve the right to cancel or postpone services in the event of force majeure, and will inform you as soon as possible in such cases.",
      ],
    },
    {
      title: "Payment",
      paragraphs: [
        "Prices are listed in Rupiah and exclude 10% government tax. Accepted payment methods will be confirmed when your reservation is made.",
        "The credit card used to hold a reservation is used only for cancellation or no-show purposes.",
      ],
    },
    {
      title: "Expected Conduct",
      paragraphs: [
        "We uphold the privacy and calm of every guest. We ask that phones be switched off during services and that children do not accompany other guests.",
        "Disruptive behavior, discourteous conduct, or refusal to follow a therapist's instructions may result in the service being terminated without a refund.",
      ],
    },
    {
      title: "Hazards & Safety",
      paragraphs: [
        "You must disclose any medical conditions, allergies, pregnancy, or other relevant conditions before your service begins. We are not liable for conditions we were not informed of in advance.",
        "Lost or damaged personal belongings are outside our responsibility, except for damage caused by our negligence.",
      ],
    },
    {
      title: "Changes to These Terms",
      paragraphs: [
        "We reserve the right to update these terms at any time. Changes will be published on this site and take effect from the date stated above.",
      ],
    },
    {
      title: "Contact Us",
      paragraphs: [
        "For questions about these terms, contact us at marketing@kamaspa.id or +62 813-1605-2040, or visit KAMA Spa in Kramat Pela, South Jakarta.",
      ],
    },
  ],
};
