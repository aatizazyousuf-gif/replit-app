import React, { useState } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetRevenueAnalytics, getGetRevenueAnalyticsQueryKey } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SupplierAnalytics() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  
  const { data, isLoading } = useGetRevenueAnalytics(
    { period },
    { query: { queryKey: getGetRevenueAnalyticsQueryKey({ period }) } }
  );

  return (
    <AppLayout title="Revenue & Performance">
      <div className="space-y-6">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[var(--color-surface-container)] rounded-lg p-1">
            <TabsTrigger value="daily" className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="bg-[var(--color-surface-container-lowest)] p-4 shadow-sm border border-[var(--color-outline-variant)]">
          <div className="mb-4 flex justify-between items-end">
            <div>
              <h3 className="font-semibold text-[var(--color-on-surface)]">Gross Revenue</h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">Completed orders only</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-[var(--color-primary)]">
                ${data ? data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString() : '0'}
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)", fontFamily: "var(--font-mono)" }} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "var(--color-surface-container-highest)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                    cursor={{ fill: 'var(--color-surface-container-low)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-[var(--color-on-surface-variant)]">
                No data available for this period.
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-[var(--color-surface-container-lowest)] p-4 shadow-sm border border-[var(--color-outline-variant)]">
          <div className="mb-4 flex justify-between items-end">
            <div>
              <h3 className="font-semibold text-[var(--color-on-surface)]">Order Volume</h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">Total deliveries completed</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-[var(--color-secondary)]">
                {data ? data.reduce((sum, d) => sum + d.orders, 0).toLocaleString() : '0'}
              </span>
            </div>
          </div>
          
          <div className="h-40 w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)", fontFamily: "var(--font-mono)" }} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "var(--color-surface-container-highest)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                    cursor={{ fill: 'var(--color-surface-container-low)' }}
                    formatter={(value: number) => [value, 'Orders']}
                  />
                  <Bar dataKey="orders" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-[var(--color-on-surface-variant)]">
                No data available.
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
