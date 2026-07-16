import React from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetRefillOrders, getGetRefillOrdersQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function HomeownerRefills() {
  const { data: orders, isLoading } = useGetRefillOrders();

  const activeOrders = orders?.filter(o => o.status !== "delivered" && o.status !== "cancelled") || [];
  const pastOrders = orders?.filter(o => o.status === "delivered" || o.status === "cancelled") || [];

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending": return 1;
      case "dispatched": return 2;
      case "en_route": return 3;
      case "delivered": return 4;
      default: return 0;
    }
  };

  return (
    <AppLayout title="Refills & Deliveries">
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-[var(--color-on-surface)]">Active Delivery</h3>
                {activeOrders.map(order => {
                  const step = getStatusStep(order.status);
                  return (
                    <Card key={order.id} className="bg-[var(--color-surface-container-lowest)] p-5 shadow-md border border-[var(--color-primary)]/30 rounded-2xl">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-xs font-mono text-[var(--color-outline)]">ORDER #{order.id}</p>
                          <h4 className="font-bold text-lg text-[var(--color-primary)] capitalize">{order.deliveryType} Refill</h4>
                        </div>
                        <StatusBadge 
                          label={order.status.replace('_', ' ')} 
                          variant={order.status === 'en_route' ? 'info' : 'warning'} 
                        />
                      </div>

                      {/* Progress Bar */}
                      <div className="relative mb-6">
                        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-[var(--color-surface-dim)] rounded-full"></div>
                        <div className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-[var(--color-primary)] rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
                        
                        <div className="relative flex justify-between">
                          {["Received", "Dispatched", "En Route", "Done"].map((label, idx) => (
                            <div key={label} className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 transition-colors", 
                                step > idx ? "bg-[var(--color-primary)] border-[var(--color-primary)]" : "bg-[var(--color-surface)] border-[var(--color-surface-dim)]",
                                step === idx + 1 && "ring-2 ring-[var(--color-primary-fixed)] ring-offset-1 bg-[var(--color-surface)] border-[var(--color-primary)]"
                              )} />
                              <span className={cn("text-[10px] uppercase font-semibold", step >= idx + 1 ? "text-[var(--color-primary)]" : "text-[var(--color-outline)]")}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(order.driverName || order.estimatedArrival) && (
                        <div className="bg-[var(--color-surface-container)] rounded-lg p-3 flex items-center justify-between text-sm">
                          {order.driverName && (
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-[var(--color-secondary)]">badge</span>
                              <span className="font-medium">{order.driverName}</span>
                            </div>
                          )}
                          {order.estimatedArrival && (
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-[var(--color-outline)]">schedule</span>
                              <span className="font-mono font-medium">{format(new Date(order.estimatedArrival), 'h:mm a')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-bold text-[var(--color-on-surface)] mt-4">History</h3>
              {pastOrders.length === 0 ? (
                <div className="text-center py-8 text-sm text-[var(--color-on-surface-variant)]">No past orders.</div>
              ) : (
                pastOrders.map(order => (
                  <Card key={order.id} className="bg-[var(--color-surface-container-lowest)] p-4 shadow-sm border border-[var(--color-outline-variant)] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center">
                        <span className="material-icons text-[var(--color-on-surface-variant)]">
                          {order.status === 'delivered' ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-on-surface)] capitalize">{order.deliveryType}</p>
                        <p className="text-xs text-[var(--color-on-surface-variant)]">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-mono text-[var(--color-on-surface)]">${order.totalPrice.toFixed(2)}</p>
                      <StatusBadge 
                        label={order.status} 
                        variant={order.status === 'delivered' ? 'safe' : 'error'} 
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
