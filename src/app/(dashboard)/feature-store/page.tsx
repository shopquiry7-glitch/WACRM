"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Zap,
  Package,
  Calendar,
  CheckCircle2,
  Receipt,
  Check,
  ChevronRight,
  X,
  CreditCard,
  MapPin,
  MessageCircle,
  Megaphone,
  Stethoscope,
  Scissors,
  TrendingUp,
  Mail,
  Users,
  Bot,
  Target,
  Link2,
  Share2,
  ShoppingBag,
  Smartphone,
  Clock,
  Globe,
  Sparkles,
  ArrowRight,
  Filter,
  ExternalLink,
  Play,
  Pause,
  Trash2,
  Lock,
  Download,
  Crown,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LeadExtractorModal,
  ClinicManagementModal,
  SalonManagementModal,
  EcommerceModal,
  OOOMessagesModal,
  WpAutoPublisherModal,
  WebhooksModal,
  InvoiceModal,
} from "@/components/feature-store/feature-modals";

// Types
interface FeatureItem {
  id: string;
  title: string;
  category: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  priceOriginalYearly: number;
  discount: number;
  hasPackages?: boolean;
  packageButton?: string;
  internalRoute?: string; // Direct link if available in CRM
}

interface CartItem {
  id: string;
  title: string;
  category: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
}

interface Subscription {
  id: string;
  featureId: string;
  name: string;
  category: string;
  plan: string;
  amount: string;
  status: "Active" | "Paused";
  nextRenewal: string;
}

interface InvoiceRecord {
  id: string;
  date: string;
  item: string;
  amount: string;
  status: string;
}

