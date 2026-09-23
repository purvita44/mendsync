export type FailureReason =
  | "network_error"
  | "bank_unavailable"
  | "insufficient_funds"
  | "expired_card"
  | "invalid_payment_method"
  | "suspected_fraud"
  | "unknown_error";

export type CasePath = "recoverable" | "customer-action" | "restricted" | "human-review";
export type RecoveryAction = "retry_payment" | "send_update_reminder" | "escalate_operator" | "stop";
export type SimulationOutcome = "success" | "temporary_failure" | "permanent_failure" | "simulator_error";

export type CalendarSyncStatus = "synced" | "pending" | "failed" | "unlinked";

export type PaymentCase = {
  id: string;
  customer: string;
  initials: string;
  amount: number;
  plan: string;
  department: string;
  doctorName: string;
  appointmentTime: string;
  failureReason: FailureReason;
  retryCount: number;
  consent: boolean;
  recoverability: number;
  fraudFlag: boolean;
  daysSinceFailure: number;
  previousPayments: number;
  outcomeSeed: number;
  gcalSynced: boolean;
  gcalEventId?: string;
  gcalSyncStatus: CalendarSyncStatus;
  lastReminderSentAt?: string;
  reminderCount: number;
};

export type Decision = {
  path: CasePath;
  action: RecoveryAction;
  diagnosis: string;
  rationale: string;
  confidence: number;
  policyRule: string;
  requiresApproval: boolean;
  nextStep: string;
  stopReason?: string;
};

export type AuditEvent = {
  id: string;
  caseId: string;
  timestamp: string;
  kind: "diagnosis" | "action" | "verification" | "stop" | "escalation" | "calendar_sync" | "reminder_sent";
  title: string;
  detail: string;
  status: "success" | "warning" | "blocked" | "info";
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "calendar_sync" | "patient_reminder" | "escalation" | "system";
  read: boolean;
  patientName?: string;
  caseId?: string;
};

const names = [
  "Maya Patel", "Arjun Mehta", "Sara Iyer", "Kabir Shah", 
  "Nisha Rao", "Rohan Gupta", "Aditi Menon", "Vikram Das", 
  "Neha Kapoor", "Dev Malhotra", "Ananya Verma", "Siddharth Joshi"
];

const departments = [
  "Cardiology & Vascular",
  "Orthopedics & Spine",
  "Neurology Care",
  "Pediatric Medicine",
  "General Wellness",
  "Oncology Consultation",
  "Dermatology & Care"
];

const doctors = [
  "Dr. Alex Rivera, MD",
  "Dr. Priya Sharma, MBBS",
  "Dr. Marcus Vance, FACC",
  "Dr. Elena Rostova, PhD",
  "Dr. Rajesh Kulkarni, MS"
];

const reasons: FailureReason[] = [
  "network_error", "bank_unavailable", "insufficient_funds", 
  "expired_card", "invalid_payment_method", "suspected_fraud", "unknown_error"
];

const amounts = [1299, 2499, 4999, 7999, 999, 3499, 5999];
const MIN_COOLING_DAYS = 1;

export function generateBatch(seed = 42, count = 48): PaymentCase[] {
  let state = seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const now = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const customer = names[index % names.length];
    const failureReason = reasons[Math.floor(random() * reasons.length)];
    const fraudFlag = failureReason === "suspected_fraud" || random() < 0.035;
    const consent = random() > 0.12;
    const retryCount = Math.floor(random() * 4);
    const recoverability = Math.round((fraudFlag ? 0.08 : failureReason === "expired_card" ? 0.22 : 0.48 + random() * 0.46) * 100) / 100;
    
    const appointmentDate = new Date(now + (index * 4 - 20) * 3600 * 1000 * 6);
    const gcalSynced = random() > 0.35;
    const gcalSyncStatus: CalendarSyncStatus = gcalSynced ? "synced" : (random() > 0.5 ? "pending" : "unlinked");

    return {
      id: `MS-${String(2042 + index).padStart(4, "0")}`,
      customer,
      initials: customer.split(" ").map((part) => part[0]).join(""),
      amount: amounts[Math.floor(random() * amounts.length)],
      plan: ["Consultation & Sync", "Full Retention Care", "Specialist Follow-up"][index % 3],
      department: departments[index % departments.length],
      doctorName: doctors[index % doctors.length],
      appointmentTime: appointmentDate.toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      }),
      failureReason,
      retryCount,
      consent,
      recoverability,
      fraudFlag,
      daysSinceFailure: 1 + Math.floor(random() * 9),
      previousPayments: 2 + Math.floor(random() * 22),
      outcomeSeed: random(),
      gcalSynced,
      gcalEventId: gcalSynced ? `gcal_${Date.now()}_${index}` : undefined,
      gcalSyncStatus,
      reminderCount: Math.floor(random() * 3),
      lastReminderSentAt: random() > 0.4 ? new Date(now - Math.floor(random() * 48) * 3600 * 1000).toISOString() : undefined
    };
  });
}

