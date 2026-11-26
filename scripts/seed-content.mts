/**
 * Seed konten yang dapat diedit admin lewat dashboard.
 *
 * Aturan: hanya mengisi nilai yang masih kosong (atau judul yang masih berupa
 * label admin lama). Suntingan admin tidak pernah ditimpa saat seed diulang.
 */
import type { PrismaClient } from "@prisma/client";

import { membership as homeMembership, priceDisclaimer } from "../src/data/content.ts";
import { membership as pageMembership } from "../src/data/pages.ts";
import { staticMembershipProgram } from "../src/lib/domain/membership.ts";
import { asset } from "../src/lib/asset-url.ts";

type SectionSeed = {
  key: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  legacyTitles?: string[];
};

export const HOMEPAGE_SECTIONS: SectionSeed[] = [
  {
    key: "hero",
    title: "Relax. Refresh. (Repeat).",
    subtitle: "Massage • Spa • Corporate Wellness",
    imageUrl: asset("img/kama/incense-smoke-poster.jpg"),
    ctaLabel: "Book Now",
    ctaHref: "/reservation",
    legacyTitles: ["Hero"],
  },
  {
    key: "membership-banner",
    title: homeMembership.title,
    subtitle: homeMembership.body,
    imageUrl: asset("img/kama/07-flower-bowl.jpg"),
    imageAlt: "KAMA Spa treatment room",
    ctaLabel: homeMembership.cta,
    ctaHref: homeMembership.href,
    legacyTitles: ["Membership Banner", "Banner Membership"],
  },
  {
    key: "whats-new",
    title: "What’s New",
    subtitle:
      "We believe authentic beauty reaches far beyond the superficial, through consistent self-care you let the beauty shine both externally and internally.",
    legacyTitles: [
      "Promo / Event Highlight",
      "Promo/Event Highlight",
      "Promo / Event Highlight ",
      "What's New",
    ],
  },
  {
    key: "reviews",
    title: "Reviews",
    legacyTitles: ["Reviews"],
  },
  {
    key: "brand-intro",
    eyebrow: "A sanctuary in the heart of South Jakarta",
    title: "More than relaxation",
    subtitle: "we create meaningful reset experiences.",
    ctaLabel: "Our Story",
    ctaHref: "/our-story",
    legacyTitles: ["Brand Intro"],
  },
  {
    key: "socials",
    title: "Gallery Teaser & Instagram",
    ctaLabel: "Follow Us",
    legacyTitles: ["Gallery Teaser & Instagram", "Socials"],
  },
  {
    key: "booking-banner",
    title: "Have any questions? Drop us a line.",
    ctaLabel: "Get In Touch",
    ctaHref: "/contact",
    legacyTitles: ["Booking Banner"],
  },
  {
    key: "signature-treatments",
    eyebrow: "Signature Treatments",
    title: "Our most-loved rituals",
    subtitle:
      "The treatments KAMA guests choose most often — always the right pick for deep relaxation.",
    ctaLabel: "View The Menu",
    ctaHref: "/menu",
  },
  {
    key: "promo-highlight",
    title: "Promo & Event",
  },
  {
    key: "gallery-teaser",
    title: "Gallery",
    ctaLabel: "View Full Gallery",
    ctaHref: "/gallery",
  },
];

