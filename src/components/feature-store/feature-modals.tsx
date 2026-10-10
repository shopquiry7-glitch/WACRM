"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Check,
  Search,
  Download,
  Calendar,
  Clock,
  Plus,
  Send,
  Building2,
  Phone,
  MapPin,
  Star,
  Copy,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Link2,
  Trash2,
  ArrowRight,
  ExternalLink,
  Printer,
  ShieldCheck,
  Zap,
  Globe,
  Scissors,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// 1. LEAD EXTRACTOR WORKSPACE MODAL
// =========================================================================
interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  reviews: number;
}

const SAMPLE_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Jeose Healthcare Partner",
    phone: "+1 (555) 234-8901",
    address: "742 Evergreen Terrace, Suite 101",
    category: "Dentist",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "lead-2",
    name: "Elite Smiles Care",
    phone: "+1 (555) 345-6789",
    address: "128 Oak Avenue, 3rd Floor",
    category: "Dentist",
    rating: 4.9,
    reviews: 210,
  },
  {
    id: "lead-3",
    name: "Metro Orthodontics",
    phone: "+1 (555) 456-7890",
    address: "500 Market Street, Downtown",
    category: "Dental Care",
    rating: 4.7,
    reviews: 89,
  },
  {
    id: "lead-4",
    name: "Bright Smile Studio",
    phone: "+1 (555) 567-8901",
    address: "88 Lincoln Blvd",
    category: "Dentist",
    rating: 4.6,
    reviews: 67,
  },
  {
    id: "lead-5",
    name: "City Center Dental",
    phone: "+1 (555) 678-9012",
    address: "12 Grand Central Plaza",
    category: "Dental Clinic",
    rating: 4.9,
    reviews: 340,
  },
];

