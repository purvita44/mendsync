import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Calendar, MessageSquare, AlertTriangle, Send, CheckCheck, Clock } from "lucide-react";
import { type NotificationItem } from "@shared/recovery";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSendReminderTrigger?: (caseId?: string, patientName?: string) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSendReminderTrigger
}: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.read;
    if (activeTab === "calendar") return item.type === "calendar_sync";
    if (activeTab === "reminders") return item.type === "patient_reminder";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "calendar_sync":
        return <Calendar className="size-4 text-teal-600" />;
      case "patient_reminder":
        return <MessageSquare className="size-4 text-indigo-600" />;
      case "escalation":
        return <AlertTriangle className="size-4 text-amber-600" />;
      default:
        return <Bell className="size-4 text-slate-600" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col bg-white border-l border-slate-200">
        <SheetHeader className="p-5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-teal-500/20 text-teal-400 grid place-items-center">
                <Bell className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-white flex items-center gap-2">
                  Notifications & Reminders
                  {unreadCount > 0 && (
                    <Badge className="bg-teal-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2">
                      {unreadCount} New
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription className="text-slate-300 text-xs mt-0.5">
                  Real-time care reminders & Google Calendar sync alerts
                </SheetDescription>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                className="text-xs text-teal-400 hover:text-white hover:bg-white/10 h-8 px-2"
              >
                <CheckCheck className="size-3.5 mr-1" /> Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 bg-slate-200/80 p-0.5 rounded-lg text-xs">
              <TabsTrigger value="all" className="text-[11px] py-1">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread" className="text-[11px] py-1">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="calendar" className="text-[11px] py-1">Calendar</TabsTrigger>
              <TabsTrigger value="reminders" className="text-[11px] py-1">Reminders</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="size-12 rounded-full bg-slate-100 text-slate-400 grid place-items-center mx-auto">
                <Bell className="size-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No notifications found</p>
              <p className="text-[11px] text-slate-500">You're all caught up with patient care alerts.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3.5 rounded-xl border transition-all relative group",
                  item.read
                    ? "bg-white border-slate-200/80 opacity-80"
                    : "bg-teal-50/40 border-teal-200/80 shadow-xs"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="size-3" /> {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                    {item.patientName && (
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500">
                          Patient: <strong className="text-slate-800">{item.patientName}</strong>
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (onSendReminderTrigger) onSendReminderTrigger(item.caseId, item.patientName);
                            toast.success(`SMS Reminder Dispatched to ${item.patientName}`, {
                              description: "Secure patient portal link delivered via MendSync messaging."
                            });
                          }}
                          className="h-7 text-[10px] px-2.5 border-teal-300 text-teal-700 hover:bg-teal-50 gap-1 rounded-lg"
                        >
                          <Send className="size-3" /> Resend SMS
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={() => onMarkRead(item.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Mark as read"
                  >
                    <Check className="size-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