export const CONTENT_BLOCKS: { key: string; value: string }[] = [
  { key: "global.copyright", value: "© {year} KAMA Spa. All rights reserved." },
  { key: "global.connect_eyebrow", value: "Connect with us" },
  { key: "global.partnership_intro", value: "Collaborations & partnerships:" },
  { key: "global.privacy_label", value: "Privacy Policy" },
  { key: "global.terms_label", value: "Terms & Conditions" },
  { key: "global.instagram_hashtag", value: "#kamaspa" },
  {
    key: "global.instagram_hashtag_href",
    value: "https://www.instagram.com/explore/search/keyword/?q=%23kamaspa",
  },
  { key: "global.instagram_follow_label", value: "Follow Us" },
  {
    key: "global.instagram_empty",
    value:
      "No Instagram posts yet. Post links can be added from the admin dashboard under Homepage → Instagram Feed.",
  },
  { key: "global.gallery_cta_label", value: "View Full Gallery" },
  { key: "global.book_via_whatsapp", value: "Book via WhatsApp" },
  { key: "global.view_detail_label", value: "View Details" },
  { key: "global.read_label", value: "Read" },
  { key: "global.book_now_label", value: "Book Now" },
  { key: "global.price_disclaimer", value: priceDisclaimer },
  { key: "global.site_title", value: "KAMA Spa • Wellness Sanctuary in South Jakarta" },
  { key: "home.hero.card_eyebrow", value: "Welcome to KAMA Spa" },
  {
    key: "home.hero.card_body",
    value:
      "Your premier destination for massage and wellness services in South Jakarta. Joyful rejuvenation awaits.",
  },
  { key: "home.hero.scroll_label", value: "See what's new" },
  { key: "home.brand_intro.stats_label", value: "KAMA at a glance" },
  { key: "home.whats_new.card_eyebrow", value: "KAMA Journal" },
  { key: "home.whats_new.empty", value: "No recent articles yet." },
  { key: "home.reviews.empty", value: "No reviews yet." },
  {
    key: "home.socials.empty",
    value:
      "No Instagram posts yet. Post links can be added from the admin dashboard under Homepage → Instagram Feed.",
  },
  { key: "home.promo.eyebrow", value: "Promo" },
  { key: "home.promo.event_eyebrow", value: "Upcoming Event" },
  {
    key: "home.promo.fallback_description",
    value: "A promo is now running — see the details on our promos page.",
  },
  { key: "home.promo.cta_label", value: "View Promos" },
  { key: "home.promo.event_cta_label", value: "View Event" },
  { key: "home.booking_banner.title", value: "Have any questions? Drop us a line." },
  { key: "home.booking_banner.cta_label", value: "Get In Touch" },
  { key: "home.booking_banner.cta_href", value: "/contact" },
  { key: "contact.hero.title", value: "Contact" },
  {
    key: "contact.hero.description",
    value:
      "Reserve your treatment, or just drop us a line — we'll help you find the right ritual for what you need today.",
  },
  { key: "contact.locations.title", value: "Our Locations" },
  {
    key: "contact.locations.empty",
    value:
      "Our locations will be announced soon. In the meantime, contact us via WhatsApp to reserve at any of our areas.",
  },
  { key: "contact.cta.title", value: "Want to experience KAMA first?" },
  { key: "contact.cta.label", value: "View The Menu" },
  {
    key: "contact.location.address_missing",
    value: "Address not yet available; contact us for the nearest location.",
  },
  { key: "contact.location.whatsapp_fallback", value: "WhatsApp" },
  { key: "contact.location.whatsapp_cta", value: "WhatsApp" },
  { key: "contact.location.directions", value: "Get Directions" },
  { key: "contact.location.fresha", value: "Booking via Fresha" },
  { key: "membership.join_label", value: "Join KAMA Now" },
  { key: "membership.menu_label", value: "View Menu" },
  { key: "membership.benefits_title", value: "Main Benefits" },
  {
    key: "membership.benefits_intro",
    value:
      "Just Rp 1,500,000 a month. You get all of the benefits below, with no long-term commitment.",
  },
  { key: "membership.services_title", value: "KAMA Essential Services" },
  { key: "membership.service_book_label", value: "Book Now" },
  { key: "membership.plans_eyebrow", value: "Membership Plans" },
  {
    key: "membership.plans_title",
    value: "Choose the plan that fits your rhythm.",
  },
  { key: "membership.plans_empty", value: "No membership plans have been published yet." },
  { key: "membership.empty_title", value: "Membership program not yet available" },
  { key: "membership.empty_description", value: "Membership information will appear here once it is added from the admin dashboard." },
  { key: "membership.join_now_label", value: "Join Now" },
  { key: "membership.terms_title", value: "Terms & Conditions" },
  { key: "membership.contact_title", value: "Have any questions? Drop us a line." },
  { key: "membership.contact_label", value: "Get In Touch" },
  { key: "menu.hero.eyebrow", value: "Menu" },
  {
    key: "menu.hero.title",
    value: "Each of our massage styles is a nurturing journey of healing.",
  },
  {
    key: "menu.hero.description",
    value:
      "The journey through our signature touch is where tension fades and inner peace is lovingly restored.",
  },
  { key: "menu.massage.eyebrow", value: "Massage" },
  { key: "menu.massage.title", value: "Signature Treatments" },
  { key: "menu.addons.eyebrow", value: "Additional Services" },
  { key: "menu.addons.title", value: "Body & Scrub" },
  { key: "menu.addon_label", value: "Add-on" },
  { key: "menu.category.massage", value: "Massage" },
  { key: "menu.category.body", value: "Body" },
  { key: "menu.category.face", value: "Facials" },
  { key: "menu.category.head", value: "Head & Scalp" },
  { key: "menu.category.bath", value: "Bath" },
  { key: "menu.feature.face.eyebrow", value: "Face Rituals" },
  { key: "menu.feature.head.eyebrow", value: "Head & Scalp Treatments" },
  { key: "menu.feature.bath.eyebrow", value: "Bath Rituals" },
  { key: "menu.booking_label", value: "Book Your Treatment" },
  { key: "menu.packages.eyebrow", value: "All Day Spa" },
  { key: "menu.packages.title", value: "Our spa bundles" },
  {
    key: "menu.packages.description",
    value:
      "Our thoughtfully curated spa bundles combine massages, treatments, and rituals designed to pamper, restore balance, and leave you refreshed all day long.",
  },
  { key: "menu.menu_book.eyebrow", value: "Menu Book" },
  { key: "menu.menu_book.title", value: "KAMA Spa Menu Gallery 2026" },
  {
    key: "menu.menu_book.description",
    value:
      "Explore our full menu as it appears in the official menu book — or download the PDF to take home.",
  },
  { key: "menu.menu_book.download_label", value: "Download Menu (PDF)" },
  { key: "menu.detail.eyebrow", value: "KAMA Spa" },
  { key: "menu.detail.loading_title", value: "Loading treatment…" },
  { key: "menu.detail.pricing_label", value: "Pricing" },
  { key: "menu.detail.include_label", value: "Includes" },
  { key: "menu.detail.book_label", value: "Book This Treatment" },
  { key: "menu.detail.not_found_title", value: "Treatment Not Found" },
  { key: "catalog.treatments.eyebrow", value: "Treatments" },
  { key: "catalog.treatments.title", value: "Every treatment, without the rush." },
  {
    key: "catalog.treatments.description",
    value: "Choose by what your body needs today. Durations and prices are listed as they are.",
  },
  { key: "catalog.treatments.empty_title", value: "Catalog not yet available" },
  {
    key: "catalog.treatments.empty_description",
    value: "Treatments will appear here once published from the admin dashboard.",
  },
  { key: "catalog.treatments.count_suffix", value: "treatment" },
  { key: "catalog.treatments.category_cta", value: "View category" },
  { key: "catalog.back_treatments", value: "All treatments" },
  { key: "catalog.category.loading_title", value: "Loading category…" },
  { key: "catalog.category.empty_title", value: "No treatments in this category yet" },
  {
    key: "catalog.category.empty_description",
    value: "This list fills automatically as treatments are published.",
  },
  { key: "catalog.treatment.not_found_title", value: "Treatment not found" },
  { key: "catalog.treatment.loading_title", value: "Loading treatment…" },
  { key: "catalog.treatment.cta_whatsapp", value: "Reserve via WhatsApp" },
  { key: "catalog.treatment.pricing_title", value: "Duration & pricing" },
  { key: "catalog.treatment.related_prefix", value: "More treatments in" },
  { key: "catalog.packages.eyebrow", value: "Packages" },
  { key: "catalog.packages.title", value: "One ritual, complete from start to finish." },
  {
    key: "catalog.packages.description",
    value:
      "Several treatments combined in one visit — for time that is truly set aside for yourself.",
  },
  { key: "catalog.packages.back", value: "All treatments" },
  { key: "catalog.packages.empty_title", value: "No packages yet" },
  {
    key: "catalog.packages.empty_description",
    value: "Packages will appear here once published from the admin dashboard.",
  },
  { key: "catalog.package.not_found_title", value: "Package not found" },
  { key: "catalog.package.loading_title", value: "Loading package…" },
  { key: "catalog.package.eyebrow", value: "Package" },
  { key: "catalog.package.cta_whatsapp", value: "Reserve via WhatsApp" },
  { key: "catalog.package.includes_title", value: "What's included" },
  { key: "catalog.package.others_title", value: "Other packages" },
  { key: "catalog.package.back", value: "All packages" },
  { key: "retail.hero.eyebrow", value: "Retail" },
  { key: "retail.hero.title", value: "Continue the ritual at home." },
  {
    key: "retail.hero.description",
    value:
      "The products we use in our treatment rooms, available to take home. Order via WhatsApp.",
  },
  { key: "retail.highlight_title", value: "Highlight" },
  { key: "retail.collaboration_title", value: "Collaborations" },
  { key: "retail.other_title", value: "Other products" },
  { key: "retail.price_missing", value: "Contact us" },
  { key: "retail.order_label", value: "Order via WhatsApp" },
  { key: "retail.empty_title", value: "No retail products yet" },
  {
    key: "retail.empty_description",
    value: "Products will appear here once published from the admin dashboard.",
  },
];





