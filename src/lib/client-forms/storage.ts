import type {
  ClientFormSubmission,
  ClientFormsStats,
  FormSubmissionStatus,
} from "@/types/client-forms";

const STORAGE_KEY = "wacrm_client_form_submissions_v1";

export const SAMPLE_SUBMISSIONS: ClientFormSubmission[] = [
  {
    id: "sub-seed-1",
    referenceNumber: "WB-5401",
    status: "new",
    businessName: "Mahra Fashion",
    businessCategory: "Clothing & Fashion",
    businessTagline: "Luxury Abayas & Evening Wear",
    targetLocations: "UAE, Saudi Arabia, Kuwait, Oman, Bahrain, Qatar",
    servicesProducts: "Ready-to-wear abayas, custom stitched suits, jalabiyas, luxury scarves and evening gowns.",
    websiteType: "E-Commerce / Online Store",
    referenceWebsites: "https://ounass.ae, https://namshi.com (clean luxury look with white & gold theme)",
    specialNotes: "All product photos and price list are sent in WhatsApp chat. Need fast checkout button.",
    clientName: "Habib Jan",
    whatsappNumber: "+971545069473",
    callingNumber: "+971545069473",
    email: "habibjan2445@gmail.com",
    businessAddress: "Deira Gold Souq, Gate No. 2, Dubai, United Arab Emirates",
    googleMapLink: "https://maps.google.com/?q=Deira+Gold+Souq+Dubai",
    workingHours: "Monday to Sunday: 09:00 AM - 12:00 Midnight",
    socialLinks: {
      instagram: "@mahra.fashion.dubai",
      tiktok: "@mahra_fashion",
    },
    logoStatus: "upload",
    logoFileName: "mahra-logo-gold.png",
    hasExistingLogo: true,
    selectedPackage: {
      id: "standard",
      title: "3 Websites Designs - 1 Revision",
      price: 399,
      revisions: "1 Revision Included",
    },
    selectedAddons: [
      {
        id: "company_profile",
        title: "Company Profile Design (PDF)",
        price: 100,
      },
      {
        id: "google_map_seo",
        title: "Google Map & Local SEO Setup",
        price: 120,
      },
    ],
    totalEstimate: 619,
    internalNotes: "Client contacted via WhatsApp. Wants gold & black luxury aesthetic.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "sub-seed-2",
    referenceNumber: "WB-4182",
    status: "in_progress",
    businessName: "Al-Baraka Real Estate",
    businessCategory: "Real Estate & Property",
    businessTagline: "Prime Properties in Dubai & Sharjah",
    targetLocations: "Dubai, Sharjah, Abu Dhabi, GCC Investors",
    servicesProducts: "Luxury off-plan apartments, villa rentals, commercial office spaces & property management.",
    websiteType: "Business / Corporate Showcase",
    referenceWebsites: "https://bayut.com, https://damacproperties.com",
    specialNotes: "Need inquiry form for each listing with direct WhatsApp lead alert.",
    clientName: "Tariq Al-Mansoor",
    whatsappNumber: "+971501234567",
    callingNumber: "+97143981122",
    email: "tariq@albarakaproperties.ae",
    businessAddress: "Business Bay, Iris Bay Tower, Floor 14, Dubai, UAE",
    googleMapLink: "https://maps.google.com/?q=Iris+Bay+Business+Bay+Dubai",
    workingHours: "Monday to Friday: 09:00 AM - 06:00 PM",
    socialLinks: {
      instagram: "@albaraka_dubai",
      facebook: "facebook.com/albarakarealestate",
    },
    logoStatus: "send_whatsapp",
    hasExistingLogo: true,
    selectedPackage: {
      id: "premium",
      title: "3 Websites Designs - 2 Revisions",
      price: 499,
      revisions: "2 Revisions Included",
    },
    selectedAddons: [
      {
        id: "company_profile",
        title: "Company Profile Design (PDF)",
        price: 100,
      },
    ],
    totalEstimate: 599,
    internalNotes: "Draft design concepts shared. Waiting for client feedback on concept 2.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

export function getStoredSubmissions(): ClientFormSubmission[] {
  if (typeof window === "undefined") return SAMPLE_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_SUBMISSIONS));
      return SAMPLE_SUBMISSIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_SUBMISSIONS));
    return SAMPLE_SUBMISSIONS;
  } catch (err) {
    console.error("Failed to load submissions from localStorage:", err);
    return SAMPLE_SUBMISSIONS;
  }
}

export function saveAllSubmissions(submissions: ClientFormSubmission[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    window.dispatchEvent(new CustomEvent("wacrm_submissions_updated", { detail: submissions }));
  } catch (err) {
    console.error("Failed to persist submissions to localStorage:", err);
  }
}

export function saveNewSubmission(submission: ClientFormSubmission): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  // Filter out any duplicate ID
  const updated = [submission, ...current.filter((item) => item.id !== submission.id)];
  saveAllSubmissions(updated);
  return updated;
}

export function updateSubmissionStatus(
  id: string,
  status: FormSubmissionStatus
): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  const updated = current.map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
  );
  saveAllSubmissions(updated);
  return updated;
}

export function updateSubmissionInternalNotes(
  id: string,
  internalNotes: string
): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  const updated = current.map((item) =>
    item.id === id ? { ...item, internalNotes, updatedAt: new Date().toISOString() } : item
  );
  saveAllSubmissions(updated);
  return updated;
}

export function deleteSubmission(id: string): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  const updated = current.filter((item) => item.id !== id);
  saveAllSubmissions(updated);
  return updated;
}

export function calculateFormsStats(submissions: ClientFormSubmission[]): ClientFormsStats {
  return submissions.reduce(
    (acc, curr) => {
      acc.total += 1;
      if (curr.status === "new") acc.newCount += 1;
      else if (curr.status === "reviewing") acc.reviewingCount += 1;
      else if (curr.status === "in_progress") acc.inProgressCount += 1;
      else if (curr.status === "completed") acc.completedCount += 1;
      else if (curr.status === "archived") acc.archivedCount += 1;

      acc.totalEstimatedRevenue += curr.totalEstimate || 0;
      return acc;
    },
    {
      total: 0,
      newCount: 0,
      reviewingCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      archivedCount: 0,
      totalEstimatedRevenue: 0,
    }
  );
}

export function generateSubmissionRef(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WB-${random}`;
}