const ALL_FEATURES: FeatureItem[] = [
  {
    id: "lead-extractor",
    title: "Lead Extractor",
    category: "Sales",
    badge: "3 plans",
    icon: MapPin,
    iconBg: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-500",
    description: "Extract leads from maps, directories and web sources. Choose the quota that fits your needs.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
    hasPackages: true,
    packageButton: "See Packages >",
    internalRoute: "/lead-extractor",
  },
  {
    id: "whatsapp-crm",
    title: "WhatsApp CRM",
    category: "Communication",
    icon: MessageCircle,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
    description: "Full inbox, contacts, labels, conversations & multi-agent support.",
    priceMonthly: 9.99,
    priceYearly: 102,
    priceOriginalYearly: 120,
    discount: 15,
    internalRoute: "/inbox",
  },
  {
    id: "wa-campaigns",
    title: "WA Campaigns",
    category: "Marketing",
    icon: Megaphone,
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
    description: "Bulk broadcast messages to segments with scheduling and analytics.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
    internalRoute: "/broadcasts",
  },
  {
    id: "wa-automations",
    title: "WA Automations",
    category: "Automation",
    icon: Zap,
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    iconColor: "text-rose-500",
    description: "Bot flows, auto-replies, keyword triggers and no-code automation builder.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
    internalRoute: "/automations",
  },
  {
    id: "clinic-management",
    title: "Clinic Management",
    category: "Healthcare",
    icon: Stethoscope,
    iconBg: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-500",
    description: "Appointments, patient records, staff scheduling and booking pages.",
    priceMonthly: 49.99,
    priceYearly: 480,
    priceOriginalYearly: 600,
    discount: 20,
  },
  {
    id: "salon-management",
    title: "Salon Management",
    category: "Beauty",
    icon: Scissors,
    iconBg: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-500",
    description: "Service menu, stylist schedules, online booking and client history.",
    priceMonthly: 39.99,
    priceYearly: 384,
    priceOriginalYearly: 480,
    discount: 20,
  },
  {
    id: "sales-pipeline",
    title: "Sales Pipeline",
    category: "Sales",
    icon: TrendingUp,
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
    description: "Kanban deal board, stages, tasks and revenue forecasting.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
    internalRoute: "/pipelines",
  },
  {
    id: "invoices-quotations",
    title: "Invoices / Quotations",
    category: "Sales",
    badge: "Popular",
    icon: Receipt,
    iconBg: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-500",
    description: "Quotations, Invoices & Receipts with WhatsApp direct share, PDF printing, Alina & Maya team workflow.",
    priceMonthly: 12.99,
    priceYearly: 120,
    priceOriginalYearly: 155,
    discount: 22,
    internalRoute: "/invoices",
  },
  {
    id: "email-management",
    title: "Email Management",
    category: "Communication",
    icon: Mail,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
    description: "Connect IMAP/SMTP accounts, unified inbox, campaigns and sequences.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
  },
  {
    id: "team-management",
    title: "Team Management",
    category: "Productivity",
    icon: Users,
    iconBg: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-500",
    description: "Add team members, assign roles, set granular feature permissions.",
    priceMonthly: 4.99,
    priceYearly: 48,
    priceOriginalYearly: 60,
    discount: 20,
    internalRoute: "/settings",
  },
  {
    id: "ai-integration",
    title: "AI Integration",
    category: "AI",
    icon: Bot,
    iconBg: "bg-pink-50 dark:bg-pink-950/30",
    iconColor: "text-pink-500",
    description: "GPT-powered smart replies, AI bots, sentiment analysis and summaries.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
    internalRoute: "/settings",
  },
  {
    id: "lead-management",
    title: "Lead Management",
    category: "Sales",
    icon: Target,
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
    description: "Manage, score and nurture leads through full lifecycle pipelines.",
    priceMonthly: 19.99,
    priceYearly: 192,
    priceOriginalYearly: 240,
    discount: 20,
    internalRoute: "/contacts",
  },
  {
    id: "inbound-webhooks",
    title: "Inbound Webhooks",
    category: "Integration",
    icon: Link2,
    iconBg: "bg-sky-50 dark:bg-sky-950/30",
    iconColor: "text-sky-500",
    description: "Receive data from external apps via webhooks and trigger automations.",
    priceMonthly: 9.0,
    priceYearly: 86,
    priceOriginalYearly: 108,
    discount: 20,
  },
  {
    id: "outbound-webhooks",
    title: "Outbound Webhooks",
    category: "Integration",
    icon: Share2,
    iconBg: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-500",
    description: "Push real-time events from the platform to any external URL.",
    priceMonthly: 14.99,
    priceYearly: 144,
    priceOriginalYearly: 180,
    discount: 20,
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    category: "Commerce",
    icon: ShoppingBag,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
    description: "Product catalog, order management, checkout links and payment collection.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
  },
  {
    id: "payment-webhooks",
    title: "Payment Webhooks",
    category: "Integration",
    icon: CreditCard,
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
    description: "Receive payment notifications from gateways and auto-update order status.",
    priceMonthly: 9.99,
    priceYearly: 96,
    priceOriginalYearly: 120,
    discount: 20,
  },
  {
    id: "wa-account-slot",
    title: "WA Account Slot",
    category: "Infrastructure",
    icon: Smartphone,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
    iconColor: "text-indigo-500",
    description: "Connect an additional WhatsApp number (each slot = +1 number).",
    priceMonthly: 4.99,
    priceYearly: 48,
    priceOriginalYearly: 60,
    discount: 20,
    internalRoute: "/settings",
  },
  {
    id: "ooo-messages",
    title: "OOO Messages",
    category: "Other",
    icon: Clock,
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
    description: "Track and manage messages received during out-of-office hours. Mark as replied with team member attribution.",
    priceMonthly: 4.9,
    priceYearly: 47,
    priceOriginalYearly: 59,
    discount: 20,
  },
  {
    id: "wp-auto-publisher",
    title: "WP Auto Publisher",
    category: "Other",
    icon: Globe,
    iconBg: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-500",
    description: "Connect WordPress sites and auto-publish AI-generated SEO blog articles daily using your own Groq API key.",
    priceMonthly: 25.0,
    priceYearly: 240,
    priceOriginalYearly: 300,
    discount: 20,
  },
];

const CATEGORIES = [
  "All",
  "Sales",
  "Communication",
  "Marketing",
  "Automation",
  "Healthcare",
  "Beauty",
  "Productivity",
  "AI",
  "Integration",
  "Commerce",
  "Infrastructure",
  "Other",
];