export const EXTRA_CONTENT_BLOCKS: { key: string; value: string }[] = [
  { key: "contact.location.open_maps", value: "Open in Maps" },
  { key: "gift_card.hero.eyebrow", value: "Gift Card" },
  { key: "gift_card.missing_title", value: "Gift Card" },
  { key: "gift_card.missing_description", value: "Gift card information is not yet available." },
  { key: "gift_card.order_label", value: "Order via WhatsApp" },
  { key: "gift_card.terms_title", value: "Terms & conditions" },
  { key: "gift_card.cta_title", value: "Not sure which treatment to choose?" },
  { key: "gift_card.cta_description", value: "Browse the full menu first — the gift card works for everything." },
  { key: "gift_card.cta_label", value: "View Treatments" },
  { key: "global.badge_new", value: "New" },
  { key: "global.badge_best_seller", value: "Best Seller" },
  { key: "global.package_label", value: "Package" },
  { key: "global.duration_label", value: "Duration" },
  { key: "global.event_partner_prefix", value: "With" },
  { key: "global.partner_logo_alt", value: "Partner logo" },
  { key: "corporate.hero.eyebrow", value: "Corporate Wellness Solutions" },
  { key: "corporate.about_title", value: "About Us" },
  { key: "corporate.about_p1", value: "KAMA Spa is a wellness sanctuary in the heart of South Jakarta." },
  { key: "corporate.about_p2", value: "Combining traditional healing techniques and modern wellness approaches, KAMA Spa offers thoughtfully curated treatments designed to restore balance, relaxation, and mindful presence." },
  { key: "corporate.about_quote", value: "More than relaxation — we create meaningful reset experiences." },
  { key: "corporate.benefits_title", value: "Healthy Employees Build Stronger Companies" },
  { key: "corporate.benefits_quote", value: "Wellness is not an expense. It's an investment in your people." },
  { key: "corporate.partner_eyebrow", value: "Why Partner with KAMA?" },
  { key: "corporate.partner_title", value: "Thoughtfully designed wellness experiences that go beyond massage." },
  { key: "corporate.partner_description", value: "Our goal isn't simply to provide massage. We create meaningful wellness experiences for your people." },
  { key: "corporate.in_office_eyebrow", value: "In-Office Program" },
  { key: "corporate.in_office_title", value: "A Restorative Wellness Experience at Your Workplace" },
  { key: "corporate.in_office_sample", value: "Sample Programs*" },
  { key: "corporate.in_spa_eyebrow", value: "In-Spa Corporate Experience" },
  { key: "corporate.in_spa_title", value: "Bring Your Team Together Through Wellness" },
  { key: "corporate.in_spa_fallback", value: "Treat your employees to a private wellness experience at KAMA Spa—designed to reward, reconnect, and recharge your team in a calm and premium environment." },
  { key: "corporate.ideal_for", value: "Ideal For:" },
  { key: "corporate.steps_eyebrow", value: "From Consultation to Partnership" },
  { key: "corporate.steps_title_prefix", value: "A Simple" },
  { key: "corporate.steps_title_suffix", value: "Step Collaboration Process" },
  { key: "corporate.step_label", value: "Step" },
  { key: "corporate.collab_eyebrow", value: "Past Collaborations" },
  { key: "corporate.collab_title", value: "Wellness in action — on location" },
  { key: "corporate.inquiry_eyebrow", value: "Corporate Inquiry" },
  { key: "corporate.inquiry_title", value: "Tell us about your team." },
  { key: "corporate.inquiry_description", value: "Share a few details and our corporate team will get back to you with a program tailored to your company." },
  { key: "corporate.banner_title", value: "Let's build your wellness program." },
  { key: "corporate.talk_prefix", value: "Talk to" },
  { key: "corporate_form.name", value: "Name *" },
  { key: "corporate_form.company", value: "Company" },
  { key: "corporate_form.email", value: "Email *" },
  { key: "corporate_form.phone", value: "Phone" },
  { key: "corporate_form.message", value: "Message *" },
  { key: "corporate_form.message_placeholder", value: "Number of employees, program type (in-office / in-spa), preferred dates…" },
  { key: "corporate_form.consent_prefix", value: "I agree that KAMA Spa may use the details above solely to follow up on this inquiry, in accordance with the" },
  { key: "corporate_form.privacy_label", value: "Privacy Policy" },
  { key: "corporate_form.consent_suffix", value: "." },
  { key: "corporate_form.submit", value: "Send Inquiry" },
  { key: "corporate_form.submitting", value: "Sending…" },
  { key: "corporate_form.unavailable", value: "The inquiry form is currently unavailable. Please contact our corporate team directly:" },
  { key: "corporate_form.whatsapp", value: "WhatsApp" },
  { key: "corporate_form.success_title", value: "Thank you — your inquiry has been sent." },
  { key: "corporate_form.success_body", value: "The KAMA team will get back to you during operating hours. For urgent matters, contact us via WhatsApp." },
  { key: "corporate_form.error_name", value: "Name is required." },
  { key: "corporate_form.error_email_required", value: "Email is required." },
  { key: "corporate_form.error_email_format", value: "Invalid email format." },
  { key: "corporate_form.error_message", value: "Message must be at least 10 characters." },
  { key: "corporate_form.error_consent", value: "Please check this consent box." },
  { key: "corporate_form.error_captcha", value: "Please complete the captcha first." },
  { key: "corporate_form.error_captcha_load", value: "The captcha failed to load. Reload the page and try again." },
  { key: "corporate_form.error_incomplete", value: "Please complete the fields that are empty or invalid." },
  { key: "corporate_form.error_send", value: "Something went wrong while sending. Please try again or contact us via WhatsApp." },
  { key: "corporate_form.error_network", value: "Could not reach the server. Check your connection and try again." },
  { key: "events.hero.eyebrow", value: "Events" },
  { key: "events.hero.title", value: "Upcoming events at KAMA Spa." },
  { key: "events.hero.description", value: "Programs and collaborations we have prepared for you — both upcoming and past." },
  { key: "events.upcoming.eyebrow", value: "Upcoming" },
  { key: "events.upcoming.title", value: "What's coming up" },
  { key: "events.upcoming.description", value: "Events you can still join — places are limited." },
  { key: "events.upcoming.empty_title", value: "No events scheduled yet" },
  { key: "events.upcoming.empty_description", value: "Stay tuned for the next announcement — follow @kama__spa for the latest updates." },
  { key: "events.past.eyebrow", value: "Past Events" },
  { key: "events.past.title", value: "What we've hosted" },
  { key: "events.past.description", value: "Moments from the events we have hosted." },
  { key: "events.past.empty_title", value: "No event history yet" },
  { key: "events.past.empty_description", value: "Event history will appear here once programs are completed." },
  { key: "events.collab_title", value: "Past collaborations" },
  { key: "events.collab_description", value: "Wellness programs we have run together with partners and companies." },
  { key: "events.collab_cta", value: "View Collaborations" },
  { key: "events.collab.hero_eyebrow", value: "Collaborations" },
  { key: "events.collab.hero_title", value: "Wellness in action — on location." },
  { key: "events.collab.hero_description", value: "Corporate wellness programs and collaborations we have run with our partners." },
  { key: "events.collab.section_eyebrow", value: "Past Collaborations" },
  { key: "events.collab.section_title", value: "Programs we have run" },
  { key: "events.collab.empty_title", value: "No collaborations recorded yet" },
  { key: "events.collab.empty_description", value: "Completed collaborations will appear here." },
  { key: "events.detail.not_found_title", value: "Event Not Found" },
  { key: "events.detail.loading_title", value: "Loading event…" },
  { key: "events.detail.register_label", value: "Register via WhatsApp" },
  { key: "events.detail.back_label", value: "All Events" },
  { key: "events.detail.title", value: "Event details" },
  { key: "events.detail.empty_title", value: "Event details not yet available" },
  { key: "events.detail.empty_description", value: "Contact us via WhatsApp for more information." },
  { key: "events.detail.location_prefix", value: "Location:" },
  { key: "events.detail.collab_label", value: "Collaboration" },
  { key: "events.detail.gallery_title", value: "Event Gallery" },
  { key: "gallery.hero.eyebrow", value: "Gallery" },
  { key: "gallery.hero.title", value: "A quiet look inside KAMA Spa." },
  { key: "gallery.hero.description", value: "Glimpses of the atmosphere, rituals, and small details that make every visit feel like a pause." },
  { key: "gallery.photo_count_suffix", value: "photos" },
  { key: "gallery.empty_title", value: "No photos yet" },
  { key: "gallery.empty_description", value: "Photos will appear here once uploaded from the admin dashboard." },
  { key: "journal.hero.eyebrow", value: "Journal" },
  { key: "journal.hero.title", value: "Notes from KAMA Spa." },
  { key: "journal.hero.description", value: "Writing on rituals, wellness, and the art of slowing down — from our team to you." },
  { key: "journal.loading", value: "Loading…" },
  { key: "journal.all_label", value: "All" },
  { key: "journal.tag_label", value: "Tag" },
  { key: "journal.empty_title", value: "No articles yet" },
  { key: "journal.empty_filtered_title", value: "No articles with this tag yet" },
  { key: "journal.empty_description", value: "New articles will appear here once published." },
  { key: "journal.detail.not_found_title", value: "Article not found" },
  { key: "journal.detail.loading_title", value: "Loading article…" },
  { key: "journal.detail.back_label", value: "All Journal" },
  { key: "journal.detail.empty_body", value: "The full article is not yet available." },
  { key: "journal.detail.others_title", value: "More articles" },
  { key: "our_story.hero.eyebrow", value: "Our Story" },
  { key: "our_story.hero.description", value: "KAMA Spa was born from a simple wish: to give you space to pause, breathe, and return to yourself." },
  { key: "our_story.missing_title", value: "Our story is not yet available" },
  { key: "our_story.missing_description", value: "Our Story content will appear here once published." },
  { key: "our_story.philosophy_eyebrow", value: "Philosophy" },
  { key: "our_story.philosophy_title", value: "A space to return" },
  { key: "our_story.values_eyebrow", value: "Values" },
  { key: "our_story.values_title", value: "What we stand for" },
  { key: "our_story.journal_eyebrow", value: "Journal" },
  { key: "our_story.journal_title", value: "Reading from KAMA" },
  { key: "our_story.journal_description", value: "Notes on rituals, wellness, and the art of slowing down." },
  { key: "our_story.journal_cta", value: "View Journal" },
  { key: "pages.header_eyebrow", value: "KAMA Spa" },
  { key: "pages.loading_title", value: "Loading page…" },
  { key: "pages.not_found_title", value: "Page not found" },
  { key: "pages.empty_body", value: "This page's content is not yet available." },
  { key: "pages.updated_label", value: "Last updated" },
  { key: "promos.hero.eyebrow", value: "Promos" },
  { key: "promos.hero.title", value: "Offers now running." },
  { key: "promos.hero.description", value: "Active promos at KAMA Spa — valid for the periods shown." },
  { key: "promos.active.eyebrow", value: "Active Promos" },
  { key: "promos.active.title", value: "Now running" },
  { key: "promos.active.description", value: "Promos you can still use today." },
  { key: "promos.empty_title", value: "No active promos yet" },
  { key: "promos.empty_description", value: "Stay tuned for the next promo — this list fills automatically as promos are published." },
  { key: "promos.membership_title", value: "KAMA Membership" },
  { key: "promos.membership_description", value: "One essential service credit every month, member prices across the menu, and more exclusive benefits." },
  { key: "promos.membership_cta", value: "View Membership" },
  { key: "promos.detail.not_found_title", value: "Promo Not Found" },
  { key: "promos.detail.loading_title", value: "Loading promo…" },
  { key: "promos.detail.ask_label", value: "Ask About This Promo via WhatsApp" },
  { key: "promos.detail.back_label", value: "All Promos" },
  { key: "promos.detail.title", value: "Promo details" },
  { key: "promos.detail.empty_title", value: "Promo details not yet available" },
  { key: "promos.detail.empty_description", value: "Contact us via WhatsApp for more information." },
  { key: "promos.detail.terms_title", value: "Terms & conditions" },
  { key: "promos.membership.hero_eyebrow", value: "Membership" },
  { key: "promos.membership.hero_title", value: "KAMA Membership." },
  { key: "promos.membership.hero_description", value: "Make every me-time moment count. Each month brings credit for one essential service, member prices across the menu, and offers reserved for KAMA members." },
  { key: "promos.membership.join_label", value: "Join KAMA Now" },
  { key: "promos.membership.menu_label", value: "View Menu" },
  { key: "promos.membership.plans_eyebrow", value: "Membership Plans" },
  { key: "promos.membership.plans_title", value: "Choose the plan that fits your rhythm." },
  { key: "promos.membership.join_now_label", value: "Join Now" },
  { key: "promos.membership.empty_title", value: "No membership plans yet" },
  { key: "promos.membership.empty_description", value: "Membership plans will appear here once published." },
];


