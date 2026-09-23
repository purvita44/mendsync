import React from "react";
import { Button } from "@/components/ui/button";
import { Search, FilterX, CalendarX, BellOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type?: "search" | "calendar" | "notifications" | "audit";
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function EmptyState({
  type = "search",
  title,
  description,
  onAction,
  actionLabel,
  className
}: EmptyStateProps) {
  const defaults = {
    search: {
      icon: <FilterX className="size-8 text-slate-400" />,
      title: title || "No matching patient records found",
      description: description || "Try adjusting your search query, department filters, or care status.",
      actionLabel: actionLabel || "Clear All Filters",
    },
    calendar: {
      icon: <CalendarX className="size-8 text-teal-500" />,
      title: title || "No Google Calendar appointments pending",
      description: description || "All patient appointments for the selected timeframe are fully synchronized.",
      actionLabel: actionLabel || "Trigger Sync Scan",
    },
    notifications: {
      icon: <BellOff className="size-8 text-indigo-400" />,
      title: title || "Zero pending reminder notifications",
      description: description || "No patients are currently queued for SMS or email update dispatch.",
      actionLabel: actionLabel || "Refresh Reminders",
    },
    audit: {
      icon: <Search className="size-8 text-amber-500" />,
      title: title || "No audit events recorded",
      description: description || "System activity log will populate as care decisions and sync actions execute.",
      actionLabel: actionLabel || "Refresh Audit History",
    }
  }[type];

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl my-4", className)}>
      <div className="size-14 rounded-2xl bg-white shadow-xs border border-slate-200/80 grid place-items-center mb-3">
        {defaults.icon}
      </div>

      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{defaults.title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{defaults.description}</p>

      {onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className="mt-4 h-8 text-xs font-semibold px-4 border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5 rounded-xl"
        >
          <RefreshCw className="size-3 text-slate-500" />
          {defaults.actionLabel}
        </Button>
      )}
    </div>
  );
}
