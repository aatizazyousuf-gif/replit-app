import React from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetSupplierSummary } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "wouter";
import { format } from "date-fns";

export default function SupplierDashboard() {
  const { data, isLoading } = useGetSupplierSummary();

  return (
    <AppLayout title="Operations Hub">
      <div className="space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] shadow-sm">
            <span className="material-icons text-[var(--color-primary)] mb-2 block">rv_hookup</span>
            <div className="text-2xl font-bold font-mono text-[var(--color-on-surface)]">
              {isLoading ? <Skeleton className="h-8 w-12" /> : data?.activeDispatches ?? 0}
            </div>
            <div className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase mt-1">Active Dispatches</div>
          </Card>
          
          <Card className="bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] shadow-sm">
            <span className="material-icons text-[var(--color-secondary)] mb-2 block">pending_actions</span>
            <div className="text-2xl font-bold font-mono text-[var(--color-on-surface)]">
              {isLoading ? <Skeleton className="h-8 w-12" /> : data?.pendingOrders ?? 0}
            </div>
            <div className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase mt-1">Pending Orders</div>
          </Card>

          <Card className="bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] shadow-sm">
            <span className="material-icons text-[var(--color-tertiary-container)] mb-2 block">people</span>
            <div className="text-2xl font-bold font-mono text-[var(--color-on-surface)]">
              {isLoading ? <Skeleton className="h-8 w-12" /> : data?.totalCustomers ?? 0}
            </div>
            <div className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase mt-1">Total Customers</div>
          </Card>

          <Card className="bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] shadow-sm bg-gradient-to-br from-[var(--color-surface-container-lowest)] to-[var(--color-surface-container)]">
            <span className="material-icons text-emerald-600 mb-2 block">payments</span>
            <div className="text-2xl font-bold font-mono text-[var(--color-on-surface)]">
              {isLoading ? <Skeleton className="h-8 w-20" /> : `$${(data?.monthlyRevenue ?? 0).toLocaleString()}`}
            </div>
            <div className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase mt-1">Monthly Rev</div>
          </Card>
        </div>

        {/* Action Queue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--color-on-surface)]">Action Queue</h3>
            <Link href="/supplier/dispatch" className="text-xs font-bold text-[var(--color-primary)] uppercase">View All</Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.map(order => (
                <Card key={order.id} className="bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] shadow-sm rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[var(--color-on-surface)]">Order #{order.id}</span>
                      {order.deliveryType === 'emergency' && <StatusBadge label="Emergency" variant="error" />}
                      {order.deliveryType === 'express' && <StatusBadge label="Express" variant="info" />}
                    </div>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">{order.volumeGallons} gal • {format(new Date(order.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge label={order.status.replace('_', ' ')} variant={order.status === 'pending' ? 'warning' : 'neutral'} />
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-outline-variant)]">
                Queue is empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