// Grup registry baru: links (href CTA), microcopy (alt & aria), forms
// (reservasi). Nilai = teks yang selama ini hardcoded di
// komponen publik, supaya tampilan tidak berubah. Placeholder {n}/{m}/
// {name}/{title} diganti saat render.
export const LINKS_MICROCOPY_FORMS_BLOCKS: { key: string; value: string }[] = [
  { key: "home.hero.menu_href", value: "/menu" },
  { key: "menu.booking_cta_href", value: "/contact" },
  { key: "menu.detail_book_href", value: "/contact" },
  { key: "contact.cta_href", value: "/menu" },
  { key: "membership.menu_href", value: "/menu" },
  { key: "membership.contact_href", value: "/contact" },
  { key: "promos.membership_href", value: "/promos/membership" },
  { key: "promos.membership_menu_href", value: "/menu" },
  { key: "gift_card.cta_href", value: "/treatments" },
  { key: "events.collab_href", value: "/events/collaborations" },
  { key: "our_story.journal_href", value: "/our-story/journal" },
  { key: "corporate.privacy_href", value: "/privacy-policy" },
  { key: "global.nav_aria", value: "Global" },
  { key: "global.nav_open", value: "Open menu" },
  { key: "global.nav_close", value: "Close menu" },
  { key: "global.fab_aria", value: "Chat via WhatsApp" },
  { key: "global.socials_post_aria", value: "Instagram post {n}" },
  { key: "home.hero.slider_aria", value: "Choose hero visual" },
  { key: "home.hero.dot_aria", value: "Show visual {n} of {m}" },
  { key: "home.whats_new.cta_fallback", value: "Learn More" },
  { key: "home.reviews.aria_prev", value: "Previous review" },
  { key: "home.reviews.aria_next", value: "Next review" },
  { key: "home.reviews.aria_list", value: "Customer reviews" },
  { key: "home.reviews.dot_aria", value: "Go to review by {name}" },
  { key: "menu.scan_alt", value: "KAMA Spa menu book — page {n}" },
  { key: "menu.scan_aria", value: "Open menu book page {n}" },
  { key: "catalog.seo_category_description", value: "{name} at KAMA Spa — full durations and prices." },
  { key: "catalog.seo_treatment_description", value: "{name} at KAMA Spa — full durations and prices." },
  { key: "catalog.seo_package_description", value: "{name} at KAMA Spa — what's included, duration, and price." },
  { key: "contact.maps_title", value: "KAMA Spa — Google Maps" },
  { key: "journal.seo_description", value: "{title} — KAMA Spa Journal." },
  { key: "gallery.alt_fallback", value: "KAMA Spa gallery photo" },
  { key: "gallery.grid_aria", value: "Open photo {n} of {m}" },
  { key: "gallery.lightbox_prev", value: "Previous photo" },
  { key: "gallery.lightbox_next", value: "Next photo" },
  { key: "gallery.lightbox_close", value: "Close preview" },
  { key: "gallery.lightbox_counter", value: "{n} / {m}" },
  { key: "carousel.aria_prev", value: "Previous image" },
  { key: "carousel.aria_next", value: "Next image" },
  { key: "carousel.aria_counter", value: "Image {n} of {m}" },
  { key: "corporate.collab_alt_suffix", value: "KAMA corporate wellness collaboration" },
  { key: "forms.reservation.title", value: "Reservation" },
  {
    key: "forms.reservation.description",
    value: "Tell us which treatment you would like — the KAMA team will contact you to confirm your schedule.",
  },
  { key: "forms.reservation.name_label", value: "Name" },
  { key: "forms.reservation.phone_label", value: "Phone number" },
  { key: "forms.reservation.email_label", value: "Email address" },
  { key: "forms.reservation.branch_label", value: "Choose a branch" },
  { key: "forms.reservation.treatment_label", value: "Choose a treatment" },
  { key: "forms.reservation.date_label", value: "Date" },
  { key: "forms.reservation.time_label", value: "Time" },
  { key: "forms.reservation.guests_label", value: "Number of guests" },
  { key: "forms.reservation.message_label", value: "Additional notes (optional)" },
  { key: "forms.reservation.submit_label", value: "Send Reservation" },
  {
    key: "forms.reservation.success",
    value: "Thank you! Your reservation request has been received. We will contact you shortly.",
  },
  { key: "forms.reservation.error", value: "Oops! Something went wrong. Please try again." },
];

