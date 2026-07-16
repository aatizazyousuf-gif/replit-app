import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "safe" | "warning" | "error" | "info" | "neutral";
  className?: string;
}

export function StatusBadge({ label, variant = "neutral", className }: BadgeProps) {
  const variants = {
    safe: "bg-[var(--color-primary-fixed)] text-[var(--color-primary)] border border-[var(--color-primary)]/20",
    warning: "bg-amber-100 text-amber-800 border border-amber-800/20",
    error: "bg-[var(--color-error-container)] text-[var(--color-on-error-container)] border border-[var(--color-error)]/20",
    info: "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] border border-[var(--color-secondary)]/20",
    neutral: "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]"
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase", variants[variant], className)}>
      {label}
    </span>
  );
}
