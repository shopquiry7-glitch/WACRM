"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Building2,
  Phone,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  UploadCloud,
  Send,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Clock,
  MapPin,
  Mail,
  FileText,
  BadgeAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  BUSINESS_CATEGORIES,
  WEBSITE_TYPES,
  DEFAULT_PACKAGES,
  DEFAULT_ADDONS,
  COUNTRY_CODES,
} from "@/lib/client-forms/constants";
import { saveNewSubmission, generateSubmissionRef } from "@/lib/client-forms/storage";
import type { ClientFormSubmission, FormPackage, FormAddon } from "@/types/client-forms";

const DRAFT_STORAGE_KEY = "wacrm_client_onboarding_draft";

export default function PublicOnboardingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Business Profile
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Clothing & Fashion");
  const [businessTagline, setBusinessTagline] = useState("");
  const [targetLocations, setTargetLocations] = useState("UAE, Dubai & GCC");

  // Step 2: Website Scope & Requirements
  const [servicesProducts, setServicesProducts] = useState("");
  const [websiteType, setWebsiteType] = useState("E-Commerce / Online Store");
  const [referenceWebsites, setReferenceWebsites] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Step 3: Contact & Business Location
  const [clientName, setClientName] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [callingNumber, setCallingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");

  // Step 4: Package, Assets & Addons
  const [selectedPackage, setSelectedPackage] = useState<FormPackage>(DEFAULT_PACKAGES[1]); // Standard AED 399
  const [selectedAddons, setSelectedAddons] = useState<FormAddon[]>([]);
  const [logoStatus, setLogoStatus] = useState<"upload" | "send_whatsapp" | "need_logo_design">("send_whatsapp");
  const [logoFileName, setLogoFileName] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ClientFormSubmission | null>(null);

  // Load URL query parameters or draft
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check query parameters (e.g. ?name=...&phone=...&biz=...)
    const params = new URLSearchParams(window.location.search);
    const qName = params.get("name") || params.get("client");
    const qPhone = params.get("phone") || params.get("whatsapp");
    const qBiz = params.get("biz") || params.get("business");

    if (qName) setClientName(qName);
    if (qBiz) setBusinessName(qBiz);
    if (qPhone) {
      // detect if has +
      if (qPhone.startsWith("+")) {
        const matchingCode = COUNTRY_CODES.find((c) => qPhone.startsWith(c.code));
        if (matchingCode) {
          setCountryCode(matchingCode.code);
          setPhoneDigits(qPhone.slice(matchingCode.code.length).replace(/\D/g, ""));
        } else {
          setPhoneDigits(qPhone.replace(/\D/g, ""));
        }
      } else {
        setPhoneDigits(qPhone.replace(/\D/g, ""));
      }
    }

    // Try restoring draft from localStorage
    try {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draft && !qBiz && !qName) {
        const d = JSON.parse(draft);
        if (d.businessName) setBusinessName(d.businessName);
        if (d.businessCategory) setBusinessCategory(d.businessCategory);
        if (d.businessTagline) setBusinessTagline(d.businessTagline);
        if (d.targetLocations) setTargetLocations(d.targetLocations);
        if (d.servicesProducts) setServicesProducts(d.servicesProducts);
        if (d.websiteType) setWebsiteType(d.websiteType);
        if (d.referenceWebsites) setReferenceWebsites(d.referenceWebsites);
        if (d.specialNotes) setSpecialNotes(d.specialNotes);
        if (d.clientName) setClientName(d.clientName);
        if (d.phoneDigits) setPhoneDigits(d.phoneDigits);
        if (d.countryCode) setCountryCode(d.countryCode);
        if (d.email) setEmail(d.email);
        if (d.businessAddress) setBusinessAddress(d.businessAddress);
        if (d.workingHours) setWorkingHours(d.workingHours);
      }
    } catch (e) {
      // ignore draft parse error
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (typeof window === "undefined" || submittedData) return;
    try {
      const draft = {
        businessName,
        businessCategory,
        businessTagline,
        targetLocations,
        servicesProducts,
        websiteType,
        referenceWebsites,
        specialNotes,
        clientName,
        countryCode,
        phoneDigits,
        email,
        businessAddress,
        workingHours,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      // ignore
    }
  }, [
    businessName,
    businessCategory,
    businessTagline,
    targetLocations,
    servicesProducts,
    websiteType,
    referenceWebsites,
    specialNotes,
    clientName,
    countryCode,
    phoneDigits,
    email,
    businessAddress,
    workingHours,
    submittedData,
  ]);

  // Calculate total estimate
  const totalAddonsPrice = selectedAddons.reduce((acc, a) => acc + a.price, 0);
  const totalEstimate = (selectedPackage?.price || 0) + totalAddonsPrice;

  const toggleAddon = (addon: FormAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const fullWhatsApp = `${countryCode}${phoneDigits.trim()}`;

  // Validate step
  const handleNextStep = () => {
    if (step === 1) {
      if (!businessName.trim()) {
        toast.error("Please enter your business or website name.");
        return;
      }
    }
    if (step === 2) {
      if (!servicesProducts.trim()) {
        toast.error("Please provide a brief description of your services or products.");
        return;
      }
    }
    if (step === 3) {
      if (!clientName.trim()) {
        toast.error("Please enter your name or contact person.");
        return;
      }
      if (!phoneDigits.trim() || phoneDigits.trim().length < 6) {
        toast.error("Please enter a valid WhatsApp number.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !clientName.trim() || !phoneDigits.trim()) {
      toast.error("Please fill in the required fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    const referenceNumber = generateSubmissionRef();
    const id = `sub-${Date.now()}`;

    const submissionPayload: ClientFormSubmission = {
      id,
      referenceNumber,
      status: "new",
      businessName: businessName.trim(),
      businessCategory,
      businessTagline: businessTagline.trim(),
      targetLocations: targetLocations.trim(),
      servicesProducts: servicesProducts.trim(),
      websiteType,
      referenceWebsites: referenceWebsites.trim(),
      specialNotes: specialNotes.trim(),
      clientName: clientName.trim(),
      whatsappNumber: fullWhatsApp,
      callingNumber: callingNumber.trim() || fullWhatsApp,
      email: email.trim(),
      businessAddress: businessAddress.trim(),
      googleMapLink: googleMapLink.trim(),
      workingHours: workingHours.trim(),
      socialLinks: {
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
      },
      logoStatus,
      logoFileName: logoFileName || undefined,
      hasExistingLogo: logoStatus !== "need_logo_design",
      selectedPackage: {
        id: selectedPackage.id,
        title: selectedPackage.title,
        price: selectedPackage.price,
        revisions: selectedPackage.revisions,
      },
      selectedAddons: selectedAddons.map((a) => ({
        id: a.id,
        title: a.title,
        price: a.price,
      })),
      totalEstimate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Save to local storage for immediate persistence
      saveNewSubmission(submissionPayload);

      // 2. Also send to backend API to persist in Supabase
      const res = await fetch("/api/client-forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      if (!res.ok) {
        console.warn("Backend API returned non-200, local sync preserved.");
      }

      // Clear draft
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      setSubmittedData(submissionPayload);
      toast.success("Website onboarding details submitted successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Submission error:", err);
      // Fallback is still saved locally
      setSubmittedData(submissionPayload);
      toast.success("Submission saved! We will be in touch shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp confirmation url generator
  const getWhatsAppConfirmationUrl = () => {
    if (!submittedData) return "#";
    const agencyNumber = "971545069473"; // agency support number
    const text = encodeURIComponent(
      `Hello! 👋 I have just submitted the website project form for *${submittedData.businessName}* (Ref: #${submittedData.referenceNumber}).\n\n` +
      `👤 Client: ${submittedData.clientName}\n` +
      `📦 Package: ${submittedData.selectedPackage.title} (${submittedData.selectedPackage.price} AED)\n` +
      `📍 Location: ${submittedData.businessAddress || submittedData.targetLocations || "UAE"}\n\n` +
      `Please review our submission and confirm.`
    );
    return `https://wa.me/${agencyNumber}?text=${text}`;
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================
  if (submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card/50 to-background flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans text-foreground">
        <div className="max-w-2xl mx-auto w-full pt-8 pb-16">
          <div className="rounded-3xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl p-6 sm:p-10 text-center relative overflow-hidden">
            {/* Glowing background gradient ring */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Details Received
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Thank You, {submittedData.clientName}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-md mx-auto">
              Your website onboarding brief for{" "}
              <strong className="text-foreground">{submittedData.businessName}</strong> has been
              received by our web design &amp; development team.
            </p>

            {/* Submission Reference Badge */}
            <div className="my-6 inline-flex items-center gap-2 rounded-2xl bg-muted/60 border border-border px-5 py-3 text-center">
              <span className="text-xs uppercase font-medium text-muted-foreground">
                Your Reference Number:
              </span>
              <span className="font-mono text-base font-bold text-primary">
                #{submittedData.referenceNumber}
              </span>
            </div>

            {/* Overview Card */}
            <div className="rounded-2xl border border-border bg-background/60 p-5 text-left space-y-3 mb-8 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Business:</span>
                <span className="font-semibold text-foreground">{submittedData.businessName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold text-foreground">{submittedData.businessCategory}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Selected Package:</span>
                <span className="font-semibold text-primary">
                  {submittedData.selectedPackage.title} ({submittedData.selectedPackage.price} AED)
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">WhatsApp Contact:</span>
                <span className="font-mono font-medium text-foreground">
                  {submittedData.whatsappNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Estimate:</span>
                <span className="font-bold text-base text-emerald-500">
                  {submittedData.totalEstimate} AED
                </span>
              </div>
            </div>

            {/* Next Steps & Action */}
            <div className="space-y-3">
              <a
                href={getWhatsAppConfirmationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-6 font-bold text-sm sm:text-base shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                Notify Us on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setStep(1);
                  setBusinessName("");
                  setServicesProducts("");
                  setSpecialNotes("");
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-2.5 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Submit Another Project
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/50">
          Powered by <strong className="text-foreground">Jeose CRM &amp; Digital Web Studio</strong>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN MULTI-STEP ONBOARDING FORM
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background flex flex-col justify-between p-3 sm:p-6 md:p-10 font-sans text-foreground">
      {/* Top Brand Header */}
      <header className="max-w-3xl mx-auto w-full pt-4 pb-6 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-600 text-white shadow-md shadow-primary/20">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                Website Project Brief
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Client Intake
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Simple 3-minute form &bull; Fill once, we build your website
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground">Step</span>
          <span className="ml-1 text-sm font-bold text-primary font-mono">
            {step} / {totalSteps}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full py-6 sm:py-8 flex-1">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Business</span>
            <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Scope</span>
            <span className={step >= 3 ? "text-primary font-bold" : ""}>3. Contact</span>
            <span className={step >= 4 ? "text-primary font-bold" : ""}>4. Package</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
          <div className="rounded-3xl border border-border/80 bg-card/80 shadow-xl backdrop-blur-md p-5 sm:p-8">
            {/* ============================================================
                STEP 1: BUSINESS PROFILE
               ============================================================ */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Building2 className="h-3.5 w-3.5" /> Step 1: Business Profile
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Tell us about your business
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    This will appear as the main branding on your website header and pages.
                  </p>
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>
                      Business / Brand Name <span className="text-destructive">*</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      e.g., Mahra Fashion, Al-Baraka Real Estate
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your company or brand name..."
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Business Category */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Business Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {/* Category Quick Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Clothing & Fashion", "Retail & E-Commerce", "Restaurant & Cafe", "Real Estate & Property", "Beauty, Salon & Spa"].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setBusinessCategory(c)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl transition-all border ${
                          businessCategory === c
                            ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                            : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slogan / Tagline */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Tagline or Slogan</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={businessTagline}
                    onChange={(e) => setBusinessTagline(e.target.value)}
                    placeholder="e.g., Luxury Abayas in Dubai, Quality You Can Trust"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Target Locations */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Target Service Areas / Countries</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Where are your customers?</span>
                  </label>
                  <input
                    type="text"
                    value={targetLocations}
                    onChange={(e) => setTargetLocations(e.target.value)}
                    placeholder="e.g., UAE, Dubai, Saudi Arabia, Qatar, Worldwide"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* ============================================================
                STEP 2: WEBSITE SCOPE & CONTENT
               ============================================================ */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Layers className="h-3.5 w-3.5" /> Step 2: Website Requirements
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    What does your website need?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Describe your products, website goals, and any design preferences.
                  </p>
                </div>

                {/* Website Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    What type of website do you want?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {WEBSITE_TYPES.map((wt) => {
                      const isSelected = websiteType === wt.title;
                      return (
                        <div
                          key={wt.id}
                          onClick={() => setWebsiteType(wt.title)}
                          className={`cursor-pointer rounded-2xl border p-3.5 transition-all text-left flex flex-col justify-between ${
                            isSelected
                              ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-sm"
                              : "bg-background/60 border-border hover:bg-muted/50 hover:border-border/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground">{wt.title}</span>
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{wt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Services / Products */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>
                      Products or Services to include <span className="text-destructive">*</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      List your main offerings
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={servicesProducts}
                    onChange={(e) => setServicesProducts(e.target.value)}
                    placeholder="e.g., Party Abayas, Silk Scarves, Custom Alterations. Or: Dental cleaning, teeth whitening, braces..."
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Reference Website Links */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Reference Websites or Style You Like</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={referenceWebsites}
                    onChange={(e) => setReferenceWebsites(e.target.value)}
                    placeholder="e.g., https://apple.com, or 'clean modern white and gold luxury look'"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Special Instructions / Notes */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Special Instructions or Notes</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      e.g., &quot;all products will be sent on WhatsApp&quot;
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Any specific instructions, required languages (English/Arabic), deadlines, etc."
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* ============================================================
                STEP 3: CONTACT & LOCATION
               ============================================================ */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Phone className="h-3.5 w-3.5" /> Step 3: Contact &amp; Details
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    How can we reach you?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    We will send website previews and mockups directly to your WhatsApp.
                  </p>
                </div>

                {/* Contact Person Name */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Your Name / Contact Person <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter your full name..."
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* WhatsApp Number with Country Code */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>
                      WhatsApp Number <span className="text-destructive">*</span>
                    </span>
                    <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> Previews sent here
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="rounded-2xl border border-border bg-background px-3 py-3 text-sm font-mono font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="545069473"
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Full number with code: <span className="font-mono text-foreground font-semibold">{fullWhatsApp}</span>
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., info@yourbrand.com or gmail"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Business Physical Address */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Complete Business Address / Location</span>
                    <span className="text-[11px] text-muted-foreground font-normal">To show on website footer/contact</span>
                  </label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g., Deira Gold Souq, Gate No. 2, Dubai, UAE"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Working Hours & Socials (Two columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Working Hours</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="e.g., Mon - Sun 09:00 AM - 12:00 Night"
                      className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Instagram / TikTok</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="e.g., @mahra.fashion"
                      className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================
                STEP 4: PACKAGE, ASSETS & ADDONS
               ============================================================ */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Sparkles className="h-3.5 w-3.5" /> Step 4: Package &amp; Launch
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Select Your Website Package
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    All packages include Admin Panel, Mobile Friendly layout and WhatsApp Integration.
                  </p>
                </div>

                {/* Package Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DEFAULT_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-primary/10 border-primary ring-2 ring-primary/40 shadow-md"
                            : "bg-background/60 border-border hover:bg-muted/50 hover:border-border/80"
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2.5 right-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 shadow-sm uppercase">
                            Most Popular
                          </span>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              {pkg.revisions}
                            </span>
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <h4 className="font-extrabold text-sm sm:text-base text-foreground leading-snug">
                            {pkg.title}
                          </h4>
                          <div className="mt-2 text-xl font-black text-primary">
                            AED {pkg.price}
                          </div>
                        </div>

                        <ul className="mt-4 space-y-1.5 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                          {pkg.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Logo & Assets Section */}
                <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-3">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Do you have a business logo?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLogoStatus("send_whatsapp")}
                      className={`rounded-xl border p-2.5 text-xs text-left transition-all ${
                        logoStatus === "send_whatsapp"
                          ? "bg-primary/10 border-primary text-foreground font-semibold"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="block font-bold">📲 Will send on WhatsApp</span>
                      <span className="text-[10px] opacity-80">Easiest option for clients</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLogoStatus("upload")}
                      className={`rounded-xl border p-2.5 text-xs text-left transition-all ${
                        logoStatus === "upload"
                          ? "bg-primary/10 border-primary text-foreground font-semibold"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="block font-bold">📁 Upload Logo File</span>
                      <span className="text-[10px] opacity-80">PNG, JPG, Vector</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLogoStatus("need_logo_design")}
                      className={`rounded-xl border p-2.5 text-xs text-left transition-all ${
                        logoStatus === "need_logo_design"
                          ? "bg-primary/10 border-primary text-foreground font-semibold"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="block font-bold">✨ Need Logo Designed</span>
                      <span className="text-[10px] opacity-80">We design it for you</span>
                    </button>
                  </div>

                  {logoStatus === "upload" && (
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <UploadCloud className="h-6 w-6 text-primary mb-1" />
                        <span className="text-xs font-semibold text-foreground">
                          {logoFileName ? `Selected: ${logoFileName}` : "Click to select logo from your device"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setLogoFileName(file.name);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Add-on Services */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Optional Add-on Services:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEFAULT_ADDONS.map((addon) => {
                      const isChecked = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${
                            isChecked
                              ? "bg-emerald-500/10 border-emerald-500/40 text-foreground"
                              : "bg-background/50 border-border hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                                isChecked ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground"
                              }`}
                            >
                              {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-foreground block">
                                {addon.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {addon.description}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-500 shrink-0 ml-2">
                            +AED {addon.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total Price Bar */}
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">
                      Estimated Project Investment:
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Package: {selectedPackage.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary font-mono">
                      AED {totalEstimate}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="mt-8 pt-5 border-t border-border flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all hover:translate-x-0.5"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 sm:px-8 py-3 text-sm sm:text-base font-extrabold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Website Brief
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full pt-4 pb-2 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} Jeose CRM &bull; Agency Website Onboarding Portal</p>
      </footer>
    </div>
  );
}
