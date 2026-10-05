"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Check,
  Star,
  MessageSquare,
  Stethoscope,
  Scissors,
  TrendingUp,
  MapPin,
  Bot,
  Mail,
  Zap,
  Globe,
  Share2,
  Link2,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Clock,
  Users,
  ShieldCheck,
  Headphones,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Phone,
  QrCode,
  Layers,
  BarChart3,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedModuleCategory, setSelectedModuleCategory] = useState("all");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const modules = [
    {
      id: "whatsapp-crm",
      title: "WhatsApp CRM",
      category: "crm",
      badge: "Core",
      icon: MessageSquare,
      desc: "Multi-inbox, real-time chat, team collaboration & contact grouping.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "wa-campaigns",
      title: "WA Campaigns",
      category: "marketing",
      badge: "Popular",
      icon: Share2,
      desc: "Bulk broadcasts with smart scheduling, audience tags and analytics.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "wa-automations",
      title: "WA Automations",
      category: "ai",
      badge: "No-Code",
      icon: Zap,
      desc: "No-code bot flows, auto-replies, keyword triggers & condition branching.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "wa-account-slots",
      title: "WA Account Slots",
      category: "crm",
      badge: "Infrastructure",
      icon: Smartphone,
      desc: "Connect multiple WhatsApp numbers. Each slot adds 1 live connected number.",
      monthly: 4.99,
      yearly: 4.0,
    },
    {
      id: "unified-contact",
      title: "Unified Contact View",
      category: "crm",
      badge: "NEW",
      icon: Layers,
      desc: "Same customer's chats across all your numbers, grouped in one place.",
      monthly: 4.99,
      yearly: 4.0,
    },
    {
      id: "clinic-mgmt",
      title: "Clinic Management",
      category: "industry",
      badge: "Healthcare",
      icon: Stethoscope,
      desc: "Doctors, appointments, patient records, WhatsApp reminders & booking portal.",
      monthly: 49.99,
      yearly: 39.99,
    },
    {
      id: "salon-mgmt",
      title: "Salon Management",
      category: "industry",
      badge: "Beauty",
      icon: Scissors,
      desc: "Services menu, stylist schedules, online booking & client history.",
      monthly: 39.99,
      yearly: 32.0,
    },
    {
      id: "contacts-db",
      title: "Contacts Database",
      category: "crm",
      badge: "Core",
      icon: Users,
      desc: "Full CRM contact database with custom tags, lifecycle stages and CSV import.",
      monthly: 4.99,
      yearly: 4.0,
    },
    {
      id: "sales-pipeline",
      title: "Sales Pipeline",
      category: "sales",
      badge: "Deals",
      icon: TrendingUp,
      desc: "Kanban deal board, pipeline stages, revenue forecasting & task assignment.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "lead-extractor",
      title: "Lead Extractor",
      category: "sales",
      badge: "Scraper",
      icon: MapPin,
      desc: "Extract targeted B2B leads from Google Maps, web directories & phone registries.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "lead-mgmt",
      title: "Lead Management",
      category: "sales",
      badge: "Nurture",
      icon: BarChart3,
      desc: "Manage, score and nurture inbound leads through custom sales funnels.",
      monthly: 19.99,
      yearly: 16.0,
    },
    {
      id: "email-mgmt",
      title: "Email Management",
      category: "communication",
      badge: "Unified",
      icon: Mail,
      desc: "Unified IMAP/SMTP inbox, follow-up sequences & synchronized customer history.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "ai-integration",
      title: "AI Integration",
      category: "ai",
      badge: "GPT-4o",
      icon: Bot,
      desc: "GPT-powered smart auto-replies, sentiment analysis & quick summary generation.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "ai-sales-agent",
      title: "AI Sales Agent",
      category: "ai",
      badge: "24/7 AI",
      icon: Sparkles,
      desc: "Groq-powered lead qualification & product guidance running round-the-clock.",
      monthly: 19.99,
      yearly: 16.0,
    },
    {
      id: "ai-customer-care",
      title: "AI Customer Care",
      category: "ai",
      badge: "Support",
      icon: Headphones,
      desc: "Instant auto-replies for clinics, salons and eCommerce queries.",
      monthly: 14.99,
      yearly: 12.0,
    },
    {
      id: "ecommerce-sync",
      title: "E-Commerce",
      category: "commerce",
      badge: "Catalog",
      icon: ShoppingBag,
      desc: "Product catalogs, order sync, checkout links and WhatsApp order notifications.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "payment-webhooks",
      title: "Payment Webhooks",
      category: "integrations",
      badge: "Gateways",
      icon: CreditCard,
      desc: "Stripe, PayPal and local payment gateways webhook sync with auto order confirmation.",
      monthly: 9.99,
      yearly: 8.0,
    },
    {
      id: "inbound-webhooks",
      title: "Inbound Webhooks",
      category: "integrations",
      badge: "API",
      icon: Link2,
      desc: "Receive data from external apps via HTTP webhooks and trigger CRM workflows.",
      monthly: 9.0,
      yearly: 7.2,
    },
    {
      id: "outbound-webhooks",
      title: "Outbound Webhooks",
      category: "integrations",
      badge: "API",
      icon: Globe,
      desc: "Push real-time CRM events to Zapier, Make or your internal endpoints.",
      monthly: 14.99,
      yearly: 12.0,
    },
    {
      id: "team-roles",
      title: "Team Management",
      category: "crm",
      badge: "Security",
      icon: ShieldCheck,
      desc: "Add team members, assign granular department roles & chat access permissions.",
      monthly: 4.99,
      yearly: 4.0,
    },
  ];

  const filteredModules = modules.filter((m) => {
    const matchesCategory =
      selectedModuleCategory === "all" || m.category === selectedModuleCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqs = [
    {
      q: "Can I use CRMPro for multiple businesses?",
      a: "Yes! CRMPro supports multi-tenancy and multiple WhatsApp numbers. You can connect independent business numbers, configure separate bot flows, and assign distinct team members to each brand while managing everything from one master account.",
    },
    {
      q: "Do I need technical knowledge to set up?",
      a: "Not at all. You can connect your WhatsApp number in less than 60 seconds either via official Meta Cloud API or QR Code scan. Our no-code automation builder lets you drag and drop replies, and our pre-built templates for clinics, salons, and sales are ready to go.",
    },
    {
      q: "Is registration free?",
      a: "Yes, creating your account is 100% free! You get instant access to the dashboard and basic WhatsApp features with zero setup fees and no credit card required.",
    },
    {
      q: "How does WhatsApp anti-ban protection work?",
      a: "CRMPro uses official Meta Graph API v18 endpoints with intelligent message pacing, jitter delays, randomized delivery intervals, and warm-up protocols that ensure your account maintains a healthy Green quality rating with zero spam risk.",
    },
    {
      q: "Does CRMPro support multiple languages?",
      a: "Yes! The CRM interface and our AI chatbot agents support English, Arabic, Urdu, Turkish, Spanish, Portuguese, and Korean. Your customers can chat in their native language and receive fluent automated replies.",
    },
  ];

  const blogs = [
    {
      title: "Effective Clinic Management: Strategies for Success",
      tag: "Clinic Management",
      desc: "How modern outpatient clinics cut missed appointments by 78% using automated WhatsApp booking reminders and doctor schedule sync.",
      readTime: "6 min read",
      date: "Sep 2026",
    },
    {
      title: "The Future of Customer Interaction: AI Chatbots in CRMPro",
      tag: "AI Automation",
      desc: "Deploying 24/7 AI sales agents that qualify leads, answer pricing questions, and convert cold prospects into paid customers.",
      readTime: "8 min read",
      date: "Sep 2026",
    },
    {
      title: "Using CRMPro to Automate Sales Pipeline and Boost Conversions",
      tag: "Sales Pipeline",
      desc: "A step-by-step blueprint on capturing Google Maps leads, auto-assigning them to agents, and tracking deals on Kanban boards.",
      readTime: "5 min read",
      date: "Sep 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0d14] text-foreground selection:bg-violet-600/30 font-sans relative overflow-x-hidden">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-violet-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[1800px] left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[700px] h-[700px] bg-purple-600/10 blur-[160px] pointer-events-none -z-10" />

      {/* ============================================================ */}
      {/* NAVBAR */}
      {/* ============================================================ */}
      <nav className="border-b border-white/[0.08] bg-[#0c0d14]/85 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-violet-600 via-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25 border border-white/20 group-hover:scale-105 transition-transform">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">CRMPro</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-violet-400 -mt-1">
                Smart Business Suite
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#modules" className="hover:text-white transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#blog" className="hover:text-white transition-colors">Blog</a>
            <a href="#founder" className="hover:text-white transition-colors">Founder</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5 font-medium">
                Sign In
              </Button>
            </Link>

            <Link href="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 border border-white/10 px-5 h-10 rounded-xl transition-all hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
          </div>

        </div>
      </nav>

      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center relative max-w-5xl mx-auto">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-inner animate-pulse">
          <Sparkles className="size-4 text-violet-400" />
          <span>Stop juggling 10 apps — this is all of them</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Run Your Entire Business From{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent block sm:inline">
            One Dashboard
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          Your clinic takes appointments on WhatsApp. Your salon fills empty slots with AI. Your sales team closes deals from a pipeline. Your leads come from Google Maps in one click. All of it — one platform, one login.
        </p>

        {/* Floating Marquee / Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto mb-10">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            WhatsApp CRM
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-950/40 border border-violet-500/30 text-violet-300 flex items-center gap-1.5">
            🏥 Clinic Mgmt
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-950/40 border border-pink-500/30 text-pink-300 flex items-center gap-1.5">
            ✂️ Salon Mgmt
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-950/40 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
            🎯 Lead Extractor
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-950/40 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
            🤖 AI Automation
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
            📊 Sales Pipeline
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-950/40 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
            📧 Email & Webhooks
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5">
            💬 Chatbot Builder
          </span>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-violet-600/30 border border-white/20 transition-all hover:scale-105"
            >
              <span>Register for Free</span>
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setDemoModalOpen(true)}
            className="w-full sm:w-auto h-13 px-7 text-base font-semibold border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-2xl transition-all"
          >
            <Play className="mr-2 size-4 fill-white" />
            Watch Demo
          </Button>
        </div>

        {/* Social Proof Line */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400 mb-16">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-4 fill-amber-400" />
            ))}
            <span className="ml-1 font-semibold text-slate-200">500+ businesses</span>
          </div>
          <span>•</span>
          <span className="text-slate-300">Free to register</span>
          <span>•</span>
          <span className="text-slate-300">Cancel anytime</span>
        </div>

        {/* Real-Time Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-6 rounded-2xl border border-white/[0.08] bg-[#121320]/80 backdrop-blur-xl shadow-2xl">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">500+</p>
            <p className="text-xs text-slate-400 mt-1">Active Businesses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-violet-400">50K+</p>
            <p className="text-xs text-slate-400 mt-1">Messages / Day</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">99.9%</p>
            <p className="text-xs text-slate-400 mt-1">Uptime SLA</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-pink-400">50+</p>
            <p className="text-xs text-slate-400 mt-1">Countries</p>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">24/7</p>
            <p className="text-xs text-slate-400 mt-1">Support</p>
          </div>
        </div>

        {/* Businesses from countries ticker */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="uppercase tracking-wider font-semibold text-slate-500">Businesses from:</span>
          <span>🇸🇦 Saudi Arabia</span>
          <span>🇦🇪 UAE</span>
          <span>🇵🇰 Pakistan</span>
          <span>🇹🇷 Turkey</span>
          <span>🇬🇧 UK</span>
          <span>🇺🇸 USA</span>
          <span>🇲🇾 Malaysia</span>
          <span className="text-violet-400 font-medium">& 35+ more countries</span>
        </div>

      </section>

      {/* ============================================================ */}
      {/* SECTION 1: ONE PLATFORM, EVERY TOOL YOU NEED (MOCKUP & TILES) */}
      {/* ============================================================ */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            One Platform. Every Tool You Need.
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Replace dozens of expensive SaaS subscriptions with a modular WhatsApp-first suite.
          </p>
        </div>

        {/* Mini Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { title: "Team Management", price: "$4.99/mo", desc: "Add team members, assign roles, set granular feature permissions." },
            { title: "AI Integration", price: "$9.99/mo", desc: "GPT-powered smart replies, AI bots, sentiment analysis and summaries." },
            { title: "Lead Management", price: "$19.99/mo", desc: "Manage, score and nurture leads through full lifecycle pipelines." },
            { title: "Inbound Webhooks", price: "$9.00/mo", desc: "Receive data from external apps via webhooks and trigger automations." },
            { title: "Outbound Webhooks", price: "$14.99/mo", desc: "Push real-time events from the platform to any external URL." },
            { title: "E-Commerce", price: "$9.99/mo", desc: "Product catalog, order management, checkout links and payment collection." },
            { title: "Payment Webhooks", price: "$9.99/mo", desc: "Receive payment notifications from gateways and auto-update order status." },
            { title: "WA Account Slot", price: "$4.99/mo", desc: "Connect an additional WhatsApp number (each slot = +1 number)." },
            { title: "OOO Messages", price: "$4.90/mo", desc: "Track and manage messages received during out-of-office hours." },
            { title: "WP Auto Publisher", price: "$25.00/mo", desc: "Connect WordPress sites and auto-publish AI-generated SEO blog articles daily." },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-white/[0.07] bg-[#121320]/70 hover:border-violet-500/40 hover:bg-[#16182c] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                    {item.price}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <Link href="/register" className="mt-3 text-[11px] font-semibold text-violet-400 group-hover:text-violet-300 flex items-center gap-1">
                Subscribe <ArrowRight className="size-3" />
              </Link>
            </div>
          ))}
        </div>

        {/* WhatsApp Multi-Number & Anti-Ban Live Preview Mockup */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141629] to-[#0f101e] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium">
                <CheckCircle2 className="size-3.5" />
                <span>Enterprise Multi-Device Infrastructure</span>
              </div>
              
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Connect Multiple Numbers. Zero Risk of Bans.
              </h3>
              
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect via official Meta Cloud API or multi-device QR code. Assign group inboxes to support and sales teams with session health monitoring.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400" />
                  <span>Connect multiple WhatsApp numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400" />
                  <span>Group assignment to team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400" />
                  <span>Anti-ban protection & session monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400" />
                  <span>Contact tags, labels & team inbox</span>
                </div>
              </div>

              <Link href="/register">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-6 h-11 font-semibold shadow-lg shadow-violet-600/30">
                  Get Started
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </Link>
            </div>

            {/* Mockup Box */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0b14] p-5 shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <QrCode className="size-4 text-violet-400" /> QR Code & Cloud API Login
                </span>
                <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] font-mono">
                  All Systems Normal
                </span>
              </div>

              {/* Number Slots */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-white">+971 50 756 3692</span>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">Dubai Sales</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Online</span>
                </div>
              </div>

              {/* Team Assignment Mock */}
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs space-y-2">
                <p className="font-semibold text-violet-300 text-[11px] uppercase tracking-wider">Group Assignment to Teams</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                    Support Inbox ➔ Ahmed, Maya
                  </span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                    Sales Team ➔ Mike, Lisa
                  </span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                    VIP Clients ➔ Alina, Alex
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ============================================================ */}
      {/* SECTION 2: 20+ MODULES (SPOTLIGHT & FULL GRID) */}
      {/* ============================================================ */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            20+ Modules. Pick Only What You Need.
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Subscribe to any feature individually — start free, add modules as your business grows.
          </p>
        </div>

        {/* Featured Spotlight Card: One Contact. Every Number. One View. */}
        <div className="mb-14 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-[#181a33] via-[#121324] to-[#0c0d18] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-center">
            
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                <Sparkles className="size-3.5" /> NEW · WHATSAPP CRM
              </span>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                One Contact. Every Number. One View.
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                When the same customer messages you on more than one of your connected WhatsApp numbers, CRMPro automatically groups all their chats together — the selected number on top, the rest neatly below a divider line, each labeled with which number it&apos;s on. Never lose the conversation across numbers again.
              </p>

              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Same customer, every number — in one place</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Selected number pinned on top, others below a divider</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Each chat clearly tagged with its connected number</span>
                </div>
              </div>
            </div>

            {/* Visual preview pill stack */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0b14]/90 p-5 space-y-3 shadow-xl">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Grouped Customer Thread
              </p>

              {/* Number 1 (Selected) */}
              <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-xs text-white">
                    M
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Maya</p>
                    <p className="text-[10px] text-slate-400">Can I confirm tomorrow&apos;s slot?</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                  WA | 5119
                </span>
              </div>

              <div className="border-t border-dashed border-white/10 my-2" />

              {/* Number 2 */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">Alina</p>
                    <p className="text-[10px] text-slate-500">Instagram ad inquiry</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                  SMM
                </span>
              </div>

              {/* Number 3 */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                    M
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">Maya</p>
                    <p className="text-[10px] text-slate-500">Pricing sent</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded">
                  Direct | Sales
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#121320] border border-white/[0.08] text-xs">
            {[
              { id: "all", label: "All Modules" },
              { id: "crm", label: "WhatsApp CRM" },
              { id: "ai", label: "AI & Bots" },
              { id: "sales", label: "Sales & Leads" },
              { id: "industry", label: "Clinic / Salon" },
              { id: "integrations", label: "Webhooks & API" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedModuleCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedModuleCategory === tab.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search 20+ modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#121320] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* 20+ Modules Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredModules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl border border-white/[0.07] bg-[#121322]/80 hover:border-violet-500/40 hover:bg-[#16182e] transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-violet-300 bg-violet-950/50 border border-violet-800/30 px-2 py-0.5 rounded-full">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-violet-300 transition-colors">
                    {m.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">
                      ${billingPeriod === "yearly" ? m.yearly : m.monthly}
                    </span>
                    <span className="text-[10px] text-slate-400">/mo</span>
                  </div>
                  <Link href="/register">
                    <span className="text-xs font-semibold text-violet-400 group-hover:text-violet-300 flex items-center gap-1">
                      Add <ArrowRight className="size-3" />
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ============================================================ */}
      {/* SECTION 3: PRICING (PAY ONLY FOR WHAT YOU USE) */}
      {/* ============================================================ */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Pay Only for What You Use
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Subscribe to each feature separately. Only active subscriptions are billed. Cancel any module anytime.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-2xl bg-[#121320] border border-white/10">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === "yearly"
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] bg-emerald-400 text-emerald-950 font-extrabold px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              name: "WhatsApp CRM",
              price: billingPeriod === "yearly" ? "$8.00" : "$9.99",
              desc: "Full inbox, contacts, labels, conversations & multi-agent support.",
            },
            {
              name: "WA Campaigns",
              price: billingPeriod === "yearly" ? "$8.00" : "$9.99",
              desc: "Bulk broadcast messages to segments with scheduling and analytics.",
            },
            {
              name: "WA Automations",
              price: billingPeriod === "yearly" ? "$8.00" : "$9.99",
              desc: "Bot flows, auto-replies, keyword triggers and no-code automation builder.",
            },
            {
              name: "Clinic Management",
              price: billingPeriod === "yearly" ? "$39.99" : "$49.99",
              desc: "Appointments, patient records, staff scheduling and booking pages.",
            },
            {
              name: "Salon Management",
              price: billingPeriod === "yearly" ? "$32.00" : "$39.99",
              desc: "Service menu, stylist schedules, online booking and client history.",
            },
            {
              name: "Lead Extractor 500",
              price: billingPeriod === "yearly" ? "$8.00" : "$9.99",
              desc: "Extract up to 500 leads per month from maps, directories and web.",
            },
            {
              name: "Lead Extractor 1000",
              price: billingPeriod === "yearly" ? "$12.80" : "$15.99",
              desc: "Extract up to 1,000 verified business leads per month.",
            },
            {
              name: "Lead Extractor Pro",
              price: billingPeriod === "yearly" ? "$24.00" : "$29.99",
              desc: "Unlimited lead extraction from maps, directories and web sources.",
            },
            {
              name: "Sales Pipeline",
              price: billingPeriod === "yearly" ? "$8.00" : "$9.99",
              desc: "Kanban deal board, stages, tasks and revenue forecasting.",
            },
            {
              name: "Email Management",
              price: billingPeriod === "yearly" ? "$8.00" : "$9.99",
              desc: "Connect IMAP/SMTP accounts, unified inbox, campaigns and auto-sync.",
            },
          ].map((plan, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-white/[0.08] bg-[#121320]/80 hover:border-violet-500/50 hover:bg-[#16182c] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white">{plan.name}</h3>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/mo</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  {plan.desc}
                </p>
              </div>

              <Link href="/register">
                <Button
                  size="sm"
                  className="w-full text-xs font-semibold bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 transition-all"
                >
                  Subscribe ➔
                </Button>
              </Link>
            </div>
          ))}
        </div>

      </section>

      {/* ============================================================ */}
      {/* SECTION 4: TESTIMONIALS */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Businesses Worldwide
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Read what entrepreneurs and clinic managers say about scaling with CRMPro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "We manage 5 WhatsApp numbers from one screen. Our customer response time dropped from 4 hours to under 3 minutes.",
              author: "Kenji Takahashi",
              role: "E-Commerce Founder, Tokyo",
              rating: 5,
            },
            {
              quote: "The Salon module and automated WhatsApp booking reminders reduced our customer no-shows by 78% in the first month.",
              author: "Layla Al-Harbi",
              role: "Beauty Entrepreneur, Riyadh",
              rating: 5,
            },
            {
              quote: "Lead extractor from Google Maps gives our real estate team 150+ verified phone leads every morning automatically.",
              author: "Carlos Mendoza",
              role: "Real Estate Director, Mexico City",
              rating: 5,
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-white/[0.08] bg-[#121320]/70 backdrop-blur-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <div className="size-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.author}</h4>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: FAQS */}
      {/* ============================================================ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.07]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Everything you need to know about setting up and scaling with CRMPro.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/[0.08] bg-[#121320]/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-violet-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-violet-400" : "text-slate-500"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6: BLOG CARDS */}
      {/* ============================================================ */}
      <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07]">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Our Blog
            </h2>
            <p className="text-slate-400 mt-1 text-sm">Latest guides, tutorials & growth strategies.</p>
          </div>
          <Link href="/register" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View all ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((b, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/[0.08] bg-[#121320]/70 hover:border-violet-500/40 hover:bg-[#16182c] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider bg-violet-950/50 border border-violet-800/30 px-2 py-0.5 rounded">
                  {b.tag}
                </span>
                <h3 className="text-base font-bold text-white mt-3 group-hover:text-violet-300 transition-colors leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {b.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-500">
                <span>{b.date}</span>
                <span>{b.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: MEET THE FOUNDER */}
      {/* ============================================================ */}
      <section id="founder" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.07] relative">
        {/* Glow backdrop behind founder card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/10 blur-[140px] pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="size-3.5 text-violet-400" />
            <span>Leadership &amp; Vision</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Meet the Founder Behind <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">CRMPro</span>
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
            Building smart digital architectures and customer communication systems that empower modern businesses to scale.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#14162b] via-[#101122] to-[#0a0b16] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle grid pattern / top accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-600/10 to-transparent blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Founder Profile Card (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0c0d18]/80 backdrop-blur-xl space-y-5 shadow-xl">
              {/* Founder Portrait Photo */}
              <div className="relative group">
                <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-violet-500/30 shadow-2xl shadow-violet-600/30 bg-gradient-to-b from-white/10 to-transparent">
                  <Image
                    src="/images/malik-abbas.jpg"
                    alt="Malik Abbas — Founder & Director, Jeose Creative Solutions"
                    width={320}
                    height={380}
                    priority
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d18]/50 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="absolute -bottom-2.5 -right-2.5 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-white text-[11px] font-bold shadow-lg shadow-emerald-500/30" title="Verified Founder">
                  <ShieldCheck className="size-3.5" />
                  <span>Founder</span>
                </div>
              </div>

              {/* Name & Title */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Malik Abbas</h3>
                <p className="text-xs font-semibold text-violet-400 tracking-wide">
                  Founder &amp; Director
                </p>
                <p className="text-xs text-slate-400">
                  Jeose Creative Solutions
                </p>
              </div>

              {/* Location Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300">
                <MapPin className="size-3.5 text-violet-400" />
                <span>UAE</span>
              </div>

              {/* Quick stats grid */}
              <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-base font-bold text-white">500+</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Clients Served</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-base font-bold text-emerald-400">GCC &amp; Global</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Footprint</p>
                </div>
              </div>
            </div>

            {/* Right: Bio, Vision & Contact Info (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  <span>About the Founder</span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                  Malik Abbas — Founder &amp; Director, Jeose Creative Solutions
                </h4>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Malik Abbas is the Founder of Jeose Creative Solutions, helping businesses build professional brands and stronger digital presence through creative design and smart digital solutions.
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Under his leadership, Jeose has developed CRMPro to solve the real-world operational challenges of modern enterprises — combining WhatsApp CRM, clinic &amp; salon management, omnichannel messaging, and AI workflow automations into a single unified business ecosystem.
                </p>
              </div>

              {/* Vision Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-indigo-950/40 border border-violet-500/30 space-y-1.5">
                <p className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                  Company Vision
                </p>
                <p className="text-base sm:text-lg font-bold text-white italic">
                  &ldquo;We Design. We Build. We Grow Brands.&rdquo;
                </p>
              </div>

              {/* Direct Contact Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="tel:+971507563692"
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-violet-500/40 transition-all flex items-center gap-3 group"
                >
                  <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Phone className="size-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Direct Call / WhatsApp</p>
                    <p className="text-xs font-mono font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      +971 50 756 3692
                    </p>
                  </div>
                </a>

                <a
                  href="mailto:info@jeose.com"
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-violet-500/40 transition-all flex items-center gap-3 group"
                >
                  <div className="size-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                    <Mail className="size-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Email Inquiry</p>
                    <p className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                      info@jeose.com
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.jeose.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-violet-500/40 transition-all flex items-center gap-3 group"
                >
                  <div className="size-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                    <Globe className="size-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Official Website</p>
                    <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors truncate flex items-center gap-1">
                      www.jeose.com
                      <ExternalLink className="size-3 opacity-60" />
                    </p>
                  </div>
                </a>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                    <MapPin className="size-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Regional Presence</p>
                    <p className="text-xs font-semibold text-white truncate">
                      UAE · Serving UAE, KSA &amp; Worldwide
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/971507563692?text=Hi%20Malik,%20I'm%20interested%20in%20CRMPro"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="h-11 px-5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 gap-2">
                    <Phone className="size-4" />
                    Chat on WhatsApp
                  </Button>
                </a>
                <a
                  href="https://www.jeose.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="h-11 px-5 rounded-xl font-semibold border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white gap-2">
                    <Globe className="size-4" />
                    Visit Jeose.com
                    <ExternalLink className="size-3.5 text-slate-400" />
                  </Button>
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7: BIG BOTTOM CTA */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-b from-[#1c1d38] via-[#14152a] to-[#0c0d16] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Transform Your Business?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join 500+ businesses already scaling with CRMPro. Start free, upgrade when you&apos;re ready.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-xl shadow-violet-600/30 transition-all hover:scale-105"
                >
                  Create Your Free Account
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              No credit card required · Instant setup in 60 seconds · Cancel anytime
            </p>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer id="contact" className="border-t border-white/[0.08] bg-[#090a10] pt-16 pb-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
            
            {/* Col 1: About & Dubai Registration */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-violet-600 flex items-center justify-center text-white">
                  <Sparkles className="size-4" />
                </div>
                <span className="font-extrabold text-lg text-white">CRMPro</span>
              </Link>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                The complete WhatsApp CRM platform for modern businesses. Run customer care, automated appointments, and sales pipelines all in one place.
              </p>
              <div className="space-y-1.5 pt-2 text-[11px] text-slate-400">
                <p className="text-slate-300 font-semibold">A Project by Jeose — UAE Registered | Serving Clients Across the UAE, KSA & Worldwide</p>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#modules" className="hover:text-white transition-colors">20+ Modules</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Free Registration</Link></li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company</h4>
              <ul className="space-y-2">
                <li><a href="#founder" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#founder" className="hover:text-white transition-colors">Founder</a></li>
                <li><a href="mailto:info@jeose.com" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Become an Agent</Link></li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">GDPR Compliance</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Security */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2025 CRMPro by Jeose — Dubai, UAE. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                99.9% Uptime SLA
              </span>
              <span>🔒 SSL Secured</span>
              <span>🛡️ GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* WATCH DEMO MODAL */}
      {/* ============================================================ */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#121320] border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold text-white">CRMPro Interactive Tour</h3>
            <p className="text-xs text-slate-300">
              See how multi-number WhatsApp inboxes, 24/7 AI agents, and pipeline automations work in real time.
            </p>
            <div className="aspect-video rounded-xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="size-14 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <Play className="size-6 fill-violet-400" />
              </div>
              <p className="text-xs font-semibold text-white">Live Product Demo Walkthrough</p>
              <p className="text-[11px] text-slate-400 max-w-md">
                Experience all 20+ modules in action. Ready to start using it for your business?
              </p>
              <Link href="/register">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs mt-2">
                  Create Your Free Account Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
