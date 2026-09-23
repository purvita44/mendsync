import React from "react";
import { cn } from "@/lib/utils";

interface MendSyncLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function MendSyncLogo({ className, size = "md", showText = true }: MendSyncLogoProps) {
  const iconSizeClass = {
    sm: "size-7",
    md: "size-9",
    lg: "size-12",
  }[size];

  const textClass = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-xl bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-900 text-white shadow-md shadow-teal-950/20 ring-1 ring-white/20 transition-transform hover:scale-105",
          iconSizeClass
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-3/5"
        >
          {/* Calendar Ring Sync */}
          <path
            d="M3 12a9 9 0 0 1 15-6.7M21 12a9 9 0 0 1-15 6.7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="opacity-70"
          />
          {/* Heartbeat Pulse */}
          <path
            d="M5 12h3l2-5 3 10 2-5h4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={cn("font-extrabold tracking-tight text-slate-900 leading-none flex items-center gap-1.5", textClass)}>
            <span>Mend</span>
            <span className="text-teal-600 font-black">Sync</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60 ml-0.5">
              PRO
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 tracking-normal mt-0.5">
            Patient Care & Calendar Sync
          </span>
        </div>
      )}
    </div>
  );
}
