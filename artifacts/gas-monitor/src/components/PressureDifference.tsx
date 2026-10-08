import React from "react";
import { StatusBadge } from "@/components/StatusBadge";

// Below this the reading is just sensor noise around zero: treat as "no flow".
const NO_FLOW_DEADBAND_PA = 15;

/**
 * Pressure difference across the orifice plate (MPXV7002DP differential
 * sensor), in kPa, with a simple "Gas flowing" / "No flow" label.
 */
export function PressureDifference({ pressurePa }: { pressurePa: number }) {
  const flowing = Math.abs(pressurePa) > NO_FLOW_DEADBAND_PA;

  return (
    <div className="w-full mt-4 pt-4 border-t border-[var(--color-outline-variant)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">
          Pressure Difference
        </span>
        <StatusBadge label={flowing ? "Gas flowing" : "No flow"} variant={flowing ? "safe" : "info"} />
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-3xl font-bold font-mono text-[var(--color-on-surface)]">{(pressurePa / 1000).toFixed(3)}</span>
        <span className="text-sm text-[var(--color-outline)]">kPa</span>
      </div>
    </div>
  );
}