const LEAD_PACKAGES = [
  {
    name: "Starter",
    quota: "1,000 Leads / mo",
    price: 9.99,
    yearlyPrice: 96,
    desc: "Targeted map extraction for small local campaigns.",
    features: ["Google Maps Extractor", "Standard Directory Search", "CSV & Excel Export"],
  },
  {
    name: "Growth",
    popular: true,
    quota: "5,000 Leads / mo",
    price: 24.99,
    yearlyPrice: 240,
    desc: "Multi-channel scraping with verified business contacts.",
    features: ["All Starter Features", "Phone & Email Verification", "Auto-push to WA Inbox", "Bulk Deduplication"],
  },
  {
    name: "Unlimited",
    quota: "25,000 Leads / mo",
    price: 49.99,
    yearlyPrice: 480,
    desc: "Large scale enterprise lead pipeline with priority proxies.",
    features: ["Everything in Growth", "Full API Scraping Hook", "Dedicated Proxy Pool", "24/7 Priority Support"],
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-1",
    featureId: "whatsapp-crm",
    name: "WhatsApp CRM",
    category: "Communication",
    plan: "Standard Monthly",
    amount: "USD $9.99/mo",
    status: "Active",
    nextRenewal: "Oct 26, 2026",
  },
  {
    id: "sub-2",
    featureId: "lead-extractor",
    name: "Lead Extractor",
    category: "Sales",
    plan: "Starter Monthly",
    amount: "USD $9.99/mo",
    status: "Active",
    nextRenewal: "Oct 26, 2026",
  },
  {
    id: "sub-invoices",
    featureId: "invoices-quotations",
    name: "Invoices / Quotations",
    category: "Sales",
    plan: "Enterprise Suite",
    amount: "USD $12.99/mo",
    status: "Active",
    nextRenewal: "Oct 26, 2026",
  },
];

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "INV-2026-001",
    date: "Sep 26, 2026",
    item: "WhatsApp CRM & Lead Extractor (Monthly)",
    amount: "USD $19.98",
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    date: "Aug 26, 2026",
    item: "WhatsApp CRM (Monthly)",
    amount: "USD $9.99",
    status: "Paid",
  },
];

