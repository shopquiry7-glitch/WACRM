"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getStoredSubmissions,
  saveAllSubmissions,
  updateSubmissionStatus,
  updateSubmissionInternalNotes,
  deleteSubmission,
  saveNewSubmission,
  SAMPLE_SUBMISSIONS,
} from "@/lib/client-forms/storage";
import type { ClientFormSubmission, FormSubmissionStatus } from "@/types/client-forms";
import { FormsStatsBar } from "@/components/client-forms/forms-stats-bar";
import { SubmissionViewDialog } from "@/components/client-forms/submission-view-dialog";
import { ShareFormDialog } from "@/components/client-forms/share-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileText,
  Search,
  Share2,
  ExternalLink,
  Plus,
  MessageCircle,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Inbox,
  ArrowUpDown,
  Building2,
  Phone,
  RotateCcw,
} from "lucide-react";

export default function ClientFormsPage() {
  const [submissions, setSubmissions] = useState<ClientFormSubmission[]>(() =>
    getStoredSubmissions()
  );

  // Sync listener for cross-tab or new submissions
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSubmissions(e.detail);
      } else {
        setSubmissions(getStoredSubmissions());
      }
    };
    window.addEventListener("wacrm_submissions_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Also try fetching from API if Supabase table exists
    fetch("/api/client-forms")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.submissions && data.submissions.length > 0) {
          // Merge API submissions with local
          const local = getStoredSubmissions();
          const map = new Map<string, ClientFormSubmission>();
          local.forEach((item) => map.set(item.id, item));
          data.submissions.forEach((item: ClientFormSubmission) => map.set(item.id, item));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setSubmissions(merged);
          saveAllSubmissions(merged);
        }
      })
      .catch(() => {
        // quiet fallback to local storage
      });

    return () => {
      window.removeEventListener("wacrm_submissions_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modals state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ClientFormSubmission | null>(null);

  // Handlers
  const handleStatusChange = async (id: string, status: FormSubmissionStatus) => {
    const updated = updateSubmissionStatus(id, status);
    setSubmissions(updated);
    if (selectedSubmission && selectedSubmission.id === id) {
      setSelectedSubmission({ ...selectedSubmission, status });
    }
    toast.success(`Submission status updated to ${status}`);

    try {
      await fetch("/api/client-forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      // quiet fallback
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const updated = updateSubmissionInternalNotes(id, notes);
    setSubmissions(updated);
    if (selectedSubmission && selectedSubmission.id === id) {
      setSelectedSubmission({ ...selectedSubmission, internalNotes: notes });
    }

    try {
      await fetch("/api/client-forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, internalNotes: notes }),
      });
    } catch (e) {
      // quiet fallback
    }
  };

  const handleDelete = async (id: string) => {
    const updated = deleteSubmission(id);
    setSubmissions(updated);
    toast.success("Submission removed.");

    try {
      await fetch(`/api/client-forms?id=${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      // quiet fallback
    }
  };

  const handleAddDemo = () => {
    const randomId = `demo-${Date.now()}`;
    const demoRef = `WB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDemo: ClientFormSubmission = {
      id: randomId,
      referenceNumber: demoRef,
      status: "new",
      businessName: "Royal Perfumes & Oud",
      businessCategory: "Retail & E-Commerce",
      businessTagline: "Authentic Arabian Fragrances",
      targetLocations: "UAE, Saudi Arabia, Kuwait",
      servicesProducts: "Luxury Bukhoor, Pure Dehn Al Oud, French Eau de Parfum, Custom gift boxes.",
      websiteType: "E-Commerce / Online Store",
      referenceWebsites: "https://taif-al-emarat.com (minimalistic luxury layout)",
      specialNotes: "Need online card payment + Apple Pay and WhatsApp order button.",
      clientName: "Sultan Al-Shamsi",
      whatsappNumber: "+971509988776",
      callingNumber: "+971509988776",
      email: "info@royalperfumes.ae",
      businessAddress: "Mall of the Emirates, Ground Floor, Dubai, UAE",
      googleMapLink: "https://maps.google.com/?q=Mall+of+the+Emirates+Dubai",
      workingHours: "10:00 AM - 11:00 PM Daily",
      socialLinks: {
        instagram: "@royalperfumes.ae",
      },
      logoStatus: "upload",
      logoFileName: "royal-logo-gold.svg",
      hasExistingLogo: true,
      selectedPackage: {
        id: "standard",
        title: "3 Websites Designs - 1 Revision",
        price: 399,
        revisions: "1 Revision Included",
      },
      selectedAddons: [
        {
          id: "google_map_seo",
          title: "Google Map & Local SEO Setup",
          price: 120,
        },
      ],
      totalEstimate: 519,
      internalNotes: "High-priority retail client. Prepare mockup within 24 hours.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveNewSubmission(newDemo);
    setSubmissions(updated);
    toast.success(`Demo submission added: ${newDemo.businessName}`);
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.businessName.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        item.whatsappNumber.includes(q) ||
        item.referenceNumber.toLowerCase().includes(q) ||
        item.businessCategory.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.businessCategory === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [submissions, search, statusFilter, categoryFilter]);

  // Extract unique categories for filter
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => set.add(s.businessCategory));
    return Array.from(set);
  }, [submissions]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/30">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                Client Onboarding Forms
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
                <Sparkles className="h-3 w-3" /> Web Intake Hub
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Review website requirements, business details &amp; packages submitted by clients
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDemo}
            className="rounded-xl text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            + Demo Client
          </Button>

          <a
            href="/onboarding"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            Open Public Form
          </a>

          <Button
            size="sm"
            onClick={() => setShareModalOpen(true)}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Form Link
          </Button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <FormsStatsBar submissions={submissions} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none]">
          {[
            { id: "all", label: "All Forms", count: submissions.length },
            {
              id: "new",
              label: "New",
              count: submissions.filter((s) => s.status === "new").length,
            },
            {
              id: "reviewing",
              label: "Reviewing",
              count: submissions.filter((s) => s.status === "reviewing").length,
            },
            {
              id: "in_progress",
              label: "In Progress",
              count: submissions.filter((s) => s.status === "in_progress").length,
            },
            {
              id: "completed",
              label: "Completed",
              count: submissions.filter((s) => s.status === "completed").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, client, phone..."
              className="pl-8 h-9 text-xs rounded-xl bg-card"
            />
          </div>

          {existingCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-medium text-foreground focus:outline-none h-9 shrink-0"
            >
              <option value="all">All Categories</option>
              {existingCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Submissions List / Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-base text-foreground">No submissions found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {search || statusFilter !== "all"
              ? "No forms match your search filter. Try clearing filters."
              : "Share your onboarding link with your clients on WhatsApp to start receiving website briefs!"}
          </p>
          <div className="pt-2 flex items-center gap-2">
            {search || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="rounded-xl text-xs gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="rounded-xl text-xs gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Form Link
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="divide-y divide-border/60">
            {filteredSubmissions.map((sub) => {
              const cleanPhone = sub.whatsappNumber.replace(/[^0-9]/g, "");
              const waLink = `https://wa.me/${cleanPhone}`;

              return (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-violet-500/20 text-primary border border-primary/25 font-black text-sm">
                      {sub.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-foreground truncate">
                          {sub.businessName}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.2 rounded-md">
                          #{sub.referenceNumber}
                        </span>
                        {/* Status Chip */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            sub.status === "new"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : sub.status === "reviewing"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : sub.status === "in_progress"
                              ? "bg-sky-500/10 text-sky-500 border-sky-500/30"
                              : sub.status === "completed"
                              ? "bg-purple-500/10 text-purple-500 border-purple-500/30"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {sub.status === "new"
                            ? "New"
                            : sub.status === "reviewing"
                            ? "Reviewing"
                            : sub.status === "in_progress"
                            ? "In Progress"
                            : sub.status === "completed"
                            ? "Completed"
                            : "Archived"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Building2 className="h-3 w-3 text-muted-foreground" /> {sub.businessCategory}
                        </span>
                        <span>&bull;</span>
                        <span>
                          Client: <strong className="text-foreground">{sub.clientName}</strong>
                        </span>
                        <span>&bull;</span>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-emerald-500 hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" /> {sub.whatsappNumber}
                        </a>
                      </div>

                      {/* Snippet of services or notes */}
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                        {sub.servicesProducts || sub.specialNotes || "Website brief"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Package, Price & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        {sub.selectedPackage.title}
                      </span>
                      <span className="text-base font-black text-emerald-500 font-mono">
                        AED {sub.totalEstimate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all shadow-xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setViewModalOpen(true);
                        }}
                        className="rounded-xl text-xs font-semibold gap-1.5 h-9"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Form
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      <ShareFormDialog open={shareModalOpen} onOpenChange={setShareModalOpen} />

      {/* Submission Detail View Dialog */}
      <SubmissionViewDialog
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        submission={selectedSubmission}
        onStatusChange={handleStatusChange}
        onUpdateNotes={handleUpdateNotes}
        onDelete={handleDelete}
      />
    </div>
  );
}

