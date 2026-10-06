import React from "react";
import { AppLayout } from "@/layouts/Layout";
import { Gauge } from "@/components/Gauge";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useGetHomeownerSummary, getGetHomeownerSummaryQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function HomeownerDashboard() {
  const { data, isLoading } = useGetHomeownerSummary({
    query: {
      refetchInterval: 5000,
      queryKey: getGetHomeownerSummaryQueryKey(),
    }
  });

  // Tank level comes from the gas weight (typed in now, load cell later).
  const hasTankData = data?.gasLevelPercent != null;
  const tankLevel = data?.gasLevelPercent ?? 0;
  const isDanger = data?.gasDetected;
  // No live reading (ESP32 off or not connected): don't show a fake "Clear".
  const noSignal = !!data?.device && data.leakLevelPercent == null;
  
  return (
    <AppLayout title="My Tank">
      <div className="space-y-6 pb-4">
        
        {/* Main Gauge Area - tank fill %, from the gas weight */}
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)] flex flex-col items-center relative overflow-hidden">
          {isDanger && (
            <div className="absolute inset-0 bg-[var(--color-error-container)]/20 animate-pulse pointer-events-none" />
          )}
          <div className="flex justify-between w-full mb-2">
            <span className="text-sm font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">Tank Level</span>
            <span className="text-xs font-mono text-[var(--color-outline)]">{data?.device?.name || 'Main Tank'}</span>
          </div>
          
          {isLoading ? (
            <Skeleton className="w-[200px] h-[200px] rounded-full my-4" />
          ) : hasTankData ? (
            <>
              <Gauge value={tankLevel} className="my-2" />
              <div className="flex gap-4 mt-6 w-full justify-center">
                <div className="flex items-center gap-1">
                  <span className="material-icons text-sm text-[var(--color-outline)]">schedule</span>
                  <span className="text-sm font-mono text-[var(--color-on-surface)]">{data?.estimatedDaysLeft ?? '--'} days left</span>
                </div>
              </div>
              {data?.device?.gasWeightKg != null && (
              <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-[var(--color-outline-variant)]">
                <div className="flex flex-col">
                  <span className="text-sm font-mono font-bold text-[var(--color-on-surface)]">
                    {(data?.device?.gasWeightKg ?? 0).toFixed(1)} of {(data?.device?.tankCapacityKg ?? 0).toFixed(1)} kg
                  </span>
                  <span className="text-xs text-[var(--color-outline)]">
                    {data?.device?.gasWeightSource === 'load_cell' ? 'From load cell' : 'Entered manually'}
                  </span>
                </div>
                <Link href="/tank" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-primary)] no-default-hover-elevate">
                  Update weight
                </Link>
              </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="material-icons text-3xl text-[var(--color-outline)]">scale</span>
              <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">Tank weight not set</span>
              <span className="text-xs text-[var(--color-outline)] max-w-[220px]">Enter how much gas is in your tank to see the level and get low-level alerts.</span>
              {data?.device && (
                <Link href="/tank" className="mt-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold px-4 py-2 rounded-full no-default-hover-elevate">
                  Enter gas weight
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Alerts / Danger Banner */}
        {isDanger && (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[var(--color-error)]/20">
            <span className="material-icons text-2xl animate-bounce">warning</span>
            <div>
              <h3 className="font-bold text-[var(--color-error)]">Gas Leak Detected!</h3>
              <p className="text-sm opacity-90">Ventilate the area immediately and do not use electrical switches. Evacuate if smell is strong.</p>
            </div>
          </div>
        )}

        {/* Low tank banner */}
        {data?.isTankLow && (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[var(--color-error)]/20">
            <span className="material-icons text-2xl">propane_tank</span>
            <div className="flex-1">
              <h3 className="font-bold text-[var(--color-error)]">Gas is running low</h3>
              <p className="text-sm opacity-90">Only {(data?.gasLevelPercent ?? 0).toFixed(0)}% left. Consider ordering a refill.</p>
            </div>
            <Link href="/order" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-error)] text-white no-default-hover-elevate">
              Order
            </Link>
          </div>
        )}

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] shadow-sm p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Leak Level</span>
            {isLoading ? (
              <Skeleton className="w-16 h-8" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-[var(--color-on-surface)]">{noSignal ? "--" : (data?.leakLevelPercent ?? 0).toFixed(0)}</span>
                <span className="text-xs text-[var(--color-outline)]">%</span>
              </div>
            )}
            <StatusBadge
              label={noSignal ? "No signal" : isDanger ? "Leak" : (data?.leakLevelPercent ?? 0) > 50 ? "Elevated" : "Clear"}
              variant={noSignal ? "warning" : isDanger ? "error" : (data?.leakLevelPercent ?? 0) > 50 ? "warning" : "safe"}
              className="self-start mt-2"
            />
          </Card>
          
          <Card className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] shadow-sm p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Status</span>
            {isLoading ? (
              <Skeleton className="w-16 h-8" />
            ) : (
              <div className="flex items-baseline gap-1 h-8 items-center">
                <span className={cn("material-icons", isDanger ? "text-[var(--color-error)]" : noSignal ? "text-[var(--color-outline)]" : "text-[var(--color-primary)]")}>
                  {isDanger || noSignal ? 'sensors_off' : 'sensors'}
                </span>
                <span className="text-sm font-bold text-[var(--color-on-surface)] ml-1">
                  {noSignal ? 'OFFLINE' : isDanger ? 'LEAK' : 'CLEAR'}
                </span>
              </div>
            )}
            <StatusBadge label={data?.device?.status === 'online' ? 'Online' : 'Offline'} variant={data?.device?.status === 'online' ? 'info' : 'warning'} className="self-start mt-2" />
          </Card>
        </div>

        {/* Active Order Card */}
        {data?.activeOrder && (
          <Card className="bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)] shadow-sm p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Incoming Delivery</span>
              <span className="text-sm font-bold text-[var(--color-on-surface)]">
                Status: <span className="capitalize">{data.activeOrder.status.replace('_', ' ')}</span>
              </span>
            </div>
            <Link href="/refills" className="bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs font-semibold px-3 py-1.5 rounded-full no-default-hover-elevate hover:bg-[var(--color-primary-container)] transition-colors">
              Track
            </Link>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link href="/order" className="w-full">
            <Button className="w-full h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-sm flex items-center gap-2 text-md">
              <span className="material-icons text-xl">add_circle</span> Order Refill
            </Button>
          </Link>
          <Link href="/analytics" className="w-full">
            <Button variant="outline" className="w-full h-14 border-[var(--color-outline-variant)] text-[var(--color-on-surface)] shadow-sm flex items-center gap-2 bg-[var(--color-surface-container-lowest)]">
              <span className="material-icons text-xl">query_stats</span> Analytics
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
