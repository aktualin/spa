/* ---------- Privacy policy ---------- */

export type PolicySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const privacyPolicy: { intro: string; sections: PolicySection[] } = {
  intro:
    "Welcome to the KAMA Spa platform (“KAMA”). By accessing or using this website, you agree to the use of your personal data in accordance with the privacy policy set out below.",
  sections: [
    {
      title: "Information We Collect",
      paragraphs: [
        "We collect several types of information so we can provide a better, more relevant service to you:",
      ],
      bullets: [
        "Personal information: your name, email address, phone number, address, and preference details you provide when making a reservation, completing a purchase, contacting us, or joining a promotion.",
        "Usage data: the pages you visit, the features you use, the length of your visit, and the device you use to access our services.",
        "Device information: device type, operating system, browser type, and IP address.",
      ],
    },
    {
      title: "How We Use Your Information",
      paragraphs: ["Your information is used for the following purposes:"],
      bullets: [
        "To provide and improve our services.",
        "To process your reservations and purchases.",
        "To send marketing and promotional communications, with your consent.",
        "To respond to your questions and requests.",
        "To personalize your experience with us.",
        "To comply with applicable laws and regulations.",
      ],
    },
    {
      title: "Sharing Your Information",
      paragraphs: [
        "We never sell your personal information to third parties.",
        "We may share your information with third-party service providers who help us operate our services. These providers are required to keep your information confidential and to use it only for the purposes we have authorized.",
        "Information may also be disclosed in certain circumstances to comply with the law, prevent unlawful activity, and protect the rights and safety of others.",
      ],
    },
    {
      title: "Your Choices",
      paragraphs: ["You remain in control of your information. You can:"],
      bullets: [
        "Access and update your personal data by contacting our team.",
        "Opt out of marketing and promotional communications from us at any time.",
        "Request the deletion of your personal data.",
      ],
    },
    {
      title: "Cookies and Tracking Technologies",
      paragraphs: [
        "We use cookies and other tracking technologies to gather information about how you use our services. You can manage cookies at the browser level. Disabling cookies may limit some features of our site.",
      ],
    },
    {
      title: "SMS Marketing Policy",
      paragraphs: [
        "This section applies specifically to SMS marketing and does not replace our Privacy Policy as a whole.",
        "Your phone number is collected only when you provide it voluntarily — for example, when completing a transaction, making an inquiry, or signing up for promotional messages. You can opt out at any time by sending STOP or UNSUBSCRIBE. Once you have opted out, your number will not be sold or transferred to third parties for marketing purposes.",
        "Subscribing to SMS messages is not required to access promotions or discounts, which are also available directly on our site.",
      ],
    },
    {
      title: "Changes to This Policy",
      paragraphs: [
        "We may update this policy from time to time. Significant changes will be published on our site. Last updated: 1 January 2026.",
      ],
    },
    {
      title: "Contact Us",
      paragraphs: [
        "If you have questions about our privacy policy or would like to update your data, contact us at marketing@kamaspa.id or +62 813-1605-2040.",
      ],
    },
  ],
};
