import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight, CircleDollarSign, Download,
  Clock3, FileClock, Filter, Gauge, Layers3, LockKeyhole, Menu, Play, RefreshCw,
  Search, ShieldCheck, SlidersHorizontal, Sparkles, StopCircle, UserRound, XCircle, Zap,
  Calendar as CalendarIcon, Bell, LogOut, User, Send, Check, ExternalLink, Globe, LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  buildStakeholderCsv, calculateBaselineLift, classifyCase, formatInr, generateBatch,
  simulateAction, simulateBaseline, type AuditEvent, type Decision, type PaymentCase, type NotificationItem
} from "@shared/recovery";
import { MendSyncLogo } from "@/components/MendSyncLogo";
import { GoogleCalendarWidget } from "@/components/GoogleCalendarWidget";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { AuthModal } from "@/components/AuthModal";
import { LandingPage } from "@/components/LandingPage";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const initialCases = generateBatch(42, 48);

type Result = PaymentCase & ReturnType<typeof classifyCase> & { outcome: ReturnType<typeof simulateAction>; recovered: boolean; events: AuditEvent[] };

function processCases(cases: PaymentCase[], decisionOverrides: Record<string, Decision> = {}): Result[] {
  return cases.map((payment, index) => {
    const decision = decisionOverrides[payment.id] || classifyCase(payment);
    const outcome = simulateAction(payment, decision);
    const recovered = outcome === "success";
    const baseTime = new Date(Date.now() - (cases.length - index) * 86_400_000);
    const events: AuditEvent[] = [
      { id: `${payment.id}-1`, caseId: payment.id, timestamp: baseTime.toISOString(), kind: "diagnosis", title: "Care requirement diagnosed", detail: `${decision.diagnosis} · ${decision.confidence * 100}% confidence`, status: "info" },
      { id: `${payment.id}-2`, caseId: payment.id, timestamp: new Date(baseTime.getTime() + 45_000).toISOString(), kind: decision.action === "escalate_operator" ? "escalation" : "action", title: decision.action === "retry_payment" ? "Smart sync retry simulated" : decision.action === "send_update_reminder" ? "Patient portal reminder sent" : "Escalated to clinical reception", detail: decision.rationale, status: decision.requiresApproval ? "blocked" : "success" },
      { id: `${payment.id}-3`, caseId: payment.id, timestamp: new Date(baseTime.getTime() + 90_000).toISOString(), kind: recovered ? "verification" : "stop", title: recovered ? "Patient appointment retained & synced" : outcome === "simulator_error" ? "Simulator error contained" : "Workflow stopped safely", detail: recovered ? `${formatInr(payment.amount)} patient value verified & synced` : decision.stopReason || "Policy stopped further automated outreach", status: recovered ? "success" : "warning" },
    ];
    return { ...payment, ...decision, outcome, recovered, events };
  });
}

const pathStyles: Record<string, string> = {
  recoverable: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "customer-action": "bg-amber-50 text-amber-700 border-amber-200",
  restricted: "bg-rose-50 text-rose-700 border-rose-200",
  "human-review": "bg-violet-50 text-violet-700 border-violet-200",
};

