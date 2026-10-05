"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  CheckCircle,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Stethoscope,
  Scissors,
  ShoppingBag,
  TrendingUp,
  Globe2,
  UsersRound,
  Star,
} from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <RegisterPageInner />
    </Suspense>
  );
}

const COUNTRY_CODES = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
];

const INDUSTRIES = [
  { id: "whatsapp_crm", label: "WhatsApp CRM & Support", icon: MessageSquare },
  { id: "clinic", label: "Clinic & Healthcare", icon: Stethoscope },
  { id: "salon", label: "Salon & Beauty Spa", icon: Scissors },
  { id: "ecommerce", label: "E-Commerce & Retail", icon: ShoppingBag },
  { id: "real_estate", label: "Real Estate & Sales", icon: TrendingUp },
  { id: "other", label: "Other Business", icon: Globe2 },
];

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [countryCode, setCountryCode] = useState("+92");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [industry, setIndustry] = useState("whatsapp_crm");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    if (pass.length < 6) return { score: 1, label: "Too short (min 6 chars)", color: "bg-red-500" };
    let score = 1;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    const fullPhone = phoneNumber.trim() ? `${countryCode}${phoneNumber.replace(/\D/g, '')}` : "";
    const emailRedirectTo = inviteToken
      ? `${window.location.origin}/join/${encodeURIComponent(inviteToken)}`
      : `${window.location.origin}/login`;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim() || fullName.trim() + "'s Workspace",
            phone: fullPhone,
            industry: industry,
          },
          emailRedirectTo,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Check if user session was immediately established (auto-confirm enabled in Supabase)
      if (data.session) {
        router.push("/dashboard");
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-lg animate-in fade-in-50 zoom-in-95 duration-200">
          <Card className="border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl">
            <CardHeader className="items-center text-center pb-4">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Registration Successful!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm max-w-sm mt-1">
                We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Click the link in the email to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  What happens next?
                </div>
                <p>1. Open your inbox and confirm your email address.</p>
                <p>2. Sign in to your new CRMPro dashboard.</p>
                <p>3. Connect your WhatsApp number in 60 seconds.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11">
                    Continue to Sign In
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                    Back to Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/30">
      {/* Top Navbar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-violet-600 via-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10 group-hover:scale-105 transition-transform">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-foreground">CRMPro</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-primary -mt-1">
                Smart Business Suite
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Already have an account?</span>
            <Link href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}>
              <Button variant="outline" size="sm" className="border-border hover:bg-muted font-medium text-foreground">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_520px] gap-10 items-center">
          
          {/* Left Hero Benefits Column (Hidden on small screens) */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 pr-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold w-fit backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              <span>Free to Register · 20+ Modules Included</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Run Your Entire Business From{" "}
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  One Dashboard
                </span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Connect multiple WhatsApp numbers, automate replies with 24/7 AI, manage deals in sales pipelines, and book appointments without juggling 10 separate tools.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="size-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">WhatsApp Multi-Number Unified Inbox</h4>
                  <p className="text-xs text-muted-foreground">Group chats across all your connected numbers under one clean view.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="size-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">24/7 AI Sales Agent & Automations</h4>
                  <p className="text-xs text-muted-foreground">Qualify leads, answer FAQs, and trigger workflows automatically.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="size-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Official Cloud API & Anti-Ban Protection</h4>
                  <p className="text-xs text-muted-foreground">Certified Meta API connection with 99.9% uptime SLA guarantee.</p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-foreground/90 italic leading-relaxed">
                &ldquo;CRMPro completely replaced 4 different tools for our clinic. WhatsApp appointments, customer reminders, and Google Maps lead generation are now on autopilot.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
                <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  MK
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Maya Khan</p>
                  <p className="text-[11px] text-muted-foreground">Operations Director, Elite Care Clinic</p>
                </div>
              </div>
            </div>

            {/* Bottom trust stats */}
            <div className="flex items-center gap-6 pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <div>
                <span className="font-bold text-foreground text-sm">500+</span> Businesses
              </div>
              <div className="size-1 rounded-full bg-border" />
              <div>
                <span className="font-bold text-foreground text-sm">50K+</span> Msg / Day
              </div>
              <div className="size-1 rounded-full bg-border" />
              <div>
                <span className="font-bold text-foreground text-sm">50+</span> Countries
              </div>
            </div>

          </div>

          {/* Right Column: Complete Registration Card */}
          <div className="w-full">
            <Card className="border-border/80 bg-card shadow-2xl backdrop-blur-xl">
              <CardHeader className="space-y-1.5 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Create Your Account
                  </CardTitle>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                    Free Tier
                  </span>
                </div>
                <CardDescription className="text-muted-foreground text-xs">
                  Fill in your details below to activate your CRMPro workspace.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium">
                      {error}
                    </div>
                  )}

                  {/* Full Name & Company Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
                        Full Name <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="e.g. Malik Abbas"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="pl-9 h-10 text-xs bg-muted/40 border-border focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-xs font-medium text-foreground">
                        Company Name <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="e.g. Glamour Salon"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="pl-9 h-10 text-xs bg-muted/40 border-border focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number with Country Code */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-xs font-medium text-foreground">
                      WhatsApp / Phone Number
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-32 h-10 rounded-md border border-border bg-muted/50 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="300 1234567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-9 h-10 text-xs bg-muted/40 border-border focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-foreground">
                      Work Email Address <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 h-10 text-xs bg-muted/40 border-border focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-medium text-foreground">
                        Password <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-9 pr-9 h-10 text-xs bg-muted/40 border-border focus-visible:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                        Confirm Password <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pl-9 pr-9 h-10 text-xs bg-muted/40 border-border focus-visible:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Strength:</span>
                        <span className="font-semibold text-foreground">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                        <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                        <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
                        <div className={`h-full flex-1 transition-all ${strength.score >= 4 ? strength.color : "bg-transparent"}`} />
                      </div>
                    </div>
                  )}

                  {/* Primary Industry / Module Interest */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs font-medium text-foreground">
                      Primary Industry / Module
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {INDUSTRIES.map((ind) => {
                        const Icon = ind.icon;
                        const isSelected = industry === ind.id;
                        return (
                          <button
                            type="button"
                            key={ind.id}
                            onClick={() => setIndustry(ind.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-foreground font-semibold ring-1 ring-primary/30"
                                : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground"
                            }`}
                          >
                            <Icon className={`size-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="truncate">{ind.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 size-3.5 rounded border-border bg-muted accent-primary cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      . No credit card required.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all text-sm mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Setting up your workspace...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Create Free Account
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Login link */}
                <div className="mt-5 text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign In here
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Mini Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025 CRMPro by Jeose — Dubai, UAE. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              99.9% Uptime SLA
            </span>
            <span>·</span>
            <span>🔒 SSL 256-Bit Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
