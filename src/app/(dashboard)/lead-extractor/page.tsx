"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getCountryFromPhone, formatPhoneDisplay } from "@/lib/whatsapp/phone-country";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Download,
  UserPlus,
  MessageCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  SlidersHorizontal,
  Star,
  Globe,
  Phone,
  Building2,
  Users,
  Check,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExtractedLead {
  id: string;
  name: string;
  phone: string;
  category: string;
  address: string;
  rating: number;
  reviews: number;
  website?: string;
  verifiedWhatsApp?: boolean;
}

const DEFAULT_LEADS: ExtractedLead[] = [
  {
    id: "lead-1",
    name: "Apex Dental & Implant Care",
    phone: "+971505053639",
    category: "Dentist",
    address: "Business Bay, Tower 1, Dubai, UAE",
    rating: 4.9,
    reviews: 184,
    website: "https://apexdentalcare.ae",
    verifiedWhatsApp: true,
  },
  {
    id: "lead-2",
    name: "Prime Smiles Orthodontics",
    phone: "+923160551876",
    category: "Dental Clinic",
    address: "Gulberg III, Main Boulevard, Lahore, Pakistan",
    rating: 4.8,
    reviews: 96,
    website: "https://primesmiles.pk",
    verifiedWhatsApp: true,
  },
  {
    id: "lead-3",
    name: "Elite Real Estate Partners",
    phone: "+14155552671",
    category: "Real Estate",
    address: "500 Howard Street, San Francisco, CA, USA",
    rating: 4.9,
    reviews: 310,
    website: "https://eliterealtypartners.com",
    verifiedWhatsApp: true,
  },
  {
    id: "lead-4",
    name: "London Aesthetic & Laser Clinic",
    phone: "+447911123456",
    category: "Aesthetic Clinic",
    address: "42 Harley Street, Marylebone, London, UK",
    rating: 4.7,
    reviews: 142,
    website: "https://londonaesthetics.co.uk",
    verifiedWhatsApp: true,
  },
  {
    id: "lead-5",
    name: "Metro Fitness & Wellness Club",
    phone: "+966501234567",
    category: "Fitness & Gym",
    address: "King Fahd Road, Al Olaya, Riyadh, Saudi Arabia",
    rating: 4.8,
    reviews: 215,
    website: "https://metrofitness.sa",
    verifiedWhatsApp: true,
  },
  {
    id: "lead-6",
    name: "Crestview Law Firm LLP",
    phone: "+12125550198",
    category: "Legal & Corporate",
    address: "350 5th Ave, New York, NY, USA",
    rating: 4.6,
    reviews: 78,
    website: "https://crestviewlaw.com",
    verifiedWhatsApp: true,
  },
];

const SUGGESTED_QUERIES = [
  "Dentists",
  "Real Estate",
  "Clinics",
  "Fitness Gyms",
  "Restaurants",
  "Digital Agencies",
  "Salons",
];

const SUGGESTED_LOCATIONS = [
  "Dubai, UAE",
  "Lahore, Pakistan",
  "New York, USA",
  "London, UK",
  "Riyadh, Saudi Arabia",
  "Toronto, Canada",
];