export default function Home() {
  const { user, logout, loginUser } = useAuth();
  const [viewMode, setViewMode] = useState<"dashboard" | "landing">("dashboard");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [cases, setCases] = useState(initialCases);
  const [selectedId, setSelectedId] = useState(initialCases[0].id);
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [activeNav, setActiveNav] = useState("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [decisionOverrides, setDecisionOverrides] = useState<Record<string, Decision>>({});
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "Google Calendar Sync Verified",
      message: "Dr. Alex Rivera's primary clinic calendar synced 14 upcoming patient follow-up appointments.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: "calendar_sync",
      read: false,
    },
    {
      id: "n-2",
      title: "Patient SMS Reminder Dispatched",
      message: "MendSync portal update link delivered to Maya Patel for appointment re-confirmation.",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      type: "patient_reminder",
      read: false,
      patientName: "Maya Patel",
      caseId: "MS-2042"
    }
  ]);

  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(() => {
    try {
      const stored = localStorage.getItem("mendsync-audit-trail");
      return stored ? JSON.parse(stored) as AuditEvent[] : processCases(initialCases).flatMap((item) => item.events);
    } catch {
      return processCases(initialCases).flatMap((item) => item.events);
    }
  });

  const results = useMemo(() => processCases(cases, decisionOverrides), [cases, decisionOverrides]);
  const selected = results.find((item) => item.id === selectedId) || results[0];
  const filtered = results.filter((item) => {
    const matchesQuery = `${item.id} ${item.customer} ${item.doctorName} ${item.department} ${item.failureReason}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (pathFilter === "all" || item.path === pathFilter);
  });

  const risk = cases.reduce((sum, item) => sum + item.amount, 0);
  const recovered = results.filter((item) => item.recovered).reduce((sum, item) => sum + item.amount, 0);
  const recoveryRate = Math.round((recovered / risk) * 100);
  const escalations = results.filter((item) => item.action === "escalate_operator").length;
  const baselineRecovered = cases.filter((item) => simulateBaseline(item) === "success").reduce((sum, item) => sum + item.amount, 0);
  const baselineLift = calculateBaselineLift(recovered, baselineRecovered);

  const syncedCount = results.filter((item) => item.gcalSynced).length;

  const handleNavClick = (label: string) => {
    setActiveNav(label);
    setMobileMenuOpen(false);
    const sectionMap: Record<string, string> = {
      Overview: "overview-section",
      "Patient Appointments": "payment-cases-section",
      "Google Calendar Sync": "gcal-sync-section",
      "Policy Controls": "policy-controls-section",
      "Audit Trail": "audit-trail-section",
    };
    const targetId = sectionMap[label];
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const exportCsv = () => {
    const csv = buildStakeholderCsv(results.map((item) => ({
      caseId: item.id, customer: item.customer, department: item.department, doctorName: item.doctorName, amount: item.amount, path: item.path, diagnosis: item.diagnosis,
      action: item.action, confidence: item.confidence, policyRule: item.policyRule,
      approvalStatus: item.requiresApproval ? "required" : "not_required", outcome: item.outcome,
      recovered: item.recovered, gcalSynced: item.gcalSynced, nextStep: item.nextStep, stopReason: item.stopReason || "",
    })), auditTrail);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mendsync-clinical-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV Stakeholder Report Downloaded", { description: "Exported patient appointment & audit dataset." });
  };

  const runBatch = async () => {
    setIsRunning(true);
    toast.info("Executing MendSync Smart Batch Sync...", { description: "Running AI diagnosis & Google Calendar scheduling." });
    setTimeout(() => {
      setIsRunning(false);
      toast.success("Batch Sync Complete", { description: "Updated patient care appointments and audit history." });
    }, 1000);
  };

  const handleToggleSingleSync = (caseId: string) => {
    setCases((prev) =>
      prev.map((item) => {
        if (item.id === caseId) {
          const nextState = !item.gcalSynced;
          toast.success(nextState ? `Appointment Synced with Google Calendar` : `Appointment Calendar Link Unlinked`, {
            description: `${item.customer} · ${item.appointmentTime}`
          });
          return {
            ...item,
            gcalSynced: nextState,
            gcalSyncStatus: nextState ? "synced" : "unlinked",
          };
        }
        return item;
      })
    );
  };

  const handleSendReminderTrigger = (caseId?: string, patientName?: string) => {
    const targetName = patientName || selected.customer;
    toast.success(`SMS Care Reminder Sent to ${targetName}`, {
      description: "Patient portal link & Google Calendar invite dispatched."
    });
  };

  if (viewMode === "landing") {
    return (
      <LandingPage
        onOpenAuth={() => setIsAuthOpen(true)}
        onEnterDashboard={() => setViewMode("dashboard")}
      />
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#162033] font-sans flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-[88px] items-center gap-3 px-6 border-b border-slate-100">
          <MendSyncLogo size="md" />
        </div>
        <div className="px-5 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Main Control</div>
        <nav className="space-y-1 p-3">
          {[
            { label: "Overview", icon: Gauge },
            { label: "Patient Appointments", icon: UserRound },
            { label: "Google Calendar Sync", icon: CalendarIcon, badge: `${syncedCount}/${cases.length}` },
            { label: "Policy Controls", icon: ShieldCheck },
            { label: "Audit Trail", icon: FileClock },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.label)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                  active ? "bg-teal-50 text-teal-900 font-bold border border-teal-200" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("size-4", active ? "text-teal-700" : "text-slate-400")} />
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto p-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setViewMode("landing")} className="w-full text-xs gap-1.5">
            <Globe className="size-3.5" /> View Landing Page
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[260px] flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            MendSync Clinical Control
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Production Ready</Badge>
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsNotificationsOpen(true)} className="relative p-2 rounded-xl border border-slate-200">
              <Bell className="size-4" />
              {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 size-4 bg-teal-600 text-white text-[9px] rounded-full grid place-items-center font-bold">{unreadNotifications}</span>}
            </button>
            <Button size="sm" onClick={() => setIsAuthOpen(true)} className="bg-teal-700 text-white text-xs h-9 px-3.5 rounded-xl">
              <User className="size-3.5 mr-1" /> Sign In
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          <section id="overview-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Care Retention Metrics</h2>
                <p className="text-xs text-slate-500">Real-time patient care synchronization analytics</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportCsv} className="h-9 text-xs rounded-xl">
                  <Download className="size-3.5 mr-1" /> Export CSV
                </Button>
                <Button size="sm" disabled={isRunning} onClick={runBatch} className="h-9 text-xs bg-teal-700 text-white rounded-xl">
                  <Play className="size-3.5 mr-1" /> {isRunning ? "Syncing..." : "Run Batch Sync"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-2xl bg-white border-slate-200"><CardContent className="p-5"><span className="text-xs text-slate-500 uppercase font-semibold">Total At-Risk Value</span><div className="text-2xl font-black text-slate-900 mt-2">{formatInr(risk)}</div></CardContent></Card>
              <Card className="rounded-2xl bg-white border-slate-200"><CardContent className="p-5"><span className="text-xs text-slate-500 uppercase font-semibold">Retained Value</span><div className="text-2xl font-black text-emerald-700 mt-2">{formatInr(recovered)}</div></CardContent></Card>
              <Card className="rounded-2xl bg-white border-slate-200"><CardContent className="p-5"><span className="text-xs text-slate-500 uppercase font-semibold">Google Calendar Synced</span><div className="text-2xl font-black text-slate-900 mt-2">{syncedCount} / {cases.length}</div></CardContent></Card>
              <Card className="rounded-2xl bg-white border-slate-200"><CardContent className="p-5"><span className="text-xs text-slate-500 uppercase font-semibold">Clinical Escalations</span><div className="text-2xl font-black text-slate-900 mt-2">{escalations}</div></CardContent></Card>
            </div>
          </section>

          <section id="gcal-sync-section">
            <GoogleCalendarWidget onSyncAll={runBatch} syncedCount={syncedCount} totalCount={cases.length} />
          </section>

          <section id="payment-cases-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Patient Appointments</h2>
              <Input placeholder="Search patient, doctor..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-64 h-9 text-xs bg-white rounded-xl" />
            </div>

            <Card className="border-slate-200 rounded-2xl bg-white overflow-hidden">
              {filtered.length === 0 ? (
                <EmptyState type="search" onAction={() => setQuery("")} />
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Patient</th>
                      <th className="py-3.5 px-4">Department & Doctor</th>
                      <th className="py-3.5 px-4">Appointment Time</th>
                      <th className="py-3.5 px-4">Value</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Google Calendar</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((item) => (
                      <tr key={item.id} onClick={() => setSelectedId(item.id)} className="hover:bg-slate-50 cursor-pointer">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.customer}</td>
                        <td className="py-3.5 px-4"><div className="font-semibold">{item.department}</div><div className="text-[10px] text-slate-500">{item.doctorName}</div></td>
                        <td className="py-3.5 px-4 text-slate-600">{item.appointmentTime}</td>
                        <td className="py-3.5 px-4 font-bold">{formatInr(item.amount)}</td>
                        <td className="py-3.5 px-4"><Badge variant="outline" className={cn("text-[10px] capitalize", pathStyles[item.path])}>{item.path}</Badge></td>
                        <td className="py-3.5 px-4">
                          <button onClick={(e) => { e.stopPropagation(); handleToggleSingleSync(item.id); }}>
                            {item.gcalSynced ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">Synced</Badge> : <Badge variant="outline" className="text-[10px]">Unlinked</Badge>}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSendReminderTrigger(item.id, item.customer); }} className="h-7 text-[11px] text-teal-700">
                            <Send className="size-3 mr-1" /> Send SMS
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </section>
        </main>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={(u) => loginUser(u)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} onMarkRead={(id) => setNotifications(n => n.map(i => i.id === id ? { ...i, read: true } : i))} onMarkAllRead={() => setNotifications(n => n.map(i => ({ ...i, read: true })))} onSendReminderTrigger={handleSendReminderTrigger} />
    </div>
  );
}