function groupFor(key: string): string {
  return key.split(".")[0] ?? "global";
}

export async function seedContent(prisma: PrismaClient): Promise<void> {
  for (const [index, section] of HOMEPAGE_SECTIONS.entries()) {
    const existing = await prisma.homepageSection.findUnique({
      where: { key: section.key },
    });
    const data = {
      eyebrow: section.eyebrow ?? null,
      title: section.title,
      subtitle: section.subtitle ?? null,
      imageUrl: section.imageUrl ?? null,
      imageAlt: section.imageAlt ?? null,
      ctaLabel: section.ctaLabel ?? null,
      ctaHref: section.ctaHref ?? null,
      sortOrder: index,
    };

    if (!existing) {
      await prisma.homepageSection.create({ data: { key: section.key, ...data } });
      continue;
    }

    const update: Record<string, unknown> = {};
    const titleIsLegacy =
      !existing.title.trim() ||
      (section.legacyTitles ?? []).includes(existing.title.trim());
    if (titleIsLegacy) update.title = data.title;
    if (!existing.eyebrow?.trim() && data.eyebrow) update.eyebrow = data.eyebrow;
    if (!existing.subtitle?.trim() && data.subtitle) update.subtitle = data.subtitle;
    if (!existing.imageUrl?.trim() && data.imageUrl) update.imageUrl = data.imageUrl;
    if (!existing.imageAlt?.trim() && data.imageAlt) update.imageAlt = data.imageAlt;
    if (!existing.ctaLabel?.trim() && data.ctaLabel) update.ctaLabel = data.ctaLabel;
    if (!existing.ctaHref?.trim() && data.ctaHref) update.ctaHref = data.ctaHref;

    await prisma.homepageSection.update({ where: { id: existing.id }, data: update });
  }
  console.log(`✔ ${HOMEPAGE_SECTIONS.length} section homepage berisi konten`);

  for (const block of [...CONTENT_BLOCKS, ...EXTRA_CONTENT_BLOCKS, ...LINKS_MICROCOPY_FORMS_BLOCKS]) {
    const existing = await prisma.contentBlock.findUnique({ where: { key: block.key } });
    if (!existing) {
      await prisma.contentBlock.create({
        data: { key: block.key, group: groupFor(block.key), value: block.value },
      });
    } else if (!existing.value.trim()) {
      await prisma.contentBlock.update({
        where: { key: block.key },
        data: { value: block.value, group: groupFor(block.key) },
      });
    }
  }
  console.log(
    `✔ ${CONTENT_BLOCKS.length + EXTRA_CONTENT_BLOCKS.length + LINKS_MICROCOPY_FORMS_BLOCKS.length} teks halaman`,
  );

  const program = staticMembershipProgram();
  const existingProgram = await prisma.membershipProgram.findUnique({
    where: { id: "singleton" },
  });
  if (!existingProgram) {
    await prisma.membershipProgram.create({
      data: {
        id: "singleton",
        eyebrow: program.eyebrow,
        title: program.title,
        intro: program.intro,
        priceHeadline: program.priceHeadline,
        bannerBody: program.bannerBody,
        bannerCtaLabel: homeMembership.cta,
        bannerCtaHref: homeMembership.href,
        benefits: program.benefits,
        servicesIntro: program.servicesIntro,
        services: program.services,
        termsHtml: program.termsHtml,
      },
    });
    console.log("✔ program membership");
  } else {
    console.log("• program membership dilewati (sudah ada)");
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (settings) {
    const update: Record<string, string> = {};
    if (!settings.footerTagline?.trim()) update.footerTagline = program.intro;
    if (!settings.priceDisclaimer?.trim()) update.priceDisclaimer = priceDisclaimer;
    if (!settings.footerMembershipTitle?.trim()) {
      update.footerMembershipTitle = "Become a KAMA Member for Rp 1,500,000 a month";
    }
    if (!settings.footerMembershipLearnLabel?.trim()) {
      update.footerMembershipLearnLabel = "Learn More";
    }
    if (!settings.footerMembershipJoinLabel?.trim()) {
      update.footerMembershipJoinLabel = "Join KAMA Now";
    }
    if (!settings.partnershipIntro?.trim()) {
      update.partnershipIntro = "Collaborations & partnerships:";
    }
    if (!settings.partnershipEmail?.trim()) {
      update.partnershipEmail = "marketing@kamaspa.id";
    }
    if (!settings.bookNowLabel?.trim()) update.bookNowLabel = "Book Now";
    if (!settings.bookNowHref?.trim()) update.bookNowHref = "/reservation";
    // Galeri menu book (section #gallery di /menu): 10 halaman scan + PDF di
    // bucket S3 — dulu statis di public/img, kini dikelola dari Pengaturan.
    const menuScans =
      (settings.menuScanUrls ?? []).length === 0
        ? Array.from({ length: 10 }, (_, i) =>
            asset(`img/kama/menu/menu-page-${String(i + 1).padStart(2, "0")}.jpg`),
          )
        : null;
    if (!settings.menuPdfUrl?.trim()) update.menuPdfUrl = asset("img/kama/menu/kama-menu-2026.pdf");
    if (Object.keys(update).length > 0 || menuScans) {
      await prisma.siteSettings.update({
        where: { id: "singleton" },
        data: { ...update, ...(menuScans ? { menuScanUrls: menuScans } : {}) },
      });
    }
    console.log("✔ pengaturan teks footer/partnership & galeri menu");
  }

  console.log(
    `✔ membership page copy tersedia (${pageMembership.plans.length} tier tetap dikelola modul Membership)`,
  );
}
