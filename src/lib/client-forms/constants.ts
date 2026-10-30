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
    title: "Business / Corporate Website",
    desc: "Present your company, services, trust badges & client reviews",
  },
  {
    id: "landing_page",
    title: "One-Page Landing Page",
    desc: "Clean single page designed for ads & WhatsApp inquiries",
  },
  {
    id: "portfolio",
    title: "Portfolio / Agency",
    desc: "Showcase creative work, projects, photography or services",
  },
] as const;

export const DEFAULT_PACKAGES: FormPackage[] = [
  {
    id: "landing",
    title: "Landing Page Website",
    price: 299,
    revisions: "Complete Ready-to-Launch",
    features: [
      "Modern Responsive Layout",
      "Mobile & Tablet Friendly",
      "WhatsApp Direct Chat Button",
      "Fast 48-Hour Delivery",
    ],
  },
  {
    id: "business",
    title: "Business / Company Website",
    price: 399,
    revisions: "Multi-Page Complete Website",
    popular: true,
    features: [
      "Multi-Page Company Layout",
      "Mobile, Tablet & Desktop Responsive",
      "WhatsApp Direct Button & Contact Form",
      "Admin Panel & Basic SEO Setup",
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce Store Website",
    price: 499,
    revisions: "Full Online Store",
    features: [
      "Product Catalog & Category Setup",
      "WhatsApp Instant Order System",
      "Google Map & Social Media Links",
      "Admin Panel to Manage Products",
    ],
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
