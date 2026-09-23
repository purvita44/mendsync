import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GoogleCalendarWidgetProps {
  onSyncAll?: () => void;
  syncedCount?: number;
  totalCount?: number;
}

export function GoogleCalendarWidget({ onSyncAll, syncedCount = 32, totalCount = 48 }: GoogleCalendarWidgetProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const handleManualSync = () => {
    if (!isConnected) {
      toast.error("Google Calendar is disconnected", {
        description: "Please enable the Google Calendar connection first."
      });
      return;
    }

    setIsSyncing(true);
    toast.info("Synchronizing appointments with Google Calendar...", {
      description: "Pushing updated care schedules and reminder slots."
    });

    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (onSyncAll) onSyncAll();
      toast.success("Google Calendar Sync Complete", {
        description: `${totalCount} appointments updated across all connected clinic calendars.`
      });
    }, 1200);
  };

  const handleToggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
      toast.warning("Google Calendar Disconnected", {
        description: "Automated event creation for patient appointments is paused."
      });
    } else {
      setIsSyncing(true);
      setTimeout(() => {
        setIsConnected(true);
        setIsSyncing(false);
        toast.success("Connected to Google Workspace", {
          description: "OAuth token verified for primary clinic calendar."
        });
      }, 800);
    }
  };

  return (
    <Card className="border-slate-200/90 shadow-sm bg-white overflow-hidden rounded-2xl">
      <CardHeader className="bg-slate-900 text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/10 backdrop-blur-md grid place-items-center text-teal-400 border border-white/10">
              <Calendar className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                Google Calendar Synchronization
                {isConnected ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                    <span className="size-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" /> Live Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px]">
                    Disconnected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs mt-0.5">
                Bi-directional sync between MendSync & Google Workspace API
              </CardDescription>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            disabled={isSyncing || !isConnected}
            onClick={handleManualSync}
            className="bg-teal-600 hover:bg-teal-500 text-white border-none font-medium text-xs h-9 px-3.5 shadow-sm rounded-xl gap-1.5"
          >
            <RefreshCw className={cn("size-3.5", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Sync Status Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Synced Ratio</span>
            <div className="text-lg font-bold text-slate-900 mt-1 flex items-baseline gap-1">
              {syncedCount} <span className="text-xs font-normal text-slate-500">/ {totalCount} Appointments</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round((syncedCount / totalCount) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Sync Time</span>
            <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <Clock className="size-4 text-teal-600" /> {lastSyncedTime}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Auto-refresh every 5 minutes</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Calendar Destination</span>
            <div className="text-xs font-bold text-slate-800 truncate mt-1 flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" /> dr.rivera@mendsync.in
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Primary Clinical Care Calendar</span>
          </div>
        </div>

        {/* Sync Controls & Settings */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={isConnected}
                onCheckedChange={handleToggleConnection}
                id="gcal-toggle"
              />
              <label htmlFor="gcal-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Google Calendar Integration
              </label>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
                id="auto-sync-toggle"
              />
              <label htmlFor="auto-sync-toggle" className="text-xs font-medium text-slate-600 cursor-pointer">
                Real-Time Push
              </label>
            </div>
          </div>

          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
          >
            Open Google Calendar <ExternalLink className="size-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
