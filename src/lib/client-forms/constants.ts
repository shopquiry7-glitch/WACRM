import type { FormPackage, FormAddon } from "@/types/client-forms";

export const BUSINESS_CATEGORIES = [
  "Clothing & Fashion",
  "Retail & E-Commerce",
  "Restaurant & Cafe",
  "Real Estate & Property",
  "Beauty, Salon & Spa",
  "Health, Clinic & Pharmacy",
  "Corporate & Consulting",
  "Construction & Interior Design",
  "Cleaning & Maintenance",
  "Tourism, Travel & Visa",
  "Automotive & Garage",
  "IT & Digital Services",
  "Other",
] as const;

export const WEBSITE_TYPES = [
  {
    id: "ecommerce",
    title: "E-Commerce / Online Store",
    desc: "Sell products online with cart, catalog & WhatsApp checkout",
  },
  {
    id: "business",
    title: "Business / Corporate Showcase",
    desc: "Present your company, services, trust badges & client reviews",
  },
  {
    id: "portfolio",
    title: "Portfolio / Agency",
    desc: "Showcase creative work, projects, photography or services",
  },
  {
    id: "landing_page",
    title: "One-Page Landing Page",
    desc: "High-converting single page designed for ad campaigns",
  },
  {
    id: "catalog_menu",
    title: "Digital Catalog / Menu",
    desc: "QR code digital catalog, restaurant menu or PDF browser",
  },
] as const;

export const DEFAULT_PACKAGES: FormPackage[] = [
  {
    id: "starter",
    title: "3 Websites Designs - No Revisions",
    price: 299,
    revisions: "No Revisions",
    features: [
      "3 Modern Layout Concepts",
      "Mobile & Tablet Responsive",
      "WhatsApp Direct Button",
      "Admin Panel Included",
      "Fast 48-Hour Turnaround",
    ],
  },
  {
    id: "standard",
    title: "3 Websites Designs - 1 Revision",
    price: 399,
    revisions: "1 Comprehensive Revision",
    popular: true,
    features: [
      "3 Modern Layout Concepts",
      "1 Round of Free Revisions",
      "Mobile, Tablet & Desktop Responsive",
      "WhatsApp Direct Button & Contact Form",
      "Admin Panel & Basic SEO Setup",
    ],
  },
  {
    id: "premium",
    title: "3 Websites Designs - 2 Revisions",
    price: 499,
    revisions: "2 Comprehensive Revisions",
    features: [
      "3 Premium Custom Layouts",
      "2 Rounds of Revisions",
      "Full Product / Services Setup",
      "Google Map & Social Media Links",
      "Priority VIP Turnaround",
    ],
  },
];

export const DEFAULT_ADDONS: FormAddon[] = [
  {
    id: "company_profile",
    title: "Company Profile Design (PDF)",
    price: 100,
    description: "Professional digital PDF brochure for corporate clients",
  },
  {
    id: "google_map_seo",
    title: "Google Map & Local SEO Setup",
    price: 120,
    description: "Location pinning on Google Maps & metadata indexing",
  },
  {
    id: "social_integration",
    title: "Social Media Feeds & Links",
    price: 80,
    description: "Embed live Instagram grid and TikTok links",
  },
  {
    id: "express_delivery",
    title: "24-Hour Express Launch",
    price: 150,
    description: "Rush development for urgent marketing campaigns",
  },
];

export const COUNTRY_CODES = [
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
];

