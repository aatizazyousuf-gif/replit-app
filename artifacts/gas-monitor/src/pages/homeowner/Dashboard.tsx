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

  const level = data?.gasLevelPercent ?? 0;
  const isDanger = data?.gasDetected;
  
  return (
    <AppLayout title="My Tank">
      <div className="space-y-6 pb-4">
        
        {/* Main Gauge Area */}
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)] flex flex-col items-center relative overflow-hidden">
          {isDanger && (
            <div className="absolute inset-0 bg-[var(--color-error-container)]/20 animate-pulse pointer-events-none" />
          )}
          <div className="flex justify-between w-full mb-2">
            <span className="text-sm font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">Gas Level</span>
            <span className="text-xs font-mono text-[var(--color-outline)]">{data?.device?.name || 'Main Tank'}</span>
          </div>
          
          {isLoading ? (
            <Skeleton className="w-[200px] h-[200px] rounded-full my-4" />
          ) : (
            <Gauge value={level} className="my-2" />
          )}

          <div className="flex gap-4 mt-6 w-full justify-center">
            {isLoading ? (
              <Skeleton className="w-20 h-6" />
            ) : (
              <div className="flex items-center gap-1">
                <span className="material-icons text-sm text-[var(--color-outline)]">schedule</span>
                <span className="text-sm font-mono text-[var(--color-on-surface)]">{data?.estimatedDaysLeft ?? '--'} days left</span>
              </div>
            )}
          </div>
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

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] shadow-sm p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Pressure</span>
            {isLoading ? (
              <Skeleton className="w-16 h-8" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-[var(--color-on-surface)]">{data?.pressurePa ?? 0}</span>
                <span className="text-xs text-[var(--color-outline)]">Pa</span>
              </div>
            )}
            <StatusBadge label="Normal" variant="safe" className="self-start mt-2" />
          </Card>
          
          <Card className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] shadow-sm p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Status</span>
            {isLoading ? (
              <Skeleton className="w-16 h-8" />
            ) : (
              <div className="flex items-baseline gap-1 h-8 items-center">
                <span className={cn("material-icons", isDanger ? "text-[var(--color-error)]" : "text-[var(--color-primary)]")}>
                  {isDanger ? 'sensors_off' : 'sensors'}
                </span>
                <span className="text-sm font-bold text-[var(--color-on-surface)] ml-1">
                  {isDanger ? 'LEAK' : 'CLEAR'}
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
