import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const homeownerItems = [
  { label: "Home", icon: "home", href: "/dashboard" },
  { label: "Analytics", icon: "insights", href: "/analytics" },
  { label: "Refills", icon: "local_shipping", href: "/refills" },
  { label: "Setup", icon: "sensors", href: "/setup" },
  { label: "Chat", icon: "chat", href: "/chat" },
];

const supplierItems = [
  { label: "Home", icon: "home", href: "/supplier/dashboard" },
  { label: "Customers", icon: "people", href: "/supplier/customers" },
  { label: "Dispatch", icon: "rv_hookup", href: "/supplier/dispatch" },
  { label: "Inventory", icon: "inventory_2", href: "/supplier/inventory" },
  { label: "Analytics", icon: "bar_chart", href: "/supplier/analytics" },
];

export function AppLayout({ children, title }: { children: React.ReactNode, title?: string }) {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/login");
      }
    });
  };

  if (!user) return <>{children}</>;

  const items = user.role === "homeowner" ? homeownerItems : supplierItems;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-surface)] text-[var(--color-on-surface)] pb-16 relative w-full max-w-[430px] mx-auto overflow-x-hidden shadow-2xl sm:border-x sm:border-[var(--color-outline-variant)]">
      <header className="sticky top-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-outline-variant)] px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight text-[var(--color-primary)]">
          {title || "Gas Monitor"}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)]" title="Logout">
            <span className="material-icons">logout</span>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col w-full h-full p-4 overflow-y-auto">
        {children}
      </main>

      <BottomNav items={items} />
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-surface)] text-[var(--color-on-surface)] w-full max-w-[430px] mx-auto overflow-x-hidden shadow-2xl sm:border-x sm:border-[var(--color-outline-variant)]">
      <main className="flex-1 flex flex-col p-6 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center mb-4 shadow-md">
              <span className="material-icons text-3xl text-[var(--color-on-primary-container)]">propane</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">Gas Monitor</h1>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 text-center">Industrial-grade precision, home-ready safety.</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