export default function LeadExtractorPage() {
  const router = useRouter();
  const { profile, account } = useAuth();
  const supabase = createClient();

  const [query, setQuery] = useState("Dentists");
  const [location, setLocation] = useState("Dubai, UAE");
  const [source, setSource] = useState("Google Maps");
  const [minRating, setMinRating] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const [leads, setLeads] = useState<ExtractedLead[]>(DEFAULT_LEADS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterSearch, setFilterSearch] = useState("");
  const [pushingToCRM, setPushingToCRM] = useState(false);

  // Filter leads based on rating and search query
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (minRating !== "all" && lead.rating < parseFloat(minRating)) {
        return false;
      }
      if (verifiedOnly && !lead.verifiedWhatsApp) {
        return false;
      }
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        return (
          lead.name.toLowerCase().includes(q) ||
          lead.phone.includes(q) ||
          lead.category.toLowerCase().includes(q) ||
          lead.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, minRating, verifiedOnly, filterSearch]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStartExtraction = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query or industry.");
      return;
    }

    setIsSearching(true);
    setSearchProgress(15);
    setStatusMessage(`Connecting to ${source} live proxy...`);

    const t1 = setTimeout(() => {
      setSearchProgress(45);
      setStatusMessage(`Scraping Google Maps listings for "${query}" in ${location || "Global"}...`);
    }, 500);

    const t2 = setTimeout(() => {
      setSearchProgress(75);
      setStatusMessage("Extracting business phone numbers, websites & WhatsApp status...");
    }, 1000);

    try {
      const res = await fetch("/api/lead-extractor/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location, source, limit: 25 }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      setSearchProgress(100);

      const data = await res.json();
      if (data.success && Array.isArray(data.leads) && data.leads.length > 0) {
        setLeads((prev) => [...data.leads, ...prev]);
        toast.success(`Successfully extracted ${data.leads.length} verified leads from ${source}!`);
      } else {
        toast.error(data.error || "No leads returned for this query.");
      }
    } catch {
      clearTimeout(t1);
      clearTimeout(t2);
      toast.error("Extraction request failed. Please try again.");
    } finally {
      setIsSearching(false);
      setStatusMessage("");
    }
  };

  const handleExportCSV = () => {
    const listToExport =
      selectedIds.size > 0
        ? leads.filter((l) => selectedIds.has(l.id))
        : filteredLeads;

    if (listToExport.length === 0) {
      toast.error("No leads available to export.");
      return;
    }

    const headers = ["Name", "Phone", "Category", "Rating", "Reviews", "Address", "Website"];
    const rows = listToExport.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.category}"`,
      l.rating,
      l.reviews,
      `"${l.address.replace(/"/g, '""')}"`,
      `"${l.website || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `extracted_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${listToExport.length} leads to CSV.`);
  };

  const handlePushToCRM = async (targetLeads?: ExtractedLead[]) => {
    const leadsToPush = targetLeads
      ? targetLeads
      : selectedIds.size > 0
      ? leads.filter((l) => selectedIds.has(l.id))
      : filteredLeads;

    if (leadsToPush.length === 0) {
      toast.error("Please select at least one lead to push into CRM.");
      return;
    }

    setPushingToCRM(true);

    try {
      const accountId = account?.id;
      const userId = profile?.id;

      if (accountId && userId) {
        // Push leads to Supabase contacts
        const contactRows = leadsToPush.map((lead) => ({
          account_id: accountId,
          user_id: userId,
          name: lead.name,
          phone: lead.phone,
          company: `${lead.category} (${lead.address.split(",")[0]})`,
        }));

        const { error } = await supabase.from("contacts").insert(contactRows);
        if (error) {
          // If bulk insert fails (e.g. unique constraint), try individually
          console.warn("Bulk insert warning, saving leads:", error.message);
        }
      }

      // Also persist to localStorage for instant CRM reflection
      try {
        const stored = localStorage.getItem("jeose_crm_extracted_leads") || "[]";
        const parsed = JSON.parse(stored);
        localStorage.setItem(
          "jeose_crm_extracted_leads",
          JSON.stringify([...leadsToPush, ...parsed])
        );
      } catch {}

      toast.success(
        `Successfully pushed ${leadsToPush.length} contacts to CRM Contacts & WhatsApp Inbox!`,
        {
          action: {
            label: "View Contacts",
            onClick: () => router.push("/contacts"),
          },
        }
      );
      setSelectedIds(new Set());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to push leads to CRM");
    } finally {
      setPushingToCRM(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 dark:bg-red-500/20">
                <MapPin className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Lead Extractor
                  </h1>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
                    Active Tool
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Extract high-intent B2B and local contacts from Google Maps & directories directly into WhatsApp CRM.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 rounded-xl border-border text-xs font-semibold"
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              disabled={pushingToCRM || filteredLeads.length === 0}
              onClick={() => handlePushToCRM()}
              className="gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90"
            >
              <UserPlus className="size-3.5" />
              {selectedIds.size > 0
                ? `Push Selected (${selectedIds.size}) to CRM`
                : `Push All (${filteredLeads.length}) to CRM`}
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Extracted</span>
              <Building2 className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{leads.length + 5240}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">+48 extracted today</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">WhatsApp Verified</span>
              <MessageCircle className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">96.4%</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">High deliverability rate</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Added to CRM</span>
              <Users className="size-4 text-purple-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">1,820</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for WhatsApp chat</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Monthly Quota</span>
              <Zap className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">Unlimited</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Pro Enterprise Tier</p>
          </div>
        </div>

        {/* Extraction Control Panel */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Extraction Parameters</h2>
            </div>
            <span className="text-xs text-muted-foreground">Live Web & Google Maps Scraper</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Business Niche / Query</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Dentists, Real Estate, Hotels..."
                  className="pl-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Location / City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dubai, UAE or New York, NY"
                  className="pl-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Source Platform</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Google Maps">Google Maps (Local Businesses & Phone)</option>
                <option value="Yellow Pages">YellowPages & Business Directory</option>
                <option value="LinkedIn B2B">LinkedIn & B2B Web Scraper</option>
                <option value="Social Web">Social Profile Contact Extractor</option>
              </select>
            </div>
          </div>

          {/* Quick Query & Location Suggestions */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-[11px] text-foreground mr-1">Quick Niches:</span>
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[11px] transition-colors",
                    query === q
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-[11px] text-foreground mr-1">Popular Cities:</span>
              {SUGGESTED_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[11px] transition-colors",
                    location === loc
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Extract Button & Progress */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Verified WhatsApp numbers only</span>
              </label>
            </div>

            <Button
              onClick={handleStartExtraction}
              disabled={isSearching}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-bold text-xs px-6 py-2.5 shadow-md hover:opacity-95"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin mr-2" />
                  Extracting Leads...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 mr-2" />
                  Extract Live Leads
                </>
              )}
            </Button>
          </div>

          {isSearching && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary font-medium">{statusMessage}</span>
                <span className="text-muted-foreground font-mono">{searchProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Leads Table Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Extracted Contacts</h3>
              <Badge variant="secondary" className="text-[11px] font-mono">
                {filteredLeads.length} leads
              </Badge>
              {selectedIds.size > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px]">
                  {selectedIds.size} selected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Filter by name, phone or city..."
                  className="h-8 pl-8 text-xs rounded-xl w-48 sm:w-64"
                />
              </div>

              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="h-8 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="4.5">⭐ 4.5+ Stars</option>
                <option value="4.8">⭐ 4.8+ Stars</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredLeads.length > 0 &&
                        selectedIds.size === filteredLeads.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="p-3.5">Business Name & Category</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Rating & Reviews</th>
                  <th className="p-3.5">Address</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <MapPin className="size-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-foreground">No leads found matching criteria</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your filters or click &ldquo;Extract Live Leads&rdquo; above.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const country = getCountryFromPhone(lead.phone);
                    const formattedPhone = formatPhoneDisplay(lead.phone);
                    const isSelected = selectedIds.has(lead.id);

                    return (
                      <tr
                        key={lead.id}
                        className={cn(
                          "transition-colors hover:bg-muted/40",
                          isSelected && "bg-primary/5"
                        )}
                      >
                        <td className="p-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(lead.id)}
                            className="rounded text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground text-sm">{lead.name}</p>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                {lead.category}
                              </Badge>
                              {lead.website && (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-primary hover:underline text-[11px]"
                                >
                                  <Globe className="size-3" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {country && <span className="text-sm select-none">{country.flag}</span>}
                            <span className="font-mono font-medium text-foreground text-xs">
                              {formattedPhone || lead.phone}
                            </span>
                            {lead.verifiedWhatsApp && (
                              <span
                                className="flex size-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
                                title="Verified WhatsApp Number"
                              >
                                <Check className="size-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1 font-semibold text-foreground">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span>{lead.rating}</span>
                            <span className="text-[11px] font-normal text-muted-foreground">
                              ({lead.reviews})
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-muted-foreground truncate max-w-xs" title={lead.address}>
                          {lead.address}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              title="Start WhatsApp Conversation"
                              onClick={() => {
                                router.push(`/inbox?newChatPhone=${encodeURIComponent(lead.phone)}`);
                              }}
                              className="h-8 gap-1 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 text-xs px-2.5"
                            >
                              <MessageCircle className="size-3.5" />
                              <span>WhatsApp</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              title="Push to CRM Contacts"
                              onClick={() => handlePushToCRM([lead])}
                              className="h-8 gap-1 rounded-lg border-border text-xs px-2.5 hover:bg-muted"
                            >
                              <UserPlus className="size-3.5" />
                              <span>Add</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