export default function FeatureStorePage() {
  const router = useRouter();

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<"store" | "subscriptions" | "history">("store");
  const { profile, accountRole, isOwner, isAdmin: isUserAdmin } = useAuth();
  const isAdmin = isOwner || isUserAdmin || accountRole === "owner" || accountRole === "admin" || !accountRole;
  const [clientPreviewMode, setClientPreviewMode] = useState(false);

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart & Orders
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscriptions & Invoices (with localStorage sync)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    if (typeof window === "undefined") return INITIAL_SUBSCRIPTIONS;
    try {
      const savedSubs = localStorage.getItem("jeose_crm_subscriptions");
      return savedSubs ? JSON.parse(savedSubs) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    if (typeof window === "undefined") return INITIAL_INVOICES;
    try {
      const savedInvoices = localStorage.getItem("jeose_crm_invoices");
      return savedInvoices ? JSON.parse(savedInvoices) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  // Active Tool Modals
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRecord | null>(null);

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem("jeose_crm_subscriptions", JSON.stringify(subscriptions));
    } catch {}
  }, [subscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem("jeose_crm_invoices", JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem("jeose_crm_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check if a feature is subscribed
  const isFeatureSubscribed = (featureId: string) => {
    if (isAdmin && !clientPreviewMode) return true;
    return subscriptions.some((s) => s.featureId === featureId && s.status === "Active");
  };

  // Launch a feature workspace
  const handleLaunchFeature = (feature: FeatureItem) => {
    if (feature.internalRoute) {
      router.push(feature.internalRoute);
      return;
    }

    // Modal tool workspaces
    switch (feature.id) {
      case "lead-extractor":
        setActiveToolModal("lead-extractor");
        break;
      case "clinic-management":
        setActiveToolModal("clinic");
        break;
      case "salon-management":
        setActiveToolModal("salon");
        break;
      case "ecommerce":
        setActiveToolModal("ecommerce");
        break;
      case "ooo-messages":
        setActiveToolModal("ooo");
        break;
      case "wp-auto-publisher":
        setActiveToolModal("wp");
        break;
      case "inbound-webhooks":
        setActiveToolModal("inbound-webhooks");
        break;
      case "outbound-webhooks":
        setActiveToolModal("outbound-webhooks");
        break;
      case "payment-webhooks":
        setActiveToolModal("payment-webhooks");
        break;
      case "email-management":
        showToast("Email Management connected! IMAP & SMTP gateway synced.");
        break;
      default:
        showToast(`${feature.title} is active and running!`);
        break;
    }
  };

  // Cart operations
  const addToCart = (feature: FeatureItem, customPrice?: number, customPlanName?: string) => {
    const price = customPrice ?? (billingPeriod === "yearly" ? feature.priceYearly : feature.priceMonthly);
    const existingIndex = cart.findIndex((item) => item.id === feature.id);

    if (existingIndex > -1) {
      setCart(cart.filter((item) => item.id !== feature.id));
    } else {
      setCart([
        ...cart,
        {
          id: feature.id,
          title: customPlanName ? `${feature.title} (${customPlanName})` : feature.title,
          category: feature.category,
          price,
          billingPeriod,
        },
      ]);
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const isInCart = (id: string) => cart.some((item) => item.id === id);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price, 0);
  }, [cart]);

  // Complete Checkout & Activate
  const handleCompletePayment = () => {
    if (cart.length === 0) return;

    const newSubs: Subscription[] = cart.map((item, idx) => ({
      id: `sub-new-${Date.now()}-${idx}`,
      featureId: item.id,
      name: item.title,
      category: item.category,
      plan: item.billingPeriod === "yearly" ? "Yearly Discounted" : "Monthly",
      amount: `USD $${item.price.toFixed(2)}${item.billingPeriod === "yearly" ? "/yr" : "/mo"}`,
      status: "Active",
      nextRenewal: item.billingPeriod === "yearly" ? "Sep 26, 2027" : "Oct 26, 2026",
    }));

    const newInvoice: InvoiceRecord = {
      id: `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`,
      date: "Sep 26, 2026",
      item: cart.map((c) => c.title).join(", "),
      amount: `USD $${cartTotal.toFixed(2)}`,
      status: "Paid",
    };

    setSubscriptions([...subscriptions, ...newSubs]);
    setInvoices([newInvoice, ...invoices]);
    setCart([]);
    setIsCartOpen(false);
    setShowCheckoutModal(false);
    showToast(`Payment of USD $${cartTotal.toFixed(2)} successful! Features activated.`);
  };

  // Subscriptions management
  const togglePauseSubscription = (id: string) => {
    setSubscriptions(
      subscriptions.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "Active" ? "Paused" : "Active";
          showToast(`Subscription ${s.name} is now ${nextStatus}.`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const cancelSubscription = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
    showToast(`Subscription for ${sub?.name || "feature"} was cancelled.`);
  };

  // Filter features
  const filteredFeatures = useMemo(() => {
    return ALL_FEATURES.filter((f) => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Dynamic monthly total
  const monthlyTotalFormatted = useMemo(() => {
    if (isAdmin && !clientPreviewMode) return "Free (Admin License)";
    const total = subscriptions
      .filter((s) => s.status === "Active")
      .reduce((sum, sub) => {
        const match = sub.amount.match(/\$([0-9.]+)/);
        if (match) {
          let val = parseFloat(match[1]);
          if (sub.amount.includes("/yr")) val = val / 12;
          return sum + val;
        }
        return sum;
      }, 0);
    return `$${total.toFixed(2)}`;
  }, [subscriptions, isAdmin, clientPreviewMode]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Feature Store</h1>
            {isAdmin && !clientPreviewMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Crown className="size-3.5 text-emerald-500" />
                Admin Panel: All Features Unlocked &amp; Free
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin && !clientPreviewMode
              ? "As an Administrator, all tools, lead extractors, and CRM modules are 100% free and active."
              : "Subscribe to individual features — pay only for what you use"}
          </p>
        </div>

        {/* Action Toggle / Cart Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setClientPreviewMode(!clientPreviewMode)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-xs",
                clientPreviewMode
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              <Eye className="size-3.5" />
              <span>{clientPreviewMode ? "Back to Admin View" : "Preview Client Pricing"}</span>
            </button>
          )}

          {(!isAdmin || clientPreviewMode) && (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-700 active:scale-95"
            >
              <ShoppingCart className="size-4" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-purple-600">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Summary Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Monthly Total */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <span className="text-xl font-bold">{isAdmin && !clientPreviewMode ? "👑" : "$"}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">License / Status</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{monthlyTotalFormatted}</p>
          </div>
        </div>

        {/* Card 2: Active Features */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Package className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Active Features</p>
            <p className="text-2xl font-bold text-foreground">
              {isAdmin && !clientPreviewMode
                ? `${ALL_FEATURES.length} / ${ALL_FEATURES.length} Active`
                : subscriptions.filter((s) => s.status === "Active").length}
            </p>
          </div>
        </div>

        {/* Card 3: Next Renewal */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Calendar className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Next Renewal</p>
            <p className="text-2xl font-bold text-foreground">
              {subscriptions.length > 0 ? subscriptions[0].nextRenewal : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("store")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
            activeTab === "store"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <ShoppingBag className="size-4" />
          Feature Store
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscriptions")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
            activeTab === "subscriptions"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <CheckCircle2 className="size-4 text-emerald-500" />
          My Subscriptions
          {subscriptions.length > 0 && (
            <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {subscriptions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
            activeTab === "history"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Receipt className="size-4" />
          Payment History
        </button>
      </div>

      {/* TAB 1: FEATURE STORE */}
      {activeTab === "store" && (
        <div className="space-y-6">
          {/* Yearly Discount Banner */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/90 to-indigo-50/60 p-4.5 dark:border-purple-900/40 dark:from-purple-950/20 dark:to-indigo-950/20 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                <Zap className="size-5 fill-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-950 dark:text-purple-200">
                  Save up to 20% with Yearly Billing
                </p>
                <p className="text-xs text-purple-700/90 dark:text-purple-400">
                  Pay once a year — each feature may have its own yearly discount.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-xs">
                -20% OFF
              </span>
              {/* Billing Switcher Toggle */}
              <div className="flex items-center rounded-lg border border-purple-200 bg-white p-1 text-xs font-medium dark:border-purple-800 dark:bg-card">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "rounded-md px-3 py-1 transition-colors",
                    billingPeriod === "monthly"
                      ? "bg-purple-600 text-white font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={cn(
                    "rounded-md px-3 py-1 transition-colors",
                    billingPeriod === "yearly"
                      ? "bg-purple-600 text-white font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="flex items-center gap-1 pl-1 text-muted-foreground pr-1">
                <Filter className="size-3" />
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1 font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-purple-600 text-white"
                      : "border border-border/50 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid - 2 columns matching PDF layout */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredFeatures.map((feature) => {
              const Icon = feature.icon;
              const inCart = isInCart(feature.id);
              const isSubscribed = isFeatureSubscribed(feature.id);

              return (
                <div
                  key={feature.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:border-purple-300 hover:shadow-md dark:hover:border-purple-900"
                >
                  <div>
                    {/* Top Row: Icon + Badges */}
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "flex size-11 items-center justify-center rounded-xl",
                          feature.iconBg,
                          feature.iconColor
                        )}
                      >
                        <Icon className="size-5" />
                      </div>

                      <div className="flex items-center gap-2">
                        {isSubscribed ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3 stroke-[3]" />
                            Subscribed
                          </span>
                        ) : feature.badge ? (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                            {feature.badge}
                          </span>
                        ) : null}
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {feature.category}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mt-3.5">
                      <h3 className="text-base font-bold text-foreground group-hover:text-purple-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Pricing & Action Button */}
                  <div className="mt-5 space-y-3 pt-2">
                    {/* Price display */}
                    {isAdmin && !clientPreviewMode ? (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          Included with Admin
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground">Free Access</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1 text-foreground">
                          {feature.hasPackages && (
                            <span className="text-xs text-muted-foreground mr-1">From</span>
                          )}
                          <span className="text-lg font-extrabold">USD {feature.priceMonthly}</span>
                          <span className="text-xs text-muted-foreground">/mo</span>
                        </div>

                        {/* Strikethrough Yearly Discount */}
                        {feature.priceOriginalYearly > 0 && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                            <span className="text-muted-foreground line-through">
                              USD {feature.priceOriginalYearly}/yr
                            </span>
                            <span className="font-semibold text-foreground">
                              USD {feature.priceYearly}/yr
                            </span>
                            <span className="rounded-sm bg-emerald-100 px-1 py-0.2 font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                              -{feature.discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button: When Subscribed / Admin -> Launch / Open Workspace */}
                    {isSubscribed ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLaunchFeature(feature)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:opacity-95 active:scale-98"
                        >
                          <Play className="size-3.5 fill-white" />
                          <span>Launch {feature.title}</span>
                          <ExternalLink className="size-3.5" />
                        </button>
                      </div>
                    ) : feature.hasPackages ? (
                      <button
                        type="button"
                        onClick={() => setIsPackageModalOpen(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-98"
                      >
                        <span>{feature.packageButton || "See Packages >"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(feature)}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-98",
                          inCart
                            ? "bg-purple-600 text-white shadow-xs"
                            : "border border-border/80 bg-background text-foreground hover:border-purple-400 hover:bg-purple-50/50 hover:text-purple-600 dark:hover:bg-purple-950/20"
                        )}
                      >
                        {inCart ? (
                          <>
                            <Check className="size-3.5 stroke-[2.5]" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="size-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
              <Package className="size-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-foreground">No features found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try clearing your search query or category filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-medium text-white"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SUBSCRIPTIONS */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Active Subscriptions</h2>
                <p className="text-xs text-muted-foreground">
                  Features currently running in your account. You can pause, resume, launch, or cancel anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("store")}
                className="flex items-center gap-1.5 self-start rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
              >
                <span>Browse More Features</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <div className="mt-5 divide-y divide-border/60">
              {subscriptions.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto size-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm font-semibold text-foreground">No active subscriptions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subscribe to individual modules from the Feature Store.
                  </p>
                </div>
              ) : (
                subscriptions.map((sub) => {
                  const feature = ALL_FEATURES.find((f) => f.id === sub.featureId);

                  return (
                    <div
                      key={sub.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/40">
                          <Sparkles className="size-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.plan} • Renews on {sub.nextRenewal}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-foreground">{sub.amount}</p>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              sub.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600"
                            )}
                          >
                            {sub.status}
                          </span>
                        </div>

                        {/* Open Tool Action */}
                        {feature && (
                          <button
                            type="button"
                            onClick={() => handleLaunchFeature(feature)}
                            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                          >
                            Open
                          </button>
                        )}

                        {/* Pause / Resume Button */}
                        <button
                          type="button"
                          onClick={() => togglePauseSubscription(sub.id)}
                          title={sub.status === "Active" ? "Pause Subscription" : "Resume Subscription"}
                          className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {sub.status === "Active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                        </button>

                        {/* Cancel Button */}
                        <button
                          type="button"
                          onClick={() => cancelSubscription(sub.id)}
                          title="Cancel Subscription"
                          className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT HISTORY */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground">Billing & Invoices</h2>
          <p className="text-xs text-muted-foreground">
            Download past invoice receipts and review transaction records.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Invoice ID</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40">
                    <td className="py-3.5 font-medium text-foreground">{inv.id}</td>
                    <td className="py-3.5 text-muted-foreground">{inv.date}</td>
                    <td className="py-3.5 text-foreground">{inv.item}</td>
                    <td className="py-3.5 font-semibold text-foreground">{inv.amount}</td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingInvoice(inv)}
                        className="font-medium text-purple-600 hover:underline dark:text-purple-400"
                      >
                        View & Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CART SLIDEOVER DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-card p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-purple-600" />
                <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-600 dark:bg-purple-950/40">
                  {cart.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <ShoppingCart className="size-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm font-semibold text-foreground">Your cart is empty</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add features from the store to subscribe.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3.5"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category} • {item.billingPeriod === "yearly" ? "Yearly plan" : "Monthly plan"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">USD ${item.price.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-rose-500"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">USD ${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total Due Today</span>
                  <span className="text-purple-600">USD ${cartTotal.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setShowCheckoutModal(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-700 active:scale-98"
                >
                  <CreditCard className="size-4" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="size-4" />
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Cancel anytime. Instant feature activation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-purple-600" />
                <h3 className="text-lg font-bold text-foreground">Secure Checkout</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Name on Card</label>
                <input
                  type="text"
                  defaultValue="Account Owner"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 •••• •••• 4242"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">CVC</label>
                  <input
                    type="text"
                    placeholder="•••"
                    defaultValue="982"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Features count:</span>
                  <span className="font-semibold text-foreground">{cart.length} item(s)</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-border">
                  <span>Total:</span>
                  <span className="text-purple-600">USD ${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompletePayment}
                className="w-full rounded-xl bg-purple-600 py-3 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:bg-purple-700"
              >
                Confirm & Pay USD ${cartTotal.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAD EXTRACTOR PACKAGES MODAL */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Lead Extractor Packages</h3>
                <p className="text-xs text-muted-foreground">
                  Choose the monthly or annual lead extraction tier for your outreach needs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {LEAD_PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className={cn(
                    "relative flex flex-col justify-between rounded-xl border p-4 transition-all",
                    pkg.popular
                      ? "border-purple-500 bg-purple-50/20 shadow-md dark:border-purple-500 dark:bg-purple-950/20"
                      : "border-border/70 bg-background"
                  )}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      MOST POPULAR
                    </span>
                  )}
                  <div>
                    <h4 className="font-bold text-foreground">{pkg.name}</h4>
                    <p className="text-xs text-purple-600 font-semibold mt-0.5">{pkg.quota}</p>
                    <div className="mt-3">
                      <span className="text-xl font-extrabold text-foreground">USD ${pkg.price}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">{pkg.desc}</p>
                    <ul className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <Check className="size-3 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const leadFeature = ALL_FEATURES.find((f) => f.id === "lead-extractor")!;
                      addToCart(leadFeature, pkg.price, pkg.name);
                      setIsPackageModalOpen(false);
                    }}
                    className={cn(
                      "mt-5 w-full rounded-lg py-2 text-xs font-bold transition-all",
                      pkg.popular
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    )}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE WORKSPACE TOOL MODALS */}
      <LeadExtractorModal
        isOpen={activeToolModal === "lead-extractor"}
        onClose={() => setActiveToolModal(null)}
      />

      <ClinicManagementModal
        isOpen={activeToolModal === "clinic"}
        onClose={() => setActiveToolModal(null)}
      />

      <SalonManagementModal
        isOpen={activeToolModal === "salon"}
        onClose={() => setActiveToolModal(null)}
      />

      <EcommerceModal
        isOpen={activeToolModal === "ecommerce"}
        onClose={() => setActiveToolModal(null)}
      />

      <OOOMessagesModal
        isOpen={activeToolModal === "ooo"}
        onClose={() => setActiveToolModal(null)}
      />

      <WpAutoPublisherModal
        isOpen={activeToolModal === "wp"}
        onClose={() => setActiveToolModal(null)}
      />

      <WebhooksModal
        isOpen={
          activeToolModal === "inbound-webhooks" ||
          activeToolModal === "outbound-webhooks" ||
          activeToolModal === "payment-webhooks"
        }
        type={
          activeToolModal === "outbound-webhooks"
            ? "Outbound"
            : activeToolModal === "payment-webhooks"
            ? "Payment"
            : "Inbound"
        }
        onClose={() => setActiveToolModal(null)}
      />

      <InvoiceModal
        isOpen={!!viewingInvoice}
        invoice={viewingInvoice}
        onClose={() => setViewingInvoice(null)}
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-card p-4 text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="size-5 text-purple-600" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
