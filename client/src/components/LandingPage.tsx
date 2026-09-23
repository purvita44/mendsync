import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MendSyncLogo } from "./MendSyncLogo";
import {
  Calendar, ShieldCheck, Zap, ArrowRight, CheckCircle2, Clock, Activity,
  Users, Lock, Layers, Sparkles, ChevronRight, BarChart3, Star
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterDashboard: () => void;
}

export function LandingPage({ onOpenAuth, onEnterDashboard }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <MendSyncLogo size="md" className="[&_span]:text-white [&_span:nth-child(2)]:text-teal-400" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">Platform Features</a>
            <a href="#sync" className="hover:text-teal-400 transition-colors">Google Calendar Sync</a>
            <a href="#security" className="hover:text-teal-400 transition-colors">HIPAA Compliance</a>
            <a href="#pricing" className="hover:text-teal-400 transition-colors">Practice Plans</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onOpenAuth}
              className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 h-9 px-4 rounded-xl"
            >
              Sign In
            </Button>
            <Button
              onClick={onEnterDashboard}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold h-10 px-5 rounded-xl shadow-lg shadow-teal-900/40 gap-1.5"
            >
              Launch Live App <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-teal-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 size-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <Badge className="bg-teal-500/10 text-teal-300 border-teal-500/30 text-xs px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
            <Sparkles className="size-3.5 text-teal-400" />
            <span>MendSync Enterprise v2.4 Release</span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Intelligent Patient Care & <br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
              Google Calendar Synchronization
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Eliminate missed medical appointments, automate bounded patient SMS reminders, and synchronize clinical provider schedules with enterprise reliability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              onClick={onEnterDashboard}
              className="w-full sm:w-auto h-12 px-8 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-teal-950/60 gap-2"
            >
              Explore MendSync Dashboard <ArrowRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              onClick={onOpenAuth}
              className="w-full sm:w-auto h-12 px-7 border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold text-sm rounded-xl gap-2"
            >
              <Lock className="size-4 text-teal-400" /> Demo Practice Login
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-teal-400" /> 100% HIPAA Audit Ready
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-emerald-400" /> Real-time Google Calendar OAuth
            </div>
            <div className="flex items-center gap-2">
              <Star className="size-4 text-amber-400" /> 99.4% Appointment Retention Rate
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Cards */}
      <section id="features" className="py-20 bg-slate-900/60 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Modern Healthcare Practices
            </h2>
            <p className="text-slate-400 text-sm">
              Replace fragmented reminder tools with an integrated clinical control system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-teal-500/50 transition-all group">
              <div className="size-12 rounded-xl bg-teal-500/10 text-teal-400 grid place-items-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                <Calendar className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Google Calendar Sync</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Bi-directional sync pushes updated patient follow-up slots directly into doctor schedules with zero manual data entry.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-indigo-500/50 transition-all group">
              <div className="size-12 rounded-xl bg-indigo-500/10 text-indigo-400 grid place-items-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Zap className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Automated SMS & Reminders</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Dispatch compliant patient portal update links and reminder notices with automated cooling periods and consent enforcement.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition-all group">
              <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-400 grid place-items-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Append-Only Audit Trail</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Every clinical diagnosis, reminder dispatch, and calendar sync attempt is logged immutably for compliance reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <MendSyncLogo size="sm" showText={true} className="[&_span]:text-slate-300 [&_span:nth-child(2)]:text-teal-400" />
          <p>© {new Date().getFullYear()} MendSync Inc. All rights reserved. Professional Deployment Ready.</p>
        </div>
      </footer>
    </div>
  );
}