export function classifyCase(payment: PaymentCase): Decision {
  if (payment.fraudFlag || payment.failureReason === "suspected_fraud") {
    return {
      path: "restricted",
      action: "escalate_operator",
      diagnosis: "Restricted Patient File Security Alert",
      rationale: "Fraud or security compliance triggers require human compliance review before automated reminder or sync contact.",
      confidence: 0.96,
      policyRule: "HIPAA-R07 · Restricted Patient Account",
      requiresApproval: true,
      nextStep: "Escalated to Compliance Officer",
      stopReason: "Automated sync paused due to security policy flag"
    };
  }
  if (!payment.consent) {
    return {
      path: "human-review",
      action: "escalate_operator",
      diagnosis: "Patient Contact Preference Missing",
      rationale: "Patient SMS/Email opt-in consent is not recorded. MendSync routes this appointment to manual staff outreach.",
      confidence: 0.98,
      policyRule: "MEND-R04 · Patient Consent Gate",
      requiresApproval: true,
      nextStep: "Staff member to confirm consent via phone",
      stopReason: "No active communication consent"
    };
  }
  if (payment.daysSinceFailure < MIN_COOLING_DAYS) {
    return {
      path: "human-review",
      action: "stop",
      diagnosis: "Cooling Window Active",
      rationale: "To avoid patient message fatigue, retries and automated reminders are paused for a mandatory 24h cooling period.",
      confidence: 1,
      policyRule: "MEND-R01 · 24h Patient Cooling Window",
      requiresApproval: false,
      nextStep: "Automated re-evaluation scheduled",
      stopReason: "Patient cooling period active"
    };
  }
  if (payment.retryCount >= 3) {
    return {
      path: "human-review",
      action: "escalate_operator",
      diagnosis: "Reminder & Sync Attempts Maxed",
      rationale: "Maximum of 3 automated reminder notifications sent without patient response. Routing to clinical reception desk.",
      confidence: 0.99,
      policyRule: "MEND-R05 · Terminal Attempt Budget",
      requiresApproval: true,
      nextStep: "Direct clinical team outreach required",
      stopReason: "Max automated attempts reached"
    };
  }
  if (payment.failureReason === "expired_card" || payment.failureReason === "invalid_payment_method") {
    return {
      path: "customer-action",
      action: "send_update_reminder",
      diagnosis: "Payment Method Requires Update",
      rationale: "Automated dispatch of MendSync secure SMS/email portal link for patient payment card renewal.",
      confidence: 0.93,
      policyRule: "MEND-R02 · Patient Portal Link Dispatch",
      requiresApproval: false,
      nextStep: "Awaiting patient payment update via MendSync Portal"
    };
  }

  return {
    path: "recoverable",
    action: "retry_payment",
    diagnosis: "Recoverable Care Appointment",
    rationale: "Transient payment network failure. Scheduled for automated smart retry and Google Calendar synchronization.",
    confidence: 0.89,
    policyRule: "MEND-R03 · Bounded Smart Sync Retry",
    requiresApproval: false,
    nextStep: "Execute background sync & recovery"
  };
}

export function validateDecision(decision: Decision): Decision {
  return decision;
}

export function authorizeDecision(payment: { consent: boolean; fraudFlag: boolean; retryCount: number; daysSinceFailure: number }, decision: Decision): Decision {
  if (payment.fraudFlag) {
    return {
      ...decision,
      path: "restricted",
      action: "escalate_operator",
      requiresApproval: true,
      stopReason: "Security compliance flag"
    };
  }
  return decision;
}

export function simulateAction(payment: PaymentCase, decision: Decision): SimulationOutcome {
  if (decision.action === "stop") return "permanent_failure";
  if (decision.requiresApproval) return "temporary_failure";
  if (payment.outcomeSeed > 0.88) return "simulator_error";

  if (decision.action === "retry_payment") {
    return payment.recoverability > 0.3 ? "success" : "temporary_failure";
  }

  if (decision.action === "send_update_reminder") {
    return payment.consent && payment.recoverability > 0.2 ? "success" : "temporary_failure";
  }

  return "temporary_failure";
}

export function simulateBaseline(payment: PaymentCase): SimulationOutcome {
  if (payment.fraudFlag || !payment.consent || payment.retryCount >= 3) return "permanent_failure";
  return payment.recoverability > 0.5 ? "success" : "temporary_failure";
}

export function calculateBaselineLift(recovered: number, baselineRecovered: number): number {
  if (baselineRecovered <= 0) return recovered > 0 ? 100 : 0;
  return Math.round(((recovered - baselineRecovered) / baselineRecovered) * 100);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function buildStakeholderCsv(results: Array<any>, auditEvents: AuditEvent[]): string {
  const headers = [
    "Case ID", "Patient Name", "Department", "Doctor", "Amount (INR)", "Path", 
    "Diagnosis", "Action", "Confidence", "Policy Rule", "Approval Required", 
    "Outcome", "Recovered", "Google Calendar Synced", "Next Step"
  ];
  
  const rows = results.map((item) => [
    item.caseId || item.id,
    `"${item.customer}"`,
    `"${item.department || "General"}"`,
    `"${item.doctorName || "Staff"}"`,
    item.amount,
    item.path,
    `"${item.diagnosis}"`,
    item.action,
    item.confidence,
    `"${item.policyRule}"`,
    item.approvalStatus || (item.requiresApproval ? "Yes" : "No"),
    item.outcome,
    item.recovered ? "Yes" : "No",
    item.gcalSynced ? "Yes" : "No",
    `"${item.nextStep}"`
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
