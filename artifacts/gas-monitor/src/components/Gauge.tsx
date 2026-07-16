import React from "react";
import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number; // 0 to 100
  className?: string;
  size?: number;
}

export function Gauge({ value, className, size = 200 }: GaugeProps) {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = -220;
  const endAngle = 40;
  const strokeWidth = 16;
  
  // Convert degrees to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

  const pct = Math.max(0, Math.min(100, value));
  const currentAngle = startAngle + (pct / 100) * (endAngle - startAngle);
  const currentRad = (currentAngle * Math.PI) / 180;
  
  const xCurrent = cx + r * Math.cos(currentRad);
  const yCurrent = cy + r * Math.sin(currentRad);
  const currentArcFlag = currentAngle - startAngle <= 180 ? "0" : "1";
  
  const currentPathData = `M ${x1} ${y1} A ${r} ${r} 0 ${currentArcFlag} 1 ${xCurrent} ${yCurrent}`;
  
  const getColor = (p: number) => {
    if (p > 50) return "var(--color-primary-container)";
    if (p > 20) return "var(--color-tertiary-container)";
    return "var(--color-error)";
  };
  
  const color = getColor(pct);

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="w-full h-full transform transition-transform">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
          </filter>
        </defs>
        
        {/* Background Arc */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--color-surface-dim)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value Arc */}
        <path
          d={currentPathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Needle/Dot */}
        <circle
          cx={xCurrent}
          cy={yCurrent}
          r={strokeWidth / 1.5}
          fill="var(--color-surface)"
          stroke={color}
          strokeWidth="3"
          className="transition-all duration-1000 ease-out shadow-sm"
        />
      </svg>
      
      <div className="absolute flex flex-col items-center justify-center text-center translate-y-4">
        <span className="text-4xl font-bold font-mono tracking-tighter" style={{ color: 'var(--color-on-surface)' }}>
          {pct.toFixed(0)}%
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {pct > 50 ? 'Safe' : pct > 20 ? 'Low' : 'Critical'}
        </span>
      </div>
    </div>
  );
}
