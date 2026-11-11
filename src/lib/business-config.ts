/**
 * Centralized Business Configuration for ANIL COMMUNICATION & ZEROX
 * 
 * All business identity, contact details, address, and service information
 * are maintained here as the single source of truth.
 * 
 * Update this file to change business information across the entire website.
 */

export const BUSINESS = {
  /** Official business display name (as printed on the shop signboard) */
  name: "ANIL COMMUNICATION & ZEROX",

  /** Short brand name for URLs, SEO slugs, internal references */
  brandSlug: "anil-communication",

  /** Business tagline */
  tagline: "Premium Smartphones & Accessories",

  /** Domain (update when live) */
  domain: "anilcommunications.com",
  url: "https://anilcommunications.com",

  /** Contact Numbers */
  phone: {
    /** Primary WhatsApp + customer contact */
    primary: "+91 9380124254",
    primaryRaw: "919380124254",
    /** Alternative telephone contacts (NOT WhatsApp) */
    alt1: "+91 8095908042",
    alt2: "+91 9538865867",
  },

  /** WhatsApp */
  whatsapp: {
    link: "https://wa.me/919380124254",
    displayNumber: "+91 9380124254",
    /** Build a WhatsApp link with a prefilled message */
    chatLink: (message: string) =>
      `https://wa.me/919380124254?text=${encodeURIComponent(message)}`,
  },

  /** Official shop address */
  address: {
    line1: "Near Canara Bank",
    line2: "Belagavi",
    landmark: "Near Canara Bank",
    pincode: "591103",
    state: "Karnataka",
    country: "India",
    /** Full formatted address */
    full: "Near Canara Bank, Belagavi, Karnataka - 591103, India",
    /** Short one-line address */
    short: "Near Canara Bank, Belagavi, Karnataka - 591103",
  },

  /** Official business services offered at the physical shop */
  services: [
    "Mobile phones & accessories",
    "All types of mobile repairing",
    "Colour printing & lamination",
    "Vehicle insurance",
    "Mobile EMI loans",
    "Taxi availability",
  ] as const,

  /** Owner info */
  owner: {
    displayName: "Shop Owner",
    adminEmail: "admin@anilcommunications.com",
  },

  /** Copyright */
  copyright: (year = new Date().getFullYear()) =>
    `© ${year} ANIL COMMUNICATION & ZEROX. All rights reserved.`,

  /** SEO metadata */
  seo: {
    title: "ANIL COMMUNICATION & ZEROX | Mobile Phones & Accessories Store",
    description:
      "Shop authentic smartphones, keypad phones, wireless earbuds, neckbands, and headphones with 100% manufacturer warranty and fast delivery. Belagavi, Karnataka.",
    ogTitle: "ANIL COMMUNICATION & ZEROX – Mobile Phones & Accessories",
    ogDescription:
      "Your trusted destination for 5G smartphones, feature phones, and certified audio accessories. 100% genuine, factory sealed with manufacturer warranty.",
  },

  /** GST Registration */
  gst: {
    registered: true,
    gstin: "29CQWPK2582Q1ZC",
  },

  /** Invoice / order footer text */
  invoiceFooter:
    "Thank you for shopping with ANIL COMMUNICATION & ZEROX!\nGoods once sold carry manufacturer warranty.\nPlease preserve this invoice for warranty and claim services.",
} as const;

export default BUSINESS;