export function LeadExtractorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("Dentists");
  const [location, setLocation] = useState("New York, NY");
  const [source, setSource] = useState("Google Maps");
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setLeads([
        {
          id: `lead-${Date.now()}-1`,
          name: `${query} Specialist Center`,
          phone: "+1 (555) 890-1122",
          address: `100 Main St, ${location}`,
          category: query,
          rating: 4.9,
          reviews: 156,
        },
        ...SAMPLE_LEADS,
      ]);
      showToast(`Successfully extracted ${leads.length + 1} verified leads!`);
    }, 1200);
  };

  const exportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Phone,Category,Address,Rating,Reviews"]
        .concat(
          leads.map(
            (l) =>
              `"${l.name}","${l.phone}","${l.category}","${l.address}",${l.rating},${l.reviews}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `extracted_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file downloaded successfully!");
  };

  const importToCRM = () => {
    showToast(`${leads.length} contacts pushed into WhatsApp CRM inbox & pipeline!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <MapPin className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Lead Extractor</h2>
              <p className="text-xs text-muted-foreground">
                Extract high-intent B2B and consumer contacts from maps, directories & web listings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/lead-extractor"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-3.5" />
              <span>Full Workspace</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Search Parameters */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Keyword / Niche</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Dentists, Real Estate"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">City / Region</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, Dubai, London"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Data Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-purple-500 focus:outline-none"
            >
              <option>Google Maps</option>
              <option>Yellow Pages Directory</option>
              <option>Yelp Local</option>
              <option>TripAdvisor Places</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-98 disabled:opacity-60"
            >
              <Search className="size-3.5" />
              <span>{isSearching ? "Scraping Leads..." : "Extract Leads"}</span>
            </button>
          </div>
        </div>

        {/* Results Controls */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs font-semibold text-foreground">
            Found <span className="text-purple-600">{leads.length} leads</span> matching criteria
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={importToCRM}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
            >
              <Send className="size-3.5" />
              <span>Push to CRM Contacts</span>
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-border bg-background">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted/70 text-muted-foreground backdrop-blur-xs">
              <tr>
                <th className="p-3 font-semibold">Business Name</th>
                <th className="p-3 font-semibold">Phone</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Rating</th>
                <th className="p-3 font-semibold">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-semibold text-foreground">{lead.name}</td>
                  <td className="p-3 font-mono text-purple-600 dark:text-purple-400">{lead.phone}</td>
                  <td className="p-3 text-muted-foreground">{lead.category}</td>
                  <td className="p-3 text-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {lead.rating} ({lead.reviews})
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground truncate max-w-xs">{lead.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 2. CLINIC MANAGEMENT WORKSPACE MODAL
// =========================================================================
export function ClinicManagementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [appointments, setAppointments] = useState([
    { id: "apt-1", patient: "Sarah Connor", phone: "+1 555-0192", doctor: "Dr. Adams (Cardiology)", date: "Today, 02:30 PM", status: "Confirmed" },
    { id: "apt-2", patient: "Michael Scott", phone: "+1 555-0144", doctor: "Dr. Gomez (Dental)", date: "Tomorrow, 10:00 AM", status: "Pending" },
    { id: "apt-3", patient: "Emma Watson", phone: "+1 555-0188", doctor: "Dr. Adams (General)", date: "Tomorrow, 03:15 PM", status: "Confirmed" },
  ]);

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Adams (Cardiology)");
  const [selectedDate, setSelectedDate] = useState("Oct 02, 2026, 11:00 AM");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;
    setAppointments([
      {
        id: `apt-${Date.now()}`,
        patient: patientName,
        phone: patientPhone,
        doctor: selectedDoctor,
        date: selectedDate,
        status: "Confirmed",
      },
      ...appointments,
    ]);
    setPatientName("");
    setPatientPhone("");
    showToast("New appointment booked and WhatsApp reminder scheduled!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/40">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Clinic Management</h2>
              <p className="text-xs text-muted-foreground">
                Patient bookings, practitioner schedules, and automated WhatsApp appointment reminders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Quick Booking Form */}
        <form onSubmit={addAppointment} className="mt-4 rounded-xl border border-border bg-background p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Patient Booking</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              type="text"
              placeholder="Patient Full Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="WhatsApp Phone #"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              required
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
            />
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
            >
              <option>Dr. Adams (Cardiology)</option>
              <option>Dr. Gomez (Dental)</option>
              <option>Dr. Chen (Pediatrics)</option>
            </select>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 py-2 text-xs font-bold text-white hover:bg-purple-700"
            >
              <Plus className="size-3.5" />
              <span>Book & Alert Patient</span>
            </button>
          </div>
        </form>

        {/* Scheduled Appointments Table */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Upcoming Clinic Appointments</h3>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-border bg-background">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Schedule</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">WhatsApp Reminder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-muted/40">
                    <td className="p-3 font-semibold text-foreground">
                      {apt.patient}
                      <span className="block font-mono text-[10px] text-muted-foreground">{apt.phone}</span>
                    </td>
                    <td className="p-3 text-foreground">{apt.doctor}</td>
                    <td className="p-3 text-muted-foreground">{apt.date}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Automated WhatsApp confirmation sent to ${apt.patient}!`)}
                        className="rounded-md border border-purple-300 dark:border-purple-800 px-2.5 py-1 text-[11px] font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                      >
                        Send WA Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {toastMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 3. SALON MANAGEMENT WORKSPACE MODAL
// =========================================================================
export function SalonManagementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [services] = useState([
    { name: "Haircut & Styling", duration: "45 mins", price: "$35.00" },
    { name: "Organic Facial Treatment", duration: "60 mins", price: "$65.00" },
    { name: "Full Balayage Coloring", duration: "120 mins", price: "$140.00" },
    { name: "Classic Manicure & Pedicure", duration: "50 mins", price: "$45.00" },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40">
              <Scissors className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Salon Management</h2>
              <p className="text-xs text-muted-foreground">
                Service catalogue, stylist calendar, booking page link, and client retention notes.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        {/* Public Booking Link Card */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/50 p-3.5 dark:border-orange-900/40 dark:bg-orange-950/20">
          <div>
            <p className="text-xs font-bold text-foreground">Public Booking Page Link</p>
            <p className="text-xs text-muted-foreground font-mono">https://jeose-crm.app/book/my-salon</p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText("https://jeose-crm.app/book/my-salon");
              setToastMessage("Booking link copied to clipboard!");
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
          >
            <Copy className="size-3.5" />
            <span>Copy Link</span>
          </button>
        </div>

        {/* Services List */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Salon Services Menu</h3>
          <div className="divide-y divide-border/60 rounded-xl border border-border bg-background">
            {services.map((srv) => (
              <div key={srv.name} className="flex items-center justify-between p-3.5">
                <div>
                  <p className="text-xs font-bold text-foreground">{srv.name}</p>
                  <p className="text-[11px] text-muted-foreground">Duration: {srv.duration}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-foreground">{srv.price}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`Booking created for ${srv.name}!`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Quick Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {toastMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 4. E-COMMERCE WORKSPACE MODAL
// =========================================================================
export function EcommerceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [products, setProducts] = useState([
    { id: "p1", name: "Premium Arabica Coffee Beans (1kg)", price: 29.99, stock: 45, status: "Active" },
    { id: "p2", name: "Stainless Steel French Press", price: 39.50, stock: 18, status: "Active" },
    { id: "p3", name: "Artisan Ceramic Mug Set (x2)", price: 24.00, stock: 30, status: "Active" },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    setProducts([
      ...products,
      {
        id: `p-${Date.now()}`,
        name: newTitle,
        price: parseFloat(newPrice),
        stock: 50,
        status: "Active",
      },
    ]);
    setNewTitle("");
    setNewPrice("");
    setToastMessage("Product added to WhatsApp Catalogue & Store!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">E-Commerce Management</h2>
              <p className="text-xs text-muted-foreground">
                Sync product catalogues with WhatsApp Business API, generate 1-click checkout links.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        {/* Add Product Form */}
        <form onSubmit={addProduct} className="mt-4 flex gap-2 rounded-xl border border-border bg-background p-3">
          <input
            type="text"
            placeholder="Product Name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price USD"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
            className="w-28 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Add Product
          </button>
        </form>

        {/* Products Table */}
        <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-border bg-background">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/60 text-muted-foreground">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Inventory</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Checkout Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="p-3 font-semibold text-foreground">{p.name}</td>
                  <td className="p-3 font-bold text-foreground">${p.price.toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground">{p.stock} units</td>
                  <td className="p-3">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(`https://jeose-crm.app/checkout/${p.id}`);
                        setToastMessage(`Checkout link for "${p.name}" copied!`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="rounded-md border border-border px-2.5 py-1 text-xs text-purple-600 font-medium hover:bg-muted"
                    >
                      Copy Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {toastMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 5. OOO MESSAGES WORKSPACE MODAL
// =========================================================================
export function OOOMessagesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [enabled, setEnabled] = useState(true);
  const [template, setTemplate] = useState(
    "Hi {customer_name}! Thank you for messaging Jeose CRM. We are currently out of office. Our team will get back to you by 9:00 AM tomorrow."
  );
  const [startHour, setStartHour] = useState("18:00");
  const [endHour, setEndHour] = useState("09:00");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const saveSettings = () => {
    setToastMessage("Out of Office automation settings saved successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40">
              <Clock className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Out of Office (OOO) Messages</h2>
              <p className="text-xs text-muted-foreground">
                Automatically reply to customer chats received outside your operating business hours.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-background">
            <div>
              <p className="text-xs font-bold text-foreground">OOO Auto-Reply Status</p>
              <p className="text-[11px] text-muted-foreground">When active, inbound messages trigger this reply</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                enabled ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {enabled ? "ACTIVE" : "PAUSED"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Shift End (Start OOO)</label>
              <input
                type="time"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Shift Start (Stop OOO)</label>
              <input
                type="time"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Auto-Response Template</label>
            <textarea
              rows={3}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Available variables: {"{customer_name}"}, {"{agent_name}"}, {"{support_link}"}
            </p>
          </div>

          <button
            type="button"
            onClick={saveSettings}
            className="w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700"
          >
            Save OOO Configuration
          </button>
        </div>

        {toastMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 6. WP AUTO PUBLISHER WORKSPACE MODAL
// =========================================================================
export function WpAutoPublisherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [wpUrl, setWpUrl] = useState("https://myblog.com");
  const [topic, setTopic] = useState("WhatsApp Business Automation Tips");
  const [articlePreview, setArticlePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateArticle = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setArticlePreview(
        `# 5 Ways WhatsApp CRM Elevates Sales Conversion in 2026\n\nIn modern commerce, customers expect instant communication. By integrating automated workflows, direct payment links, and CRM pipeline tracking into WhatsApp, teams see up to 300% faster response rates.\n\nKey takeaways:\n1. Instant lead capture\n2. Real-time broadcast segments\n3. Integrated deal stages`
      );
      setToastMessage("SEO Article generated and ready to push to WordPress!");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40">
              <Globe className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">WP Auto Publisher</h2>
              <p className="text-xs text-muted-foreground">
                Connect your WordPress sites and generate SEO-optimized articles daily with AI.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">WordPress Site URL</label>
              <input
                type="text"
                value={wpUrl}
                onChange={(e) => setWpUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Article Niche / Keyword</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={generateArticle}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            <Sparkles className="size-4" />
            <span>{isGenerating ? "Generating Article via Groq AI..." : "Generate & Publish Sample Article"}</span>
          </button>

          {articlePreview && (
            <div className="mt-3 rounded-xl border border-border bg-background p-4 text-xs">
              <p className="font-bold text-purple-600 mb-1">Generated Draft Preview:</p>
              <pre className="whitespace-pre-wrap font-sans text-muted-foreground text-[11px] leading-relaxed">
                {articlePreview}
              </pre>
            </div>
          )}
        </div>

        {toastMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 7. WEBHOOKS WORKSPACE MODAL (Inbound, Outbound, Payment)
// =========================================================================
export function WebhooksModal({
  isOpen,
  onClose,
  type = "Inbound",
}: {
  isOpen: boolean;
  onClose: () => void;
  type?: "Inbound" | "Outbound" | "Payment";
}) {
  const [webhookUrl, setWebhookUrl] = useState(
    type === "Inbound"
      ? "https://jeose-crm.app/api/webhooks/inbound"
      : type === "Payment"
      ? "https://jeose-crm.app/api/webhooks/payment"
      : "https://my-external-api.com/crm-events"
  );
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const testTrigger = () => {
    setTestStatus("Sending test payload...");
    setTimeout(() => {
      setTestStatus("✓ Received 200 OK — Webhook operational!");
      setTimeout(() => setTestStatus(null), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/40">
              <Link2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{type} Webhooks</h2>
              <p className="text-xs text-muted-foreground">
                Connect external databases, Zapier, Make.com or payment gateways directly to CRM.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Endpoint URL</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(webhookUrl)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-3 text-xs">
            <p className="font-semibold text-foreground">Sample JSON Payload:</p>
            <pre className="mt-2 font-mono text-[10px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg overflow-x-auto">
{`{
  "event": "${type.toLowerCase()}.received",
  "account_id": "act_882910",
  "data": {
    "phone": "+15550192",
    "customer": "Alex Mercer",
    "status": "success",
    "timestamp": "${new Date().toISOString()}"
  }
}`}
            </pre>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={testTrigger}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
            >
              <Zap className="size-3.5" />
              <span>Send Test Ping</span>
            </button>
            {testStatus && <span className="text-xs font-semibold text-emerald-600">{testStatus}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 8. PRINTABLE INVOICE MODAL
// =========================================================================
export function InvoiceModal({
  isOpen,
  onClose,
  invoice,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: { id: string; date: string; item: string; amount: string; status: string } | null;
}) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Official Receipt</span>
            <h2 className="text-lg font-bold text-foreground">Invoice #{invoice.id}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Printer className="size-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <div>
              <p className="font-bold text-foreground">Billed To:</p>
              <p>Account Owner</p>
              <p>iyiw98h@example.com</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground">Issued Date:</p>
              <p>{invoice.date}</p>
              <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                {invoice.status}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 font-semibold text-foreground">{invoice.item}</td>
                  <td className="p-3 text-right font-bold text-foreground">{invoice.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between border-t border-border pt-3 text-sm font-bold text-foreground">
            <span>Total Paid</span>
            <span className="text-purple-600">{invoice.amount}</span>
          </div>

          <p className="text-center text-[10px] text-muted-foreground pt-2">
            Payment processed securely via Stripe. Thank you for choosing Jeose CRM!
          </p>
        </div>
      </div>
    </div>
  );
}
