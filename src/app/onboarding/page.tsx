"use client";

import { useState, useEffect } from "react";
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
  MessageCircle,
  MapPin,
  Mail,
  Clock,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  BUSINESS_CATEGORIES,
  WEBSITE_TYPES,
  DEFAULT_PACKAGES,
  COUNTRY_CODES,
} from "@/lib/client-forms/constants";
import { getZiinaLinkForAmount } from "@/lib/client-forms/payment-links";
import { saveNewSubmission, generateSubmissionRef } from "@/lib/client-forms/storage";
import type { ClientFormSubmission, FormPackage } from "@/types/client-forms";

const DRAFT_STORAGE_KEY = "wacrm_client_onboarding_draft_v2";

export default function PublicOnboardingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Business Profile
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Clothing & Fashion");
  const [businessTagline, setBusinessTagline] = useState("");
  const [targetLocations, setTargetLocations] = useState("UAE, Dubai & GCC");

  // Step 2: Website Scope & Requirements
  const [servicesProducts, setServicesProducts] = useState("");
  const [websiteType, setWebsiteType] = useState("Business / Corporate Website");
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

  // Logo & Assets
  const [logoStatus, setLogoStatus] = useState<"upload" | "send_whatsapp" | "need_logo_design">("send_whatsapp");
  const [logoFileName, setLogoFileName] = useState("");

  // Selected package
  const [selectedPackage, setSelectedPackage] = useState<FormPackage>(DEFAULT_PACKAGES[1]); // Business AED 399

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
      toast.error("Please fill in your name, business name and WhatsApp number.");
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
      totalEstimate: selectedPackage.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Save to local storage
      saveNewSubmission(submissionPayload);

      // 2. Persist to API / Supabase
      await fetch("/api/client-forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      // Clear draft
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      setSubmittedData(submissionPayload);
      toast.success("Details submitted successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmittedData(submissionPayload);
      toast.success("Submission saved! We will contact you on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp confirmation url
  const getWhatsAppConfirmationUrl = () => {
    if (!submittedData) return "#";
    const agencyNumber = "971545069473";
    const text = encodeURIComponent(
      `Hello! 👋 I have just submitted the website project form for *${submittedData.businessName}* (Ref: #${submittedData.referenceNumber}).\n\n` +
      `👤 Name: ${submittedData.clientName}\n` +
      `🌐 Type: ${submittedData.websiteType}\n` +
      `📍 Location: ${submittedData.businessAddress || submittedData.targetLocations || "UAE"}\n\n` +
      `Please check our submission.`
    );
    return `https://wa.me/${agencyNumber}?text=${text}`;
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================
  if (submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card/50 to-background flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans text-foreground">
        <div className="max-w-xl mx-auto w-full pt-8 pb-16">
          <div className="rounded-3xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl p-6 sm:p-10 text-center relative overflow-hidden">
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
              Your website details for{" "}
              <strong className="text-foreground">{submittedData.businessName}</strong> have been
              received by our team.
            </p>

            {/* Submission Reference Badge */}
            <div className="my-6 inline-flex items-center gap-2 rounded-2xl bg-muted/60 border border-border px-5 py-3 text-center">
              <span className="text-xs uppercase font-medium text-muted-foreground">
                Reference Code:
              </span>
              <span className="font-mono text-base font-bold text-primary">
                #{submittedData.referenceNumber}
              </span>
            </div>

            {/* Overview Card */}
            <div className="rounded-2xl border border-border bg-background/60 p-5 text-left space-y-2.5 mb-8 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Business:</span>
                <span className="font-semibold text-foreground">{submittedData.businessName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold text-foreground">{submittedData.businessCategory}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Website Type:</span>
                <span className="font-semibold text-primary">{submittedData.websiteType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">WhatsApp Contact:</span>
                <span className="font-mono font-medium text-foreground">
                  {submittedData.whatsappNumber}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href={getZiinaLinkForAmount(submittedData.totalEstimate)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white py-3.5 px-6 font-bold text-sm sm:text-base shadow-lg shadow-[#059669]/20 transition-all hover:scale-[1.01]"
              >
                <CreditCard className="h-5 w-5" />
                Pay via Ziina (Apple Pay / Card)
              </a>

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
          Powered by <strong className="text-foreground">Jeose CRM &bull; Agency Web Studio</strong>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN STREAMLINED FORM (3 CLEAN STEPS)
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background flex flex-col justify-between p-3 sm:p-6 md:p-10 font-sans text-foreground">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full pt-4 pb-6 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-600 text-white shadow-md shadow-primary/20">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                Website Project Details
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Please share your business details so we can build your website
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
      <main className="max-w-2xl mx-auto w-full py-6 sm:py-8 flex-1">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Business</span>
            <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Website Details</span>
            <span className={step >= 3 ? "text-primary font-bold" : ""}>3. Contact &amp; Logo</span>
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
          <div className="rounded-3xl border border-border/80 bg-card/90 shadow-xl backdrop-blur-md p-5 sm:p-8 space-y-6">
            {/* STEP 1: BUSINESS PROFILE */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Building2 className="h-3.5 w-3.5" /> Step 1: Business Profile
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Business Information
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your brand name and category for the website
                  </p>
                </div>

                {/* Business Name */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Business / Brand Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Mahra Fashion, Al-Baraka Properties"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Business Category */}
                <div className="space-y-1.5">
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
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Clothing & Fashion", "Retail & E-Commerce", "Restaurant & Cafe", "Real Estate & Property", "Beauty, Salon & Spa", "Other"].map((c) => (
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

                {/* Tagline */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Slogan or Tagline</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={businessTagline}
                    onChange={(e) => setBusinessTagline(e.target.value)}
                    placeholder="e.g. Luxury Abayas & Evening Dresses"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Target Locations */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Target Cities / Countries
                  </label>
                  <input
                    type="text"
                    value={targetLocations}
                    onChange={(e) => setTargetLocations(e.target.value)}
                    placeholder="e.g. UAE, Dubai, Saudi Arabia, Qatar, Worldwide"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: WEBSITE SCOPE & REQUIREMENTS */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Layers className="h-3.5 w-3.5" /> Step 2: Website Scope
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Website Requirements
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Describe your products and website preferences
                  </p>
                </div>

                {/* Website Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    What type of website do you need?
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
                            <span className="font-bold text-xs sm:text-sm text-foreground">{wt.title}</span>
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

                {/* Products & Services */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Products or Services List <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={servicesProducts}
                    onChange={(e) => setServicesProducts(e.target.value)}
                    placeholder="e.g. Abayas, Evening dresses, Custom stitching, Handbags. Or your company services..."
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Reference Website Links */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Reference Websites or Links You Like</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={referenceWebsites}
                    onChange={(e) => setReferenceWebsites(e.target.value)}
                    placeholder="e.g. https://example.com, or 'luxury clean white & gold design'"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Special Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Special Notes or Instructions</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      e.g. &quot;All photos are in WhatsApp chat&quot;
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Any specific instructions, deadlines, languages (Arabic/English), etc."
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT DETAILS & LOGO */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Phone className="h-3.5 w-3.5" /> Step 3: Contact &amp; Logo
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Contact &amp; Assets
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Where can we reach you and send your website preview?
                  </p>
                </div>

                {/* Contact Name */}
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
                          {c.flag} {c.code}
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
                    Full number: <span className="font-mono text-foreground font-semibold">{fullWhatsApp}</span>
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. info@yourbrand.com"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Business Physical Address */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Complete Business Address / Location
                  </label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g. Deira Gold Souq Gate 2, Dubai, UAE"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  />
                </div>

                {/* Working Hours & Socials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Working Hours</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="e.g. Mon - Sun 09:00 AM - 12:00 Night"
                      className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Instagram / TikTok</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="e.g. @mahra.fashion"
                      className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
                    />
                  </div>
                </div>

                {/* Logo Section */}
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
                      <span className="text-[10px] opacity-80">Send in chat</span>
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
                      <span className="block font-bold">📁 Upload Logo</span>
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
                      <span className="block font-bold">✨ Need Logo Created</span>
                      <span className="text-[10px] opacity-80">Design for me</span>
                    </button>
                  </div>

                  {logoStatus === "upload" && (
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <UploadCloud className="h-6 w-6 text-primary mb-1" />
                        <span className="text-xs font-semibold text-foreground">
                          {logoFileName ? `Selected: ${logoFileName}` : "Click to select logo file"}
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
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
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
                      <Send className="h-4 w-4" /> Submit Website Details
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto w-full pt-4 pb-2 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} Jeose CRM &bull; Agency Website Onboarding Portal</p>
      </footer>
    </div>
  );
}
