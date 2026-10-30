export type FormSubmissionStatus =
  | 'new'
  | 'reviewing'
  | 'in_progress'
  | 'completed'
  | 'archived';

export interface FormPackage {
  id: string;
  title: string;
  price: number; // in AED
  revisions: string;
  features: string[];
  popular?: boolean;
}

export interface FormAddon {
  id: string;
  title: string;
  price: number; // in AED
  description?: string;
}

export interface ClientFormSubmission {
  id: string;
  referenceNumber: string; // e.g. "WB-9481"
  status: FormSubmissionStatus;

  // Step 1: Business Profile
  businessName: string;
  businessCategory: string;
  businessTagline?: string;
  targetLocations?: string; // e.g. "UAE, Dubai, Saudi Arabia, Qatar"

  // Step 2: Website Scope & Content
  servicesProducts: string; // Products/services description
  websiteType: string; // "E-Commerce", "Business Showcase", "Portfolio / Landing Page", "Booking / Catalog"
  referenceWebsites?: string; // Links or inspiration
  specialNotes?: string; // Notes / instructions (e.g. "all my products are in chat")

  // Step 3: Contact & Business Location
  clientName: string;
  whatsappNumber: string;
  callingNumber?: string;
  email?: string;
  businessAddress?: string;
  googleMapLink?: string;
  workingHours?: string;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    website?: string;
  };

  // Step 4: Package, Assets & Addons
  logoStatus: 'upload' | 'send_whatsapp' | 'need_logo_design';
  logoUrl?: string;
  logoFileName?: string;
  hasExistingLogo?: boolean;
  selectedPackage: {
    id: string;
    title: string;
    price: number;
    revisions: string;
  };
  selectedAddons?: Array<{
    id: string;
    title: string;
    price: number;
  }>;
  totalEstimate: number; // in AED

  // CRM Management & Meta
  contactId?: string; // Linked CRM contact ID
  internalNotes?: string;
  clientIp?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormsStats {
  total: number;
  newCount: number;
  reviewingCount: number;
  inProgressCount: number;
  completedCount: number;
  archivedCount: number;
  totalEstimatedRevenue: number;
}

