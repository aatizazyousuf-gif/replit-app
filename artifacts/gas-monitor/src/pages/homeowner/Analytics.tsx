import React, { useState } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetUsageAnalytics, getGetUsageAnalyticsQueryKey } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomeownerAnalytics() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  
  const { data, isLoading } = useGetUsageAnalytics(
    { period },
    { query: { queryKey: getGetUsageAnalyticsQueryKey({ period }) } }
  );

  return (
    <AppLayout title="Usage Analytics">
      <div className="space-y-6">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[var(--color-surface-container)] rounded-lg p-1">
            <TabsTrigger value="daily" className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="bg-[var(--color-surface-container-lowest)] p-4 shadow-sm border border-[var(--color-outline-variant)]">
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--color-on-surface)]">Gas Consumption</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Average level percentage over time</p>
          </div>
          
          <div className="h-64 w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)" }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "var(--color-surface-container-highest)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                    itemStyle={{ color: "var(--color-on-surface)" }}
                  />
                  <Area type="monotone" dataKey="avgLevel" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorAvg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-[var(--color-on-surface-variant)]">
                No data available for this period.
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[var(--color-surface-container-high)] p-4 shadow-sm border border-[var(--color-outline-variant)]">
            <span className="material-icons text-[var(--color-secondary)] mb-2 block">insights</span>
            <h4 className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Avg Daily Drop</h4>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[var(--color-on-surface)]">1.2</span>
              <span className="text-xs text-[var(--color-outline)]">%</span>
            </div>
          </Card>
          <Card className="bg-[var(--color-surface-container-high)] p-4 shadow-sm border border-[var(--color-outline-variant)]">
            <span className="material-icons text-[var(--color-tertiary-container)] mb-2 block">calendar_today</span>
            <h4 className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Est. Empty Date</h4>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-sm font-bold text-[var(--color-on-surface)]">Nov 24</span>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
